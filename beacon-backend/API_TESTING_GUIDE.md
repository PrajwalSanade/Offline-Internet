# API Testing Guide - Beacon Network

This guide provides curl commands to test all endpoints of the Beacon Network API.

**Base URL**: Use your backend base URL. Set via environment (for example `BACKEND_URL` or `SERVER_HOST`/`SERVER_PORT`). Default: `${BACKEND_URL:-http://localhost:8000}`

Replace `${BACKEND_URL:-http://localhost:8000}` in examples with your environment value when needed.

## Prerequisites

- Server running (`uvicorn main:app --reload`)
- curl installed (Windows PowerShell, macOS Terminal, or Linux)
- Optional: A tool like Postman or Insomnia for testing

## Health & Status Endpoints

### 1. Health Check
```bash
curl -X GET "${BACKEND_URL:-http://localhost:8000}/health"
```

**Expected Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-28T19:35:00.123456",
  "service": "Beacon Network API"
}
```

### 2. API Information
```bash
curl -X GET "${BACKEND_URL:-http://localhost:8000}/"
```

**Expected Response**:
```json
{
  "name": "Beacon Network API",
  "description": "Offline Internet Emergency Communication System",
  "version": "1.0.0",
  "docs": "/docs",
  "health": "/health"
}
```

## Device Management Endpoints

### 3. Register Device
```bash
curl -X POST "${BACKEND_URL:-http://localhost:8000}/register-device" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emergency Router 1",
    "location": "Building A, Floor 3",
    "device_type": "router"
  }'
```

**Save the response `device_id` for later use**:
- Example: `123e4567-e89b-12d3-a456-426614174000`

### 4. Register Multiple Devices

For testing, register these devices:

**Device 2 - Sensor Node**:
```bash
curl -X POST "${BACKEND_URL:-http://localhost:8000}/register-device" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Temperature Sensor",
    "location": "Building A, Basement",
    "device_type": "sensor"
  }'
```

**Device 3 - Gateway**:
```bash
curl -X POST "${BACKEND_URL:-http://localhost:8000}/register-device" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Network Gateway",
    "location": "Central Hub",
    "device_type": "gateway"
  }'
```

### 5. Get All Devices/Nodes
```bash
curl -X GET "${BACKEND_URL:-http://localhost:8000}/nodes"
```

**With optional status filter**:
```bash
curl -X GET "${BACKEND_URL:-http://localhost:8000}/nodes?status=online"
```

**Expected Response**:
```json
[
  {
    "device_id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Emergency Router 1",
    "location": "Building A, Floor 3",
    "device_type": "router",
    "status": "online",
    "last_seen": "2026-02-28T19:35:00.123456",
    "created_at": "2026-02-28T19:30:00.123456",
    "is_active": true
  }
]
```

## Messaging Endpoints

### 6. Send Direct Message

First, get two device IDs from the `/nodes` endpoint.

Replace `SOURCE_ID` and `DEST_ID` with actual device UUIDs:

```bash
curl -X POST "${BACKEND_URL:-http://localhost:8000}/send-message" \
  -H "Content-Type: application/json" \
  -d '{
    "source_id": "SOURCE_ID",
    "destination_id": "DEST_ID",
    "content": "Hello, this is a test message",
    "is_encrypted": false,
    "max_hops": 5
  }'
```

**With encryption**:
```bash
curl -X POST "${BACKEND_URL:-http://localhost:8000}/send-message" \
  -H "Content-Type: application/json" \
  -d '{
    "source_id": "SOURCE_ID",
    "destination_id": "DEST_ID",
    "content": "Encrypted message",
    "is_encrypted": true,
    "max_hops": 5
  }'
```

**Expected Response**:
```json
{
  "message_id": "uuid-here",
  "source_id": "SOURCE_ID",
  "destination_id": "DEST_ID",
  "content": "Hello, this is a test message",
  "is_encrypted": false,
  "timestamp": "2026-02-28T19:36:00.123456",
  "hop_count": 0,
  "max_hops": 5,
  "is_broadcast": false,
  "delivered": false,
  "created_at": "2026-02-28T19:36:00.123456"
}
```

### 7. Broadcast Message

```bash
curl -X POST "${BACKEND_URL:-http://localhost:8000}/broadcast" \
  -H "Content-Type: application/json" \
  -d '{
    "source_id": "SOURCE_ID",
    "content": "Emergency broadcast message to all devices",
    "is_encrypted": false,
    "max_hops": 10
  }'
```

**Response** will have `is_broadcast: true` and `destination_id: null`

### 8. Get Messages for Device

Replace `DEVICE_ID` with actual UUID:

```bash
curl -X GET "${BACKEND_URL:-http://localhost:8000}/messages/DEVICE_ID"
```

**With pagination**:
```bash
curl -X GET "${BACKEND_URL:-http://localhost:8000}/messages/DEVICE_ID?limit=20&offset=0"
```

**Expected Response**:
```json
[
  {
    "message_id": "uuid-here",
    "source_id": "DEVICE_ID_1",
    "destination_id": "DEVICE_ID",
    "content": "Test message",
    "is_encrypted": false,
    "timestamp": "2026-02-28T19:36:00.123456",
    "hop_count": 0,
    "max_hops": 5,
    "is_broadcast": false,
    "delivered": false,
    "created_at": "2026-02-28T19:36:00.123456"
  }
]
```

### 9. Test Duplicate Detection

Send the exact same message twice:

```bash
# First message
curl -X POST "${BACKEND_URL:-http://localhost:8000}/broadcast" \
  -H "Content-Type: application/json" \
  -d '{
    "source_id": "DEVICE_ID",
    "content": "Important message - sending twice",
    "is_encrypted": false,
    "max_hops": 5
  }'

# Second message (identical)
curl -X POST "${BACKEND_URL:-http://localhost:8000}/broadcast" \
  -H "Content-Type: application/json" \
  -d '{
    "source_id": "DEVICE_ID",
    "content": "Important message - sending twice",
    "is_encrypted": false,
    "max_hops": 5
  }'
```

**Second request will return error**:
```json
{
  "detail": "Duplicate broadcast message detected"
}
```

Status: `409 Conflict`

## Marketplace Endpoints

### 10. Create Marketplace Listing

Replace `DEVICE_ID` with actual UUID:

```bash
curl -X POST "${BACKEND_URL:-http://localhost:8000}/marketplace" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "DEVICE_ID",
    "title": "500GB Emergency Storage",
    "description": "Temporary storage for emergency data backup",
    "resource_type": "storage",
    "quantity": 500,
    "unit": "GB",
    "price_credits": 100
  }'
```

**Save the `listing_id` for later use**

**Expected Response**:
```json
{
  "listing_id": "uuid-here",
  "device_id": "DEVICE_ID",
  "title": "500GB Emergency Storage",
  "description": "Temporary storage for emergency data backup",
  "resource_type": "storage",
  "quantity": 500.0,
  "unit": "GB",
  "available": 500.0,
  "price_credits": 100.0,
  "status": "available",
  "resolved_with": null,
  "created_at": "2026-02-28T19:37:00.123456",
  "updated_at": "2026-02-28T19:37:00.123456",
  "expires_at": null
}
```

### 11. Create Multiple Listings

**Bandwidth Listing**:
```bash
curl -X POST "${BACKEND_URL:-http://localhost:8000}/marketplace" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "DEVICE_ID",
    "title": "50Mbps Bandwidth Share",
    "description": "Emergency internet connectivity sharing",
    "resource_type": "bandwidth",
    "quantity": 50,
    "unit": "Mbps",
    "price_credits": 75
  }'
```

**Computing Power Listing**:
```bash
curl -X POST "${BACKEND_URL:-http://localhost:8000}/marketplace" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "DEVICE_ID",
    "title": "2 CPU Hours",
    "description": "Computing resources for emergency processing",
    "resource_type": "computing",
    "quantity": 2,
    "unit": "CPU-hours",
    "price_credits": 150
  }'
```

### 12. Get Marketplace Listings

```bash
curl -X GET "${BACKEND_URL:-http://localhost:8000}/marketplace"
```

**Filter by resource type**:
```bash
curl -X GET "${BACKEND_URL:-http://localhost:8000}/marketplace?resource_type=storage"
```

**Filter by status**:
```bash
curl -X GET "${BACKEND_URL:-http://localhost:8000}/marketplace?status=available"
```

**With pagination**:
```bash
curl -X GET "${BACKEND_URL:-http://localhost:8000}/marketplace?limit=10&offset=0"
```

### 13. Resolve Marketplace Listing

Replace `LISTING_ID` and `BUYER_DEVICE_ID` with actual UUIDs:

```bash
curl -X PUT "${BACKEND_URL:-http://localhost:8000}/marketplace/LISTING_ID/resolve" \
  -H "Content-Type: application/json" \
  -d '{
    "resolved_with": "BUYER_DEVICE_ID",
    "status": "sold"
  }'
```

**Expected Response**:
```json
{
  "message": "Listing resolved successfully",
  "data": {
    "listing_id": "LISTING_ID",
    "status": "sold"
  }
}
```

## Error Handling Examples

### 14. Test Error Responses

**Device not found**:
```bash
curl -X POST "${BACKEND_URL:-http://localhost:8000}/send-message" \
  -H "Content-Type: application/json" \
  -d '{
    "source_id": "invalid-uuid",
    "destination_id": "invalid-uuid",
    "content": "Test"
  }'
```

**Response** (404):
```json
{
  "detail": "Source device not found"
}
```

**Invalid JSON**:
```bash
curl -X POST "${BACKEND_URL:-http://localhost:8000}/register-device" \
  -H "Content-Type: application/json" \
  -d '{invalid json}'
```

**Response** (422):
```json
{
  "detail": [
    {
      "type": "json_invalid",
      "loc": ["body"],
      "msg": "Invalid JSON"
    }
  ]
}
```

## Using Postman or Insomnia

1. **Import**: Use the base URL `${BACKEND_URL:-http://localhost:8000}`
2. **Set header**: `Content-Type: application/json`
3. **Copy endpoint URLs** from this guide
4. **Fill in request bodies** with example JSON above
5. **Save responses** (device_ids, listing_ids) for other requests

## Performance Testing

### Send Multiple Messages
```bash
# PowerShell script to send 10 messages
for ($i = 1; $i -le 10; $i++) {
    curl.exe -X POST "${BACKEND_URL:-http://localhost:8000}/send-message" `
      -H "Content-Type: application/json" `
      -d @"
{
  "source_id": "SOURCE_ID",
  "destination_id": "DEST_ID",
  "content": "Message $i",
  "is_encrypted": false
}
"@
    Write-Output "Sent message $i"
}
```

## API Documentation UI

For interactive testing, use the built-in Swagger UI:

```
${BACKEND_URL:-http://localhost:8000}/docs
```

This provides:
- Interactive endpoint testing
- Automatic request/response examples
- Schema documentation
- Authorization testing

## Tips

1. **Save IDs**: Copy device_id and listing_id from responses for subsequent requests
2. **Test timestamps**: Check that timestamps update correctly
3. **Encryption**: Send encrypted=true to test AES-256 encryption
4. **Broadcast**: Messages with null destination_id are broadcasts
5. **Status codes**: Check for proper HTTP status codes (200, 404, 409, etc.)

## Troubleshooting

**Server not responding?**
```bash
curl ${BACKEND_URL:-http://localhost:8000}/health
```

**JSON format errors?**
- Ensure quotes around strings
- Use double quotes (not single)
- No trailing commas in JSON

**Invalid device_id?**
- Get fresh IDs from `${BACKEND_URL:-http://localhost:8000}/nodes` endpoint
- UUIDs are case-sensitive
- Use the exact ID returned by register

---

For complete API documentation, visit ${BACKEND_URL:-http://localhost:8000}/docs or check README.md
