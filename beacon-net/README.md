# 🌐 Offline Internet – Emergency Communication System

A decentralized emergency communication platform that works without traditional internet infrastructure.

Built for disaster resilience, campus outages, and mesh-based peer communication.

---

## 🚀 Project Overview

Offline Internet is a mesh-enabled communication system that allows:

- 📡 Device-to-device messaging  
- 📢 Emergency broadcast alerts  
- 🛒 Offline relief marketplace  
- 🔐 AES-256 encrypted messages  
- 🔁 Duplicate message detection  
- 📊 Hop-based routing logic  

---

## 🏗️ Architecture

Frontend (React + Vite + TypeScript)  
⬇  

Backend (FastAPI + SQLite)  
⬇  
Local Database (Offline-first design)

---

## 🛠️ Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn-ui

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- AES-256 Encryption
- Pytest

---

# ⚙️ Local Setup Guide

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/PrajwalSanade/Offline-Internet.git
cd Offline-Internet

🔵 Backend Setup
cd beacon-backend
python -m venv venv
Activate Virtual Environment

Windows

.\venv\Scripts\activate

Mac/Linux

source venv/bin/activate
Install Dependencies
pip install -r requirements.txt
Run Backend Server
uvicorn main:app --reload

Backend runs at:

http://localhost:8000

Swagger API Docs:

http://localhost:8000/docs
🟢 Frontend Setup

Open a new terminal:

cd beacon-net
npm install
npm run dev

Frontend runs at:

http://localhost:5173


🧪 Run Backend Tests
cd beacon-backend
pytest test_main.py -v

🔐 Security Features

AES-256-CBC message encryption

SHA-256 duplicate detection

SQLite offline database

CORS middleware enabled

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

GET /health

GET /

📦 Folder Structure
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
└── README.md
🎯 Key Features

✅ Offline-first architecture
✅ Emergency broadcast mode
✅ Resource marketplace
✅ Message hop routing
✅ Secure encryption
✅ Full test coverage

🏆 Hackathon Value

Real-world disaster resilience use case
Strong backend architecture
Secure encrypted messaging
Clean modern frontend
Production-ready API design

👨‍💻 Author
Prajwal Sanade
GitHub: https://github.com/PrajwalSanade

📜 License

MIT License