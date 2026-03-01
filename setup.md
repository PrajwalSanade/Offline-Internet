**Setup Guide**

This document explains how to set up and run the backend (`beacon-backend`) and frontend (`beacon-net`) locally and with Docker.

Note: You can override the backend base URL used by examples and the frontend by setting the environment variables `BACKEND_URL` (for curl/examples) and `VITE_API_BASE_URL` (for the frontend). Defaults point to `http://localhost:8000` for local development.

**Prerequisites**
- **Python**: 3.10+ (for backend)
- **Node.js & npm**: Node 18+ recommended (for frontend)
- **Docker & Docker Compose**: optional for containerized run

**Backend — Local (Windows)**

1. Open PowerShell and change to the backend folder:

```powershell
cd beacon-backend
```

2. Run the provided setup script (creates venv, installs deps):

```powershell
.\setup.bat
# or manually
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

3. Configure environment variables: copy or create `.env` in `beacon-backend` with at least:

```env
DATABASE_URL=sqlite:///./beacon_network.db
ENCRYPTION_KEY=
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
DEBUG=False
```

Generate a secure AES-256 key (example):

```python
from Crypto.Random import get_random_bytes
import base64
print(base64.b64encode(get_random_bytes(32)).decode())
```

4. Start dev server:

```powershell
.\venv\Scripts\activate
uvicorn main:app --reload
```

The API will be available at the backend base URL (set via `SERVER_HOST`/`SERVER_PORT` or env; default: http://localhost:8000) and docs at `/docs` and `/redoc`.

**Backend — macOS / Linux**

```bash
cd beacon-backend
chmod +x setup.sh
./setup.sh
# or manual
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend — Local**

1. Open a new terminal and change to the frontend folder:

```bash
cd beacon-net
```

2. Install and run:

```bash
npm install
npm run dev
```

Frontend dev server runs at http://localhost:5173. The Vite dev server proxies or calls the backend directly — update API base URLs in `src/lib/api.ts` or environment if needed.

**Docker (recommended quick start)**

From the repository root run (builds both services and reads `beacon-backend/.env`):

```bash
docker compose up --build
```

Service ports (by default):
- Backend: `8000` (backend base URL; default http://localhost:8000)
- Frontend: `5173` mapped to container port `80` (http://localhost:5173)

If you change `.env`, restart the containers:

```bash
docker compose down
docker compose up --build
```

**Tests**

Backend tests (pytest):

```bash
cd beacon-backend
pip install pytest pytest-asyncio httpx
pytest test_main.py -v
```

Frontend tests (Vitest):

```bash
cd beacon-net
npm install
npm run test
```

**Database reset**

To reset the local SQLite DB (backend):

```bash
cd beacon-backend
rm beacon_network.db    # macOS/Linux
del beacon_network.db   # Windows PowerShell
```

**Troubleshooting & Notes**
- If port 8000 is in use: `uvicorn main:app --port 8001`
- Ensure `ENCRYPTION_KEY` in `.env` is set for AES encryption features.
- For production: use a proper RDBMS (Postgres/MySQL), HTTPS, and authentication.

**Where to look**
- Backend docs and quickstart: [beacon-backend/QUICKSTART.md](beacon-backend/QUICKSTART.md)
- Backend detailed docs: [beacon-backend/README.md](beacon-backend/README.md)
- Frontend project: [beacon-net/package.json](beacon-net/package.json)
- Docker compose: [docker-compose.yml](docker-compose.yml)

---
Created from repository files: `beacon-backend` and `beacon-net`.
