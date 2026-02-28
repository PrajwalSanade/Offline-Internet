"""
SQLAlchemy database models for Beacon Network application.
"""

from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, Boolean, Float
from sqlalchemy.sql import func
from database import Base


class Device(Base):
    """Device model for registered network nodes."""
    
    __tablename__ = "devices"

    device_id = Column(String(36), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255))
    device_type = Column(String(50))  # e.g., "router", "sensor", "gateway"
    status = Column(String(20), default="online")  # online, offline, inactive
    last_seen = Column(DateTime, default=func.now(), onupdate=func.now())
    created_at = Column(DateTime, default=func.now())
    is_active = Column(Boolean, default=True)


class Message(Base):
    """Message model for network communications."""
    
    __tablename__ = "messages"

    message_id = Column(String(36), primary_key=True, index=True)
    source_id = Column(String(36), index=True, nullable=False)
    destination_id = Column(String(36), index=True, nullable=True)  # None for broadcast
    content = Column(Text, nullable=False)
    is_encrypted = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=func.now(), index=True)
    hop_count = Column(Integer, default=0)
    max_hops = Column(Integer, default=10)
    is_broadcast = Column(Boolean, default=False)
    message_hash = Column(String(64), unique=True, index=True)  # For duplicate detection
    delivered = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())


class MarketplaceListing(Base):
    """Marketplace listing model for resource sharing."""
    
    __tablename__ = "marketplace_listings"

    listing_id = Column(String(36), primary_key=True, index=True)
    device_id = Column(String(36), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    resource_type = Column(String(50))  # e.g., "storage", "bandwidth", "computing"
    quantity = Column(Float)
    unit = Column(String(50))  # e.g., "GB", "Mbps", "CPU-hours"
    available = Column(Float)
    price_credits = Column(Float)
    status = Column(String(20), default="available")  # available, sold, resolved
    resolved_with = Column(String(36))  # device_id of resolution/buyer
    created_at = Column(DateTime, default=func.now(), index=True)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    expires_at = Column(DateTime)
