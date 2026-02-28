@echo off
REM Quick start script for Beacon Network Backend on Windows

color 0A
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     Beacon Network - Backend Setup Script             ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo ✓ Checking Python version...
python --version
echo.

echo ✓ Creating virtual environment...
python -m venv venv
echo.

echo ✓ Activating virtual environment...
call venv\Scripts\activate.bat
echo.

echo ✓ Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt
echo.

echo ╔════════════════════════════════════════════════════════╗
echo ║         Setup Complete! Ready to launch server        ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo To start the development server, run:
echo.
echo  venv\Scripts\activate
echo  uvicorn main:app --reload
echo.
echo The API will be available at: http://localhost:8000
echo Interactive docs at: http://localhost:8000/docs
echo.
pause
