🌐 Offline Internet – Emergency Communication System

    A decentralized, mesh-enabled emergency communication platform that works without traditional internet infrastructure.

    Built for disaster resilience, campus-wide outages, and peer-to-peer mesh communication.

🚀 Project Overview

    Offline Internet enables device-to-device communication when standard networks fail.

Core Capabilities

    📡 Peer-to-peer device messaging
    📢 Emergency broadcast alerts
    🛒 Offline relief & resource marketplace
    🔐 AES-256 encrypted messages
    🔁 SHA-256 duplicate message detection
    📊 Hop-based routing logic
    🗄️ Offline-first SQLite database

🏗️ System Architecture

    Frontend (React + Vite + TypeScript)
            ↓
    Backend (FastAPI + SQLAlchemy)
            ↓
    SQLite Database (Offline-first)

    Designed for local-first deployment, optionally containerized using Docker.


🛠️ Tech Stack

🎨 Frontend

    React
    TypeScript
    Vite
    Tailwind CSS
    shadcn-ui

⚙️ Backend

    FastAPI
    SQLAlchemy 2.x
    SQLite
    Pydantic v2
    AES-256 Encryption (PyCryptodome)
    Pytest (Test Coverage)

⚙️ Local Setup Guide

    Default backend URL: http://localhost:8000
    Frontend reads backend URL from VITE_API_BASE_URL


1️⃣ Clone the Repository

    git clone https://github.com/PrajwalSanade/Offline-Internet.git
    cd Offline-Internet

🔵 Backend Setup

    Step 1 – Navigate to backend
    cd beacon-backend

    Step 2 – Create Virtual Environment
    python -m venv venv

    Step 3 – Activate Environment

    Windows
    .\venv\Scripts\activate

    Mac/Linux
    source venv/bin/activate

    Step 4 – Install Dependencies
    pip install -r requirements.txt

    Step 5 – Run Backend Server
    uvicorn main:app --reload

    Backend runs at:
    http://localhost:8000

📄 Swagger API Docs
http://localhost:8000/docs

🟢 Frontend Setup
Open a new terminal:

    cd beacon-net
    npm install
    npm run dev

    Frontend runs at:
    http://localhost:5173


🐳 Docker (Recommended Quick Start)

    From the project root:
    docker compose up --build

Services:

    Backend → http://localhost:8000
    Frontend → http://localhost:5173

To stop:
    docker compose down


🧪 Run Tests
    Backend Tests

    cd beacon-backend
    pytest test_main.py -v


🔐 Security Features

    AES-256-CBC encryption
    SHA-256 message hashing
    Duplicate message detection
    Offline SQLite database
    CORS protection
    Pydantic schema validation



📡 API Endpoints

Device
    POST /register-device
    GET /nodes

Messaging
    POST /send-message
    POST /broadcast
    GET /messages/{device_id}

Marketplace
    GET /marketplace
    POST /marketplace
    PUT /marketplace/{id}/resolve

Utility
    GET /
    GET /health


📦 Project Structure

Offline-Internet/
│
├── beacon-backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── schemas.py
│   ├── encryption.py
│   └── test_main.py
│
├── beacon-net/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
└── docker-compose.yml


🎯 Key Highlights

    ✅ Offline-first architecture
    ✅ Emergency broadcast mode
    ✅ Secure encrypted messaging
    ✅ Mesh-based communication logic
    ✅ Resource marketplace
    ✅ Clean modern UI
    ✅ Production-ready API structure


🏆 Hackathon Value

    Real-world disaster resilience use case
    Strong backend engineering
    Secure encryption implementation
    Full-stack architecture
    Docker-ready deployment


👨‍💻 Author

    Prajwal Sanade
    GitHub: https://github.com/PrajwalSanade


📜 License

MIT License