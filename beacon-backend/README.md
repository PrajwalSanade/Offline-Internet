# Beacon Network API

**Offline Internet Emergency Communication System**

A FastAPI-based backend service for peer-to-peer emergency communication, resource sharing, and offline mesh networking.

## Features

- **Device Registration**: Register devices/nodes in the emergency communication network
- **Direct & Broadcast Messaging**: Send direct messages or broadcast to all devices
- **Message Encryption**: AES-256 encryption support for sensitive messages
- **Duplicate Detection**: Hash-based duplicate message detection to prevent redundant transmissions
- **Marketplace**: Share and request resources (storage, bandwidth, computing power)
- **Hop-Count Routing**: Support for multi-hop message propagation
- **SQLite Database**: Lightweight, serverless database for offline operation
- **CORS Support**: Built-in CORS middleware for frontend integration
- **Interactive API Docs**: Auto-generated Swagger UI and ReDoc documentation

## Tech Stack

- **Framework**: FastAPI 0.104.1
- **Database**: SQLite with SQLAlchemy ORM
- **Validation**: Pydantic v2
- **Encryption**: PyCryptodome (AES-256-CBC)
- **Server**: Uvicorn with hot-reload support
- **Python**: 3.10+

## Project Structure

```
beacon-backend/
├── main.py                 # Main FastAPI application and endpoints
├── models.py              # SQLAlchemy database models
├── database.py            # Database configuration and session management
├── schemas.py             # Pydantic request/response schemas
├── encryption.py          # AES encryption utilities
├── requirements.txt       # Python dependencies
├── .env                   # Environment configuration
├── beacon_network.db      # SQLite database (auto-created)
└── README.md             # This file
```

## Installation

### Prerequisites

- Python 3.10 or higher
- pip (Python package manager)

### Setup Steps

1. **Navigate to project directory**:
   ```bash
   cd beacon-backend
   ```

2. **Create virtual environment** (recommended):
   ```bash
   # On Windows
   python -m venv venv
   venv\Scripts\activate
   
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment** (optional):
   Edit `.env` file to customize settings:
   - `DATABASE_URL`: SQLite database path
   - `ENCRYPTION_KEY`: Base64-encoded AES-256 key
   - `SERVER_HOST`: Server host (default: 0.0.0.0)
   - `SERVER_PORT`: Server port (default: 8000)

## Running the Application

Start the development server with hot-reload:

```bash
uvicorn main:app --reload
```

The server will be available at: **http://localhost:8000**

### Production Deployment

For production, run without reload:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, access interactive API documentation at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Core Endpoints

#### Device Management

**Register Device**
```http
POST /register-device
Content-Type: application/json

{
  "name": "Emergency Router 1",
  "location": "Building A, Floor 3",
  "device_type": "router"
}
```

**Get All Nodes**
```http
GET /nodes?status=online
```

#### Messaging

**Send Direct Message**
```http
POST /send-message
Content-Type: application/json

{
  "source_id": "device-uuid",
  "destination_id": "target-device-uuid",
  "content": "Critical alert message",
  "is_encrypted": true,
  "max_hops": 5
}
```

**Broadcast Message**
```http
POST /broadcast
Content-Type: application/json

{
  "source_id": "device-uuid",
  "content": "Emergency broadcast to all devices",
  "is_encrypted": false,
  "max_hops": 10
}
```

**Get Device Messages**
```http
GET /messages/{device_id}?limit=50&offset=0
```

#### Marketplace

**Create Listing**
```http
POST /marketplace
Content-Type: application/json

{
  "device_id": "device-uuid",
  "title": "500GB Storage Available",
  "description": "Temporary storage for emergency data",
  "resource_type": "storage",
  "quantity": 500,
  "unit": "GB",
  "price_credits": 100,
  "expires_at": "2026-03-15T12:00:00"
}
```

**Get Marketplace**
```http
GET /marketplace?resource_type=storage&status=available&limit=20
```

**Resolve Listing**
```http
PUT /marketplace/{listing_id}/resolve
Content-Type: application/json

{
  "resolved_with": "buyer-device-uuid",
  "status": "sold"
}
```

#### Health Check

**Health Status**
```http
GET /health
```

## Message Format

All messages contain the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `message_id` | UUID | Unique message identifier |
| `source_id` | UUID | Sending device ID |
| `destination_id` | UUID | Receiving device ID (null for broadcast) |
| `content` | String | Message content (encrypted if `is_encrypted=true`) |
| `is_encrypted` | Boolean | Whether content is AES-256 encrypted |
| `timestamp` | DateTime | Message creation time |
| `hop_count` | Integer | Current hop count |
| `max_hops` | Integer | Maximum hops allowed (default: 10) |
| `is_broadcast` | Boolean | Whether message is broadcasted |
| `message_hash` | String | SHA-256 hash for duplicate detection |
| `delivered` | Boolean | Delivery status |

## Encryption

### AES-256-CBC Encryption

The system supports optional AES-256-CBC encryption for message content:

**Encryption Process**:
1. Generate random 16-byte IV
2. Pad plaintext to 16-byte boundaries
3. Encrypt with AES-256-CBC
4. Prepend IV to ciphertext
5. Base64-encode result

**Usage**:
```python
from encryption import encryption_manager

# Encrypt
encrypted = encryption_manager.encrypt("Secret message")

# Decrypt
decrypted = encryption_manager.decrypt(encrypted)
```

## Duplicate Detection

Messages are checked for duplicates using SHA-256 hashing:

```
hash = SHA256(source_id:destination_id:content:timestamp)
```

If a message with the same hash exists, a `409 Conflict` response is returned.

## Database Schema

### Devices Table
```sql
CREATE TABLE devices (
  device_id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  device_type VARCHAR(50),
  status VARCHAR(20),
  last_seen DATETIME,
  created_at DATETIME,
  is_active BOOLEAN DEFAULT TRUE
)
```

### Messages Table
```sql
CREATE TABLE messages (
  message_id VARCHAR(36) PRIMARY KEY,
  source_id VARCHAR(36) NOT NULL,
  destination_id VARCHAR(36),
  content TEXT NOT NULL,
  is_encrypted BOOLEAN DEFAULT FALSE,
  timestamp DATETIME,
  hop_count INTEGER DEFAULT 0,
  max_hops INTEGER DEFAULT 10,
  is_broadcast BOOLEAN DEFAULT FALSE,
  message_hash VARCHAR(64) UNIQUE,
  delivered BOOLEAN DEFAULT FALSE,
  created_at DATETIME
)
```

### Marketplace Listings Table
```sql
CREATE TABLE marketplace_listings (
  listing_id VARCHAR(36) PRIMARY KEY,
  device_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50),
  quantity FLOAT,
  unit VARCHAR(50),
  available FLOAT,
  price_credits FLOAT,
  status VARCHAR(20),
  resolved_with VARCHAR(36),
  created_at DATETIME,
  updated_at DATETIME,
  expires_at DATETIME
)
```

## Error Handling

The API returns standard HTTP status codes:

| Status | Meaning |
|--------|---------|
| `200` | Request successful |
| `201` | Resource created |
| `400` | Bad request (validation error) |
| `404` | Resource not found |
| `409` | Conflict (duplicate message) |
| `500` | Server error |

Error responses include a `detail` field with explanation:

```json
{
  "detail": "Source device not found"
}
```

## Development

### Running Tests

Create a `test_main.py` file and use pytest:

```bash
pip install pytest pytest-asyncio httpx
pytest
```

### Database Reset

To reset the database:

```bash
# Simply delete the database file
rm beacon_network.db

# It will be recreated on next startup
```

### SQL Logging

To enable SQL query logging, edit `database.py`:

```python
engine = create_engine(DATABASE_URL, echo=True)
```

## Security Considerations

⚠️ **Important for Production**:

1. **CORS**: Currently allows all origins. Restrict in production:
   ```python
   allow_origins=["https://yourdomain.com"]
   ```

2. **Encryption Key**: Generate a secure key:
   ```python
   from Crypto.Random import get_random_bytes
   import base64
   key = base64.b64encode(get_random_bytes(32)).decode('utf-8')
   ```

3. **Authentication**: Add JWT/API key authentication for production

4. **HTTPS**: Always use HTTPS in production

5. **Database**: Use PostgreSQL or MySQL for production deployments

## Performance Tips

- **Indexing**: Database indexes are already on `device_id`, `source_id`, `destination_id`, `timestamp`, and `message_hash`
- **Pagination**: Always use `limit` and `offset` for large queries
- **Async Operations**: FastAPI handles async operations efficiently
- **Connection Pooling**: Already configured in SQLAlchemy

## Troubleshooting

### Port Already in Use
```bash
# Use a different port
uvicorn main:app --reload --port 8001
```

### Import Errors
Ensure all dependencies are installed:
```bash
pip install -r requirements.txt
```

### Database Locked
SQLite can have concurrency issues. For high-throughput scenarios, migrate to PostgreSQL.

### Encryption Issues
Ensure `ENCRYPTION_KEY` is properly set in `.env`:
```bash
python -c "from Crypto.Random import get_random_bytes; import base64; print(base64.b64encode(get_random_bytes(32)).decode())"
```

## License

MIT License - Feel free to use for emergency and non-emergency purposes.

## Support

For issues, questions, or contributions, please refer to the included documentation.

---

**Status**: Production Ready ✅
**Last Updated**: 2026-02-28
