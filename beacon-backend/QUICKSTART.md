# Quick Start Guide

## Installation & Setup (2 minutes)

### Windows

1. **Open PowerShell** in the `beacon-backend` directory

2. **Run the setup batch file**:
   ```powershell
   .\setup.bat
   ```
   
   OR manually:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

### macOS/Linux

1. **Open Terminal** in the `beacon-backend` directory

2. **Run the setup script**:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```
   
   OR manually:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

## Running the Server

### Windows
```powershell
.\venv\Scripts\activate
uvicorn main:app --reload
```

### macOS/Linux
```bash
source venv/bin/activate
uvicorn main:app --reload
```

**Server starts at**: the backend base URL (set via `SERVER_HOST`/`SERVER_PORT` or env; default: ${BACKEND_URL:-http://localhost:8000})

## Accessing the API

### Interactive API Documentation
-- **Swagger UI**: ${BACKEND_URL:-http://localhost:8000}/docs
-- **ReDoc**: ${BACKEND_URL:-http://localhost:8000}/redoc

### Test the API
```bash
# Health check
curl ${BACKEND_URL:-http://localhost:8000}/health

# Root endpoint
curl ${BACKEND_URL:-http://localhost:8000}/
```

## Example: Register a Device

```bash
curl -X POST "${BACKEND_URL:-http://localhost:8000}/register-device" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Emergency Router 1",
    "location": "Building A",
    "device_type": "router"
  }'
```

## Running Tests

```bash
pip install pytest pytest-asyncio httpx
pytest test_main.py -v
```

## Stopping the Server

Press `Ctrl+C` in the terminal running the server

## File Structure

```
beacon-backend/
├── main.py                    # FastAPI application & endpoints
├── models.py                  # Database models
├── database.py                # Database configuration
├── schemas.py                 # Pydantic schemas
├── encryption.py              # AES-256 encryption
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables
├── test_main.py              # Test suite
├── setup.sh / setup.bat      # Automated setup scripts
├── beacon_network.db         # SQLite database (auto-created)
└── README.md                 # Full documentation
```

## Quick API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/register-device` | Register a new device |
| GET | `/nodes` | List all devices |
| POST | `/send-message` | Send direct message |
| POST | `/broadcast` | Broadcast message |
| GET | `/messages/{device_id}` | Get device messages |
| GET | `/marketplace` | List marketplace items |
| POST | `/marketplace` | Create listing |
| PUT | `/marketplace/{id}/resolve` | Resolve listing |
| GET | `/health` | Health check |

## Environment Variables (`.env`)

```env
DATABASE_URL=sqlite:///./beacon_network.db
ENCRYPTION_KEY=
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
DEBUG=False
```

## Troubleshooting

**Port 8000 already in use?**
```bash
uvicorn main:app --port 8001
```

**Module not found?**
```bash
pip install -r requirements.txt
```

**Database issues?**
```bash
# Delete database to reset
rm beacon_network.db
# It will be recreated on next run
```

## Next Steps

1. ✅ Server is running
2. 📚 Check out [README.md](README.md) for detailed documentation
3. 🧪 Run tests with `pytest test_main.py -v`
4. 🔐 Configure encryption key in `.env`
5. 📱 Connect your frontend to the API

---

**Need help?** Check [README.md](README.md) for comprehensive documentation.
