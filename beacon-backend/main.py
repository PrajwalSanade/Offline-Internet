"""
Beacon Network - Offline Internet Emergency Communication System
FastAPI Backend Application
"""

import uuid
import hashlib
from datetime import datetime, timedelta
from typing import List
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from database import get_db, init_db
from models import Device, Message, MarketplaceListing
from schemas import (
    DeviceRegisterRequest,
    DeviceResponse,
    MessageSendRequest,
    MessageBroadcastRequest,
    MessageResponse,
    MarketplaceListingCreateRequest,
    MarketplaceListingUpdateRequest,
    MarketplaceListingResolveRequest,
    MarketplaceListingResponse,
    SuccessResponse,
)
from encryption import encryption_manager


# Initialize FastAPI app
app = FastAPI(
    title="Beacon Network API",
    description="Offline Internet Emergency Communication System",
    version="1.0.0",
)

# In production, set ALLOWED_ORIGINS to your deployed frontend domain(s), comma-separated.
# Add CORS middleware
import os

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Startup Event ====================

@app.on_event("startup")
def startup_event():
    """Initialize database on startup."""
    init_db()


# ==================== Helper Functions ====================

def generate_id() -> str:
    """Generate a UUID for entities."""
    return str(uuid.uuid4())


def calculate_message_hash(source_id: str, destination_id: str, content: str) -> str:
    """
    Calculate SHA-256 hash of message for duplicate detection.

    The hash is computed from source_id, destination_id and content only.
    Timestamp is intentionally excluded so that identical messages sent
    at different times will be detected as duplicates.

    Returns the SHA-256 hex digest.
    """
    message_data = f"{source_id}:{destination_id}:{content}"
    return hashlib.sha256(message_data.encode()).hexdigest()


def is_message_duplicate(db: Session, message_hash: str) -> bool:
    """
    Check if message hash already exists in database.
    
    Args:
        db: Database session
        message_hash: Hash of the message
        
    Returns:
        True if duplicate exists, False otherwise
    """
    existing = db.query(Message).filter(Message.message_hash == message_hash).first()
    return existing is not None


# ==================== Device Endpoints ====================

@app.post("/register-device", response_model=DeviceResponse)
def register_device(
    request: DeviceRegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new device in the network.
    
    Args:
        request: Device registration details
        db: Database session
        
    Returns:
        Registered device information
    """
    device_id = generate_id()
    
    device = Device(
        device_id=device_id,
        name=request.name,
        location=request.location,
        device_type=request.device_type,
        status="online",
        created_at=datetime.now(),
    )
    
    db.add(device)
    db.commit()
    db.refresh(device)
    
    return device


@app.get("/nodes", response_model=List[DeviceResponse])
def get_nodes(
    status: str = None,
    db: Session = Depends(get_db)
):
    """
    Get all registered devices/nodes in the network.
    
    Args:
        status: Optional filter by device status
        db: Database session
        
    Returns:
        List of all registered devices
    """
    query = db.query(Device).filter(Device.is_active == True)
    
    if status:
        query = query.filter(Device.status == status)
    
    # Order by creation time so most recently registered devices appear first
    devices = query.order_by(desc(Device.created_at)).all()
    return devices


# ==================== Message Endpoints ====================

@app.post("/send-message", response_model=MessageResponse)
def send_message(
    request: MessageSendRequest,
    db: Session = Depends(get_db)
):
    """
    Send a direct or broadcast message.
    
    Args:
        request: Message details
        db: Database session
        
    Returns:
        Created message information
        
    Raises:
        HTTPException: If source device doesn't exist or message is duplicate
    """
    # Verify source device exists
    source_device = db.query(Device).filter(Device.device_id == request.source_id).first()
    if not source_device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source device not found"
        )
    
    # Verify destination device exists (if not broadcast)
    if request.destination_id and not request.is_broadcast:
        dest_device = db.query(Device).filter(Device.device_id == request.destination_id).first()
        if not dest_device:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Destination device not found"
            )
    
    # Encrypt content if requested
    content = request.content
    if request.is_encrypted:
        content = encryption_manager.encrypt(request.content)
    
    # Generate message hash for duplicate detection (excludes timestamp)
    message_hash = calculate_message_hash(
        request.source_id,
        request.destination_id or "broadcast",
        request.content,
    )
    
    # Check for duplicates
    if is_message_duplicate(db, message_hash):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Duplicate message detected"
        )
    
    message_id = generate_id()
    
    message = Message(
        message_id=message_id,
        source_id=request.source_id,
        destination_id=request.destination_id,
        content=content,
        is_encrypted=request.is_encrypted,
        hop_count=0,
        max_hops=request.max_hops,
        is_broadcast=request.is_broadcast,
        message_hash=message_hash,
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    return message


@app.post("/broadcast", response_model=MessageResponse)
def broadcast_message(
    request: MessageBroadcastRequest,
    db: Session = Depends(get_db)
):
    """
    Broadcast a message to all devices in the network.
    
    Args:
        request: Broadcast message details
        db: Database session
        
    Returns:
        Created broadcast message information
        
    Raises:
        HTTPException: If source device doesn't exist or message is duplicate
    """
    # Verify source device exists
    source_device = db.query(Device).filter(Device.device_id == request.source_id).first()
    if not source_device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source device not found"
        )
    
    # Encrypt content if requested
    content = request.content
    if request.is_encrypted:
        content = encryption_manager.encrypt(request.content)
    
    # Generate message hash for duplicate detection (excludes timestamp)
    message_hash = calculate_message_hash(
        request.source_id,
        "broadcast",
        request.content,
    )
    
    # Check for duplicates
    if is_message_duplicate(db, message_hash):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Duplicate broadcast message detected"
        )
    
    message_id = generate_id()
    
    message = Message(
        message_id=message_id,
        source_id=request.source_id,
        destination_id=None,
        content=content,
        is_encrypted=request.is_encrypted,
        hop_count=0,
        max_hops=request.max_hops,
        is_broadcast=True,
        message_hash=message_hash,
    )
    
    db.add(message)
    db.commit()
    db.refresh(message)
    
    return message


@app.get("/messages/{device_id}", response_model=List[MessageResponse])
def get_messages(
    device_id: str,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Get all messages for a specific device.
    
    Retrieves messages where the device is either source or destination,
    or messages that are broadcasts.
    
    Args:
        device_id: Device ID to retrieve messages for
        limit: Maximum number of messages to return
        offset: Number of messages to skip
        db: Database session
        
    Returns:
        List of messages for the device
    """
    messages = db.query(Message).filter(
        or_(
            Message.source_id == device_id,
            Message.destination_id == device_id,
            Message.is_broadcast == True
        )
    ).order_by(desc(Message.timestamp)).offset(offset).limit(limit).all()
    
    return messages


# ==================== Marketplace Endpoints ====================

@app.post("/marketplace", response_model=MarketplaceListingResponse)
def create_marketplace_listing(
    request: MarketplaceListingCreateRequest,
    db: Session = Depends(get_db)
):
    """
    Create a new marketplace listing.
    
    Args:
        request: Listing details
        db: Database session
        
    Returns:
        Created marketplace listing
        
    Raises:
        HTTPException: If device doesn't exist
    """
    # Verify device exists
    device = db.query(Device).filter(Device.device_id == request.device_id).first()
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found"
        )
    
    listing_id = generate_id()
    
    listing = MarketplaceListing(
        listing_id=listing_id,
        device_id=request.device_id,
        title=request.title,
        description=request.description,
        resource_type=request.resource_type,
        quantity=request.quantity,
        unit=request.unit,
        available=request.quantity,
        price_credits=request.price_credits,
        status="available",
        expires_at=request.expires_at,
    )
    
    db.add(listing)
    db.commit()
    db.refresh(listing)
    
    return listing


@app.get("/marketplace", response_model=List[MarketplaceListingResponse])
def get_marketplace_listings(
    resource_type: str = None,
    status: str = "available",
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Get marketplace listings.
    
    Args:
        resource_type: Optional filter by resource type
        status: Filter by listing status (default: available)
        limit: Maximum number of listings to return
        offset: Number of listings to skip
        db: Database session
        
    Returns:
        List of marketplace listings
    """
    query = db.query(MarketplaceListing).filter(MarketplaceListing.status == status)
    
    if resource_type:
        query = query.filter(MarketplaceListing.resource_type == resource_type)
    
    # Filter out expired listings
    now = datetime.now()
    query = query.filter(
        or_(
            MarketplaceListing.expires_at == None,
            MarketplaceListing.expires_at > now
        )
    )
    
    listings = query.order_by(desc(MarketplaceListing.created_at)).offset(offset).limit(limit).all()
    
    return listings


@app.put("/marketplace/{listing_id}/resolve", response_model=SuccessResponse)
def resolve_marketplace_listing(
    listing_id: str,
    request: MarketplaceListingResolveRequest,
    db: Session = Depends(get_db)
):
    """
    Resolve a marketplace listing (mark as sold/resolved).
    
    Args:
        listing_id: ID of the listing to resolve
        request: Resolution details
        db: Database session
        
    Returns:
        Success response
        
    Raises:
        HTTPException: If listing not found
    """
    listing = db.query(MarketplaceListing).filter(
        MarketplaceListing.listing_id == listing_id
    ).first()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    listing.status = request.status
    listing.resolved_with = request.resolved_with
    listing.updated_at = datetime.now()
    
    db.commit()
    
    return SuccessResponse(
        message="Listing resolved successfully",
        data={"listing_id": listing_id, "status": request.status}
    )


# ==================== Health Check ====================

@app.get("/health")
def health_check():
    """
    Health check endpoint.
    
    Returns:
        Health status
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "Beacon Network API"
    }


# ==================== Root Endpoint ====================

@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "name": "Beacon Network API",
        "description": "Offline Internet Emergency Communication System",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
