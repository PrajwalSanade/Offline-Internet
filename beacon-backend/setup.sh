#!/bin/bash
# Quick start script for Beacon Network Backend on Linux/macOS

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║     Beacon Network - Backend Setup Script             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check Python version
echo "✓ Checking Python version..."
python3 --version

# Create virtual environment
echo "✓ Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "✓ Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "✓ Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║         Setup Complete! Ready to launch server        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "To start the development server, run:"
echo ""
echo "  source venv/bin/activate"
echo "  uvicorn main:app --reload"
echo ""
echo "The API will be available at the backend base URL (default: http://localhost:8000)"
echo "Interactive docs at: ${BACKEND_URL:-http://localhost:8000}/docs"
echo ""
