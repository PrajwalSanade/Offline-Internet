"""
Configuration settings for Beacon Network application.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Server configuration
    server_host: str = "0.0.0.0"
    server_port: int = 8000
    debug: bool = False
    
    # Database configuration
    database_url: str = "sqlite:///./beacon_network.db"
    
    # Encryption configuration
    encryption_key: Optional[str] = None
    
    # CORS configuration
    allowed_origins: list = ["*"]
    
    # Application info
    app_name: str = "Beacon Network API"
    app_version: str = "1.0.0"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global settings instance
settings = Settings()
