"""
WalletDNA™ Encryption Module - Enhanced Security & Performance
Handles secure encryption of wallet data and sensitive information
"""

import os
import time
import base64
import hashlib
import logging
from typing import Dict, Any, Optional, Union, Tuple
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes, hmac
from cryptography.hazmat.backends import default_backend
from cryptography.fernet import Fernet
import secrets

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("wallet-encryptor")

class WalletEncryptor:
    """
    Enhanced wallet encryption system with performance optimization
    and security hardening for WalletDNA™
    """
    
    # Class constants
    KEY_LENGTH = 32  # 256 bits
    SALT_LENGTH = 16  # 128 bits
    ITERATIONS = 600000  # OWASP recommended minimum
    NONCE_LENGTH = 12  # 96 bits for AES-GCM
    TAG_LENGTH = 16  # 128 bits for authentication tag
    
    def __init__(self, master_key: Optional[str] = None):
        """
        Initialize the encryptor with a master key or environment variable
        
        Args:
            master_key: Optional master encryption key, will use env var if not provided
        """
        self._backend = default_backend()
        self._master_key = self._get_master_key(master_key)
        self._key_cache = {}  # Performance optimization: cache derived keys
        self._last_rotation = time.time()
        self._rotation_interval = 3600  # Key rotation every hour
        
        # Performance optimization: pre-compute common values
        self._hash_algorithm = hashes.SHA256()
        
        # Security hardening: verify environment
        self._verify_secure_environment()
        
        logger.info("WalletEncryptor initialized with secure configuration")
    
    def _get_master_key(self, provided_key: Optional[str]) -> bytes:
        """
        Get the master encryption key from provided value or environment
        
        Args:
            provided_key: Optional key provided during initialization
            
        Returns:
            bytes: The master encryption key
            
        Raises:
            ValueError: If no key is available
        """
        if provided_key:
            # Convert string key to bytes if provided directly
            key = provided_key.encode() if isinstance(provided_key, str) else provided_key
        else:
            # Try to get from environment variable
            env_key = os.getenv('WALLET_ENCRYPTION_KEY')
            if not env_key:
                # Security hardening: generate a key if none exists
                # Note: This should be saved securely for production use
                logger.warning("No encryption key found, generating a temporary one")
                key = Fernet.generate_key()
            else:
                key = env_key.encode()
        
        # Security hardening: validate key length
        if len(key) < self.KEY_LENGTH:
            raise ValueError(f"Encryption key must be at least {self.KEY_LENGTH} bytes")
            
        return key
    
    def _verify_secure_environment(self) -> None:
        """
        Verify that the execution environment is secure
        
        Raises:
            RuntimeError: If critical security issues are detected
        """
        # Check for debug mode
        if os.getenv('DEBUG') == 'True':
            logger.warning("Running in DEBUG mode - not recommended for production")
        
        # Check for secure storage of keys
        if 'WALLET_ENCRYPTION_KEY' in os.environ:
            logger.info("Using environment variable for encryption key")
        
        # Check Python version for security patches
        import sys
        if sys.version_info < (3, 8):
            logger.warning("Running on Python < 3.8, security updates may be missing")
    
    def _derive_key(self, password: str, salt: Optional[bytes] = None) -> Tuple[bytes, bytes]:
        """
        Derive a key from password using PBKDF2
        
        Args:
            password: User password for key derivation
            salt: Optional salt, generated if not provided
            
        Returns:
            Tuple[bytes, bytes]: (derived_key, salt)
        """
        # Performance optimization: check cache first
        cache_key = f"{password}:{salt if salt else 'new'}"
        if cache_key in self._key_cache:
            return self._key_cache[cache_key]
        
        # Generate salt if not provided
        if not salt:
            salt = secrets.token_bytes(self.SALT_LENGTH)
        
        # Derive key using PBKDF2
        start_time = time.time()
        kdf = PBKDF2HMAC(
            algorithm=self._hash_algorithm,
            length=self.KEY_LENGTH,
            salt=salt,
            iterations=self.ITERATIONS,
            backend=self._backend
        )
        derived_key = kdf.derive(password.encode())
        
        # Performance monitoring
        elapsed = time.time() - start_time
        if elapsed > 1.0:
            logger.warning(f"Key derivation took {elapsed:.2f}s, consider adjusting parameters")
        
        # Cache the result for performance
        self._key_cache[cache_key] = (derived_key, salt)
        
        # Security hardening: limit cache size
        if len(self._key_cache) > 100:
            # Remove oldest entries
            for old_key in list(self._key_cache.keys())[:10]:
                del self._key_cache[old_key]
        
        return derived_key, salt
    
    def encrypt_wallet_data(self, data: Dict[str, Any], password: str) -> Dict[str, Any]:
        """
        Encrypt wallet data with user password
        
        Args:
            data: Dictionary containing wallet data
            password: User password for encryption
            
        Returns:
            Dict: Encrypted data with metadata
        """
        # Check for key rotation
        self._check_key_rotation()
        
        # Convert data to string if needed
        if not isinstance(data, str):
            import json
            data_str = json.dumps(data)
        else:
            data_str = data
        
        # Derive key from password
        key, salt = self._derive_key(password)
        
        # Generate a random nonce
        nonce = secrets.token_bytes(self.NONCE_LENGTH)
        
        # Encrypt the data using AES-GCM
        try:
            start_time = time.time()
            
            # Performance optimization: use AES-GCM for authenticated encryption
            aesgcm = AESGCM(key)
            ciphertext = aesgcm.encrypt(nonce, data_str.encode(), None)
            
            elapsed = time.time() - start_time
            if elapsed > 0.1:
                logger.warning(f"Encryption took {elapsed:.2f}s for {len(data_str)} bytes")
            
            # Encode binary data for storage/transmission
            encrypted_data = {
                "version": 2,  # Version for future compatibility
                "salt": base64.b64encode(salt).decode(),
                "nonce": base64.b64encode(nonce).decode(),
                "ciphertext": base64.b64encode(ciphertext).decode(),
                "kdf": "pbkdf2",
                "iterations": self.ITERATIONS,
                "timestamp": int(time.time())
            }
            
            # Security hardening: add integrity check
            encrypted_data["checksum"] = self._compute_checksum(encrypted_data)
            
            return encrypted_data
            
        except Exception as e:
            # Security hardening: don't expose specific errors
            logger.error(f"Encryption error: {str(e)}")
            raise ValueError("Failed to encrypt wallet data")
    
    def decrypt_wallet_data(self, encrypted_data: Dict[str, Any], password: str) -> Dict[str, Any]:
        """
        Decrypt wallet data with user password
        
        Args:
            encrypted_data: Dictionary containing encrypted wallet data
            password: User password for decryption
            
        Returns:
            Dict: Decrypted wallet data
        """
        try:
            # Security hardening: verify data integrity
            if not self._verify_checksum(encrypted_data):
                raise ValueError("Data integrity check failed")
            
            # Get encryption parameters
            version = encrypted_data.get("version", 1)
            salt = base64.b64decode(encrypted_data["salt"])
            
            if version == 1:
                # Legacy decryption (for backward compatibility)
                return self._decrypt_legacy(encrypted_data, password, salt)
            
            # Current version decryption
            nonce = base64.b64decode(encrypted_data["nonce"])
            ciphertext = base64.b64decode(encrypted_data["ciphertext"])
            
            # Derive the key
            key, _ = self._derive_key(password, salt)
            
            # Decrypt the data
            start_time = time.time()
            
            aesgcm = AESGCM(key)
            plaintext = aesgcm.decrypt(nonce, ciphertext, None)
            
            elapsed = time.time() - start_time
            if elapsed > 0.1:
                logger.warning(f"Decryption took {elapsed:.2f}s for {len(ciphertext)} bytes")
            
            # Parse the decrypted data
            import json
            decrypted_data = json.loads(plaintext.decode())
            
            return decrypted_data
            
        except Exception as e:
            # Security hardening: don't expose specific errors
            logger.error(f"Decryption error: {str(e)}")
            raise ValueError("Failed to decrypt wallet data. Invalid password or corrupted data.")
    
    def _decrypt_legacy(self, encrypted_data: Dict[str, Any], password: str, salt: bytes) -> Dict[str, Any]:
        """
        Decrypt legacy format data (version 1)
        
        Args:
            encrypted_data: Dictionary containing encrypted wallet data
            password: User password for decryption
            salt: Decoded salt value
            
        Returns:
            Dict: Decrypted wallet data
        """
        # Legacy format used Fernet
        key, _ = self._derive_key(password, salt)
        key_b64 = base64.urlsafe_b64encode(key)
        
        f = Fernet(key_b64)
        decrypted = f.decrypt(encrypted_data["ciphertext"].encode())
        
        import json
        return json.loads(decrypted.decode())
    
    def _compute_checksum(self, data: Dict[str, Any]) -> str:
        """
        Compute a checksum for data integrity verification
        
        Args:
            data: Dictionary to compute checksum for
            
        Returns:
            str: Base64-encoded checksum
        """
        # Create a deterministic representation of the data
        import json
        
        # Remove existing checksum if present
        data_copy = data.copy()
        data_copy.pop("checksum", None)
        
        # Sort keys for deterministic serialization
        serialized = json.dumps(data_copy, sort_keys=True).encode()
        
        # Compute HMAC using master key
        h = hmac.HMAC(self._master_key, hashes.SHA256(), backend=self._backend)
        h.update(serialized)
        digest = h.finalize()
        
        return base64.b64encode(digest).decode()
    
    def _verify_checksum(self, data: Dict[str, Any]) -> bool:
        """
        Verify the integrity checksum of data
        
        Args:
            data: Dictionary with checksum to verify
            
        Returns:
            bool: True if checksum is valid
        """
        if "checksum" not in data:
            # Legacy data might not have checksum
            logger.warning("No checksum found in encrypted data")
            return True
            
        expected = data["checksum"]
        actual = self._compute_checksum(data)
        
        return secrets.compare_digest(expected, actual)
    
    def _check_key_rotation(self) -> None:
        """
        Check if key rotation is needed and perform rotation if necessary
        """
        current_time = time.time()
        if current_time - self._last_rotation > self._rotation_interval:
            logger.info("Performing key cache rotation")
            self._key_cache.clear()
            self._last_rotation = current_time
    
    def generate_wallet_key(self, strength: str = "high") -> str:
        """
        Generate a secure wallet key/password with specified strength
        
        Args:
            strength: Key strength ('medium', 'high', 'very-high')
            
        Returns:
            str: Generated secure key
        """
        # Define strength parameters
        strength_params = {
            "medium": 16,    # 16 bytes = 128 bits
            "high": 24,      # 24 bytes = 192 bits
            "very-high": 32  # 32 bytes = 256 bits
        }
        
        # Get byte length based on strength
        byte_length = strength_params.get(strength, 24)
        
        # Generate random bytes
        random_bytes = secrets.token_bytes(byte_length)
        
        # Convert to URL-safe base64
        return base64.urlsafe_b64encode(random_bytes).decode()
    
    def secure_wipe(self, data: Union[bytes, bytearray, memoryview]) -> None:
        """
        Securely wipe sensitive data from memory
        
        Args:
            data: Data to be wiped
        """
        # Security hardening: overwrite with random data before deletion
        if isinstance(data, (bytes, bytearray, memoryview)):
            for i in range(len(data)):
                data[i] = 0  # Zero out the data
        
        # For dictionaries, clear sensitive fields
        elif isinstance(data, dict):
            for key in list(data.keys()):
                if any(sensitive in key.lower() for sensitive in ['key', 'password', 'secret', 'private']):
                    data[key] = None
    
    def benchmark(self, data_size: int = 1024) -> Dict[str, float]:
        """
        Benchmark encryption and decryption performance
        
        Args:
            data_size: Size of test data in bytes
            
        Returns:
            Dict: Benchmark results
        """
        # Generate test data
        import json
        test_data = {
            "address": "bc1q84nj6vvpwlq2vkv5xjgwlkxh5du6h4uhy4yxlt",
            "balance": 1.23456789,
            "transactions": [f"tx{i}" for i in range(100)],
            "payload": "X" * max(0, data_size - 500)  # Adjust to reach target size
        }
        test_data_str = json.dumps(test_data)
        
        # Benchmark key derivation
        start_time = time.time()
        password = "benchmark-password"
        self._derive_key(password)
        key_derivation_time = time.time() - start_time
        
        # Benchmark encryption
        start_time = time.time()
        encrypted = self.encrypt_wallet_data(test_data, password)
        encryption_time = time.time() - start_time
        
        # Benchmark decryption
        start_time = time.time()
        self.decrypt_wallet_data(encrypted, password)
        decryption_time = time.time() - start_time
        
        return {
            "data_size_bytes": len(test_data_str),
            "key_derivation_ms": key_derivation_time * 1000,
            "encryption_ms": encryption_time * 1000,
            "decryption_ms": decryption_time * 1000,
            "throughput_mbps": (len(test_data_str) / 1024 / 1024) / encryption_time
        }


# Example usage
if __name__ == "__main__":
    # Set up a test environment variable
    os.environ["WALLET_ENCRYPTION_KEY"] = base64.b64encode(secrets.token_bytes(32)).decode()
    
    # Create encryptor
    encryptor = WalletEncryptor()
    
    # Test data
    wallet_data = {
        "address": "bc1q84nj6vvpwlq2vkv5xjgwlkxh5du6h4uhy4yxlt",
        "private_key_encrypted": "not_a_real_key",
        "balance": 1.23456789,
        "transactions": [
            {"txid": "abcdef", "amount": 0.1, "timestamp": 1620000000},
            {"txid": "ghijkl", "amount": -0.05, "timestamp": 1620100000}
        ]
    }
    
    # Test password
    password = "secure-test-password"
    
    # Encrypt the data
    print("Encrypting wallet data...")
    encrypted = encryptor.encrypt_wallet_data(wallet_data, password)
    print(f"Encrypted data: {encrypted}")
    
    # Decrypt the data
    print("\nDecrypting wallet data...")
    decrypted = encryptor.decrypt_wallet_data(encrypted, password)
    print(f"Decrypted data: {decrypted}")
    
    # Run benchmark
    print("\nRunning benchmark...")
    results = encryptor.benchmark(data_size=10240)  # 10KB
    print(f"Benchmark results: {results}")
    
    # Security hardening: clean up
    encryptor.secure_wipe(encrypted)
    del password
    del wallet_data
    del decrypted
