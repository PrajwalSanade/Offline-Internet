"""
Test suite for Beacon Network API.
Run with: pytest test_main.py -v
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app, get_db
from database import Base
from models import Device, Message, MarketplaceListing

# Create test database
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_db():
    """Reset the test database before each test for isolation."""
    # Drop and recreate all tables to ensure a clean state
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


class TestDeviceManagement:
    """Test device registration and retrieval."""

    def test_register_device(self):
        """Test device registration."""
        response = client.post(
            "/register-device",
            json={
                "name": "Test Device 1",
                "location": "Test Location",
                "device_type": "router",
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Device 1"
        assert data["location"] == "Test Location"
        assert data["device_type"] == "router"
        assert data["status"] == "online"
        assert data["is_active"] is True

    def test_get_nodes(self):
        """Test retrieving all nodes."""
        # Register a device first
        client.post(
            "/register-device",
            json={"name": "Device for listing"}
        )
        
        response = client.get("/nodes")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert data[0]["name"] == "Device for listing"

    def test_get_nodes_empty(self):
        """Test getting nodes when none exist."""
        response = client.get("/nodes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestMessaging:
    """Test message sending and retrieval."""

    def test_send_direct_message(self):
        """Test sending a direct message."""
        # Register devices
        source_resp = client.post(
            "/register-device",
            json={"name": "Source Device"}
        )
        source_id = source_resp.json()["device_id"]
        
        dest_resp = client.post(
            "/register-device",
            json={"name": "Dest Device"}
        )
        dest_id = dest_resp.json()["device_id"]
        
        # Send message
        response = client.post(
            "/send-message",
            json={
                "source_id": source_id,
                "destination_id": dest_id,
                "content": "Test message",
                "is_encrypted": False,
                "max_hops": 5,
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["source_id"] == source_id
        assert data["destination_id"] == dest_id
        assert data["content"] == "Test message"
        assert data["is_broadcast"] is False

    def test_send_message_source_not_found(self):
        """Test sending message from non-existent source."""
        response = client.post(
            "/send-message",
            json={
                "source_id": "invalid-id",
                "destination_id": "invalid-dest",
                "content": "Test",
            }
        )
        assert response.status_code == 404
        assert "Source device not found" in response.json()["detail"]

    def test_broadcast_message(self):
        """Test broadcasting a message."""
        # Register device
        source_resp = client.post(
            "/register-device",
            json={"name": "Broadcast Source"}
        )
        source_id = source_resp.json()["device_id"]
        
        # Send broadcast
        response = client.post(
            "/broadcast",
            json={
                "source_id": source_id,
                "content": "Emergency broadcast",
                "is_encrypted": False,
                "max_hops": 10,
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_broadcast"] is True
        assert data["destination_id"] is None

    def test_get_messages_for_device(self):
        """Test retrieving messages for a device."""
        # Register source and dest
        source_resp = client.post(
            "/register-device",
            json={"name": "Source"}
        )
        source_id = source_resp.json()["device_id"]
        
        dest_resp = client.post(
            "/register-device",
            json={"name": "Dest"}
        )
        dest_id = dest_resp.json()["device_id"]
        
        # Send message
        client.post(
            "/send-message",
            json={
                "source_id": source_id,
                "destination_id": dest_id,
                "content": "Test message",
            }
        )
        
        # Get messages
        response = client.get(f"/messages/{dest_id}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert data[0]["destination_id"] == dest_id

    def test_duplicate_message_detection(self):
        """Test duplicate message detection."""
        # Register device
        source_resp = client.post(
            "/register-device",
            json={"name": "Dup Source"}
        )
        source_id = source_resp.json()["device_id"]
        
        msg_data = {
            "source_id": source_id,
            "destination_id": "broadcast",
            "content": "Unique message",
            "is_encrypted": False,
        }
        
        # Send first message
        response1 = client.post("/broadcast", json=msg_data)
        assert response1.status_code == 200
        
        # Send duplicate (should fail)
        response2 = client.post("/broadcast", json=msg_data)
        assert response2.status_code == 409
        assert "Duplicate" in response2.json()["detail"]


class TestMarketplace:
    """Test marketplace functionality."""

    def test_create_listing(self):
        """Test creating a marketplace listing."""
        # Register device
        device_resp = client.post(
            "/register-device",
            json={"name": "Marketplace Device"}
        )
        device_id = device_resp.json()["device_id"]
        
        # Create listing
        response = client.post(
            "/marketplace",
            json={
                "device_id": device_id,
                "title": "Storage Space",
                "description": "Emergency storage",
                "resource_type": "storage",
                "quantity": 100,
                "unit": "GB",
                "price_credits": 50,
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Storage Space"
        assert data["status"] == "available"
        assert data["quantity"] == 100

    def test_get_marketplace(self):
        """Test retrieving marketplace listings."""
        response = client.get("/marketplace")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_resolve_listing(self):
        """Test resolving a marketplace listing."""
        # Register device
        device_resp = client.post(
            "/register-device",
            json={"name": "Seller"}
        )
        device_id = device_resp.json()["device_id"]
        
        # Create listing
        listing_resp = client.post(
            "/marketplace",
            json={
                "device_id": device_id,
                "title": "Test Listing",
                "resource_type": "storage",
                "quantity": 50,
                "unit": "GB",
                "price_credits": 25,
            }
        )
        listing_id = listing_resp.json()["listing_id"]
        
        # Resolve listing
        response = client.put(
            f"/marketplace/{listing_id}/resolve",
            json={
                "resolved_with": "buyer-id",
                "status": "sold",
            }
        )
        assert response.status_code == 200
        assert "resolved successfully" in response.json()["message"]


class TestHealthCheck:
    """Test health endpoints."""

    def test_health_check(self):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "service" in data

    def test_root_endpoint(self):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "Beacon Network" in data["name"]
        assert "docs" in data


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
