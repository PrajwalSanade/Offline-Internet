"""
Encryption utilities for the Beacon Network application.
Provides AES encryption/decryption for message content.
"""

import os
import base64
from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
from Crypto.Util.Padding import pad, unpad


class EncryptionManager:
    """Handles AES encryption and decryption of messages."""

    def __init__(self, key: str | None = None):
        """
        Initialize encryption manager.
        
        Args:
            key: Encryption key (32 bytes for AES-256). 
                 If None, generates a new key.
        """
        if key is None:
            self.key = os.getenv("ENCRYPTION_KEY", "")
            if not self.key:
                self.key = base64.b64encode(get_random_bytes(32)).decode("utf-8")
        else:
            self.key = key

    def _get_key_bytes(self) -> bytes:
        """Convert string key to bytes for AES cipher."""
        if isinstance(self.key, str):
            key_bytes = base64.b64decode(self.key)
        else:
            key_bytes = self.key
        
        # Ensure key is 32 bytes for AES-256
        if len(key_bytes) != 32:
            raise ValueError(f"Key must be 32 bytes, got {len(key_bytes)}")
        return key_bytes

    def encrypt(self, plaintext: str) -> str:
        """
        Encrypt plaintext using AES-256-CBC.
        
        Args:
            plaintext: Text to encrypt
            
        Returns:
            Base64-encoded ciphertext with IV prepended
        """
        key = self._get_key_bytes()
        iv = get_random_bytes(16)
        cipher = AES.new(key, AES.MODE_CBC, iv)
        
        padded_data = pad(plaintext.encode("utf-8"), AES.block_size)
        ciphertext = cipher.encrypt(padded_data)
        
        # Prepend IV to ciphertext and encode as base64
        encrypted_data = iv + ciphertext
        return base64.b64encode(encrypted_data).decode("utf-8")

    def decrypt(self, encrypted_text: str) -> str:
        """
        Decrypt AES-256-CBC encrypted text.
        
        Args:
            encrypted_text: Base64-encoded ciphertext with IV
            
        Returns:
            Decrypted plaintext
            
        Raises:
            ValueError: If decryption fails
        """
        try:
            key = self._get_key_bytes()
            encrypted_data = base64.b64decode(encrypted_text)
            
            # Extract IV (first 16 bytes) and ciphertext
            iv = encrypted_data[:16]
            ciphertext = encrypted_data[16:]
            
            cipher = AES.new(key, AES.MODE_CBC, iv)
            padded_plaintext = cipher.decrypt(ciphertext)
            plaintext = unpad(padded_plaintext, AES.block_size).decode("utf-8")
            
            return plaintext
        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")


# Global encryption manager instance
encryption_manager = EncryptionManager()
