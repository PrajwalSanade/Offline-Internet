"""
Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ==================== Device Schemas ====================

class DeviceRegisterRequest(BaseModel):
    """Schema for device registration."""
    name: str = Field(..., min_length=1, max_length=255)
    location: Optional[str] = None
    device_type: Optional[str] = None  # router, sensor, gateway, etc.


class DeviceResponse(BaseModel):
    """Schema for device response."""
    device_id: str
    name: str
    location: Optional[str]
    device_type: Optional[str]
    status: str
    last_seen: datetime
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True


# ==================== Message Schemas ====================

class MessageSendRequest(BaseModel):
    """Schema for sending a message."""
    source_id: str
    destination_id: Optional[str] = None  # None for broadcast
    content: str = Field(..., min_length=1)
    is_encrypted: bool = False
    is_broadcast: bool = False
    max_hops: int = Field(default=10, ge=1, le=100)


class MessageBroadcastRequest(BaseModel):
    """Schema for broadcasting a message."""
    source_id: str
    content: str = Field(..., min_length=1)
    is_encrypted: bool = False
    max_hops: int = Field(default=10, ge=1, le=100)


class MessageResponse(BaseModel):
    """Schema for message response."""
    message_id: str
    source_id: str
    destination_id: Optional[str]
    content: str
    is_encrypted: bool
    timestamp: datetime
    hop_count: int
    max_hops: int
    is_broadcast: bool
    delivered: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Marketplace Schemas ====================

class MarketplaceListingCreateRequest(BaseModel):
    """Schema for creating a marketplace listing."""
    device_id: str
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    resource_type: str  # storage, bandwidth, computing, etc.
    quantity: float = Field(..., gt=0)
    unit: str  # GB, Mbps, CPU-hours, etc.
    price_credits: float = Field(..., ge=0)
    expires_at: Optional[datetime] = None


class MarketplaceListingUpdateRequest(BaseModel):
    """Schema for updating a marketplace listing."""
    available: Optional[float] = None
    status: Optional[str] = None


class MarketplaceListingResolveRequest(BaseModel):
    """Schema for resolving a marketplace listing."""
    resolved_with: str = Field(..., description="Device ID of resolver/buyer")
    status: str = Field(..., description="resolved, sold, etc.")


class MarketplaceListingResponse(BaseModel):
    """Schema for marketplace listing response."""
    listing_id: str
    device_id: str
    title: str
    description: Optional[str]
    resource_type: str
    quantity: float
    unit: str
    available: float
    price_credits: float
    status: str
    resolved_with: Optional[str]
    created_at: datetime
    updated_at: datetime
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True


# ==================== Utility Schemas ====================

class ErrorResponse(BaseModel):
    """Schema for error responses."""
    detail: str
    error_code: Optional[str] = None


class SuccessResponse(BaseModel):
    """Schema for generic success responses."""
    message: str
    data: Optional[dict] = None
