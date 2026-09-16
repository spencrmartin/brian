"""
Configuration for brian

Priority order (highest wins):
  1. Environment variables (BRIAN_PORT, BRIAN_HOST, etc.)
  2. Config file (~/.brian/config.json)
  3. Built-in defaults

Version is read from pyproject.toml (single source of truth).
"""
import json
import os
import re
import socket
from pathlib import Path
from typing import Optional


def _read_version() -> str:
    """Read version from pyproject.toml. Falls back to hardcoded if not found."""
    try:
        pyproject = Path(__file__).parent.parent / "pyproject.toml"
        if pyproject.exists():
            text = pyproject.read_text()
            match = re.search(r'^version\s*=\s*"([^"]+)"', text, re.MULTILINE)
            if match:
                return match.group(1)
    except Exception:
        pass
    return "0.1.0"  # fallback for PyInstaller builds where pyproject.toml isn't available


# ── Defaults ─────────────────────────────────────────────────────────────────

BRIAN_DIR = Path.home() / ".brian"
DEFAULT_DB_PATH = str(BRIAN_DIR / "brian.db")
DEFAULT_CONFIG_PATH = str(BRIAN_DIR / "config.json")
DEFAULT_HOST = "127.0.0.1"
DEFAULT_PORT = 8080
PORT_FILE = str(BRIAN_DIR / "port")

# How many ports to try before giving up
MAX_PORT_ATTEMPTS = 20


def _find_free_port(host: str, start_port: int, max_attempts: int = MAX_PORT_ATTEMPTS) -> int:
    """
    Find a free TCP port starting from `start_port`.
    Tries sequential ports up to `max_attempts`.
    
    Returns:
        A free port number.
        
    Raises:
        RuntimeError: If no free port is found.
    """
    for offset in range(max_attempts):
        port = start_port + offset
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind((host, port))
                return port
        except OSError:
            continue
    
    raise RuntimeError(
        f"Could not find a free port in range {start_port}–{start_port + max_attempts - 1}. "
        f"Please free a port or set BRIAN_PORT to an available port."
    )


def _load_config_file(path: str) -> dict:
    """Load config from JSON file, returning empty dict if missing or invalid."""
    try:
        config_path = Path(path)
        if config_path.exists():
            with open(config_path, "r") as f:
                data = json.load(f)
                if isinstance(data, dict):
                    return data
    except (json.JSONDecodeError, IOError, OSError) as e:
        print(f"  ⚠ Could not read config file {path}: {e}")
    return {}


def _save_config_file(path: str, data: dict):
    """Save config dict to JSON file."""
    try:
        config_path = Path(path)
        config_path.parent.mkdir(parents=True, exist_ok=True)
        with open(config_path, "w") as f:
            json.dump(data, f, indent=2, sort_keys=True)
    except (IOError, OSError) as e:
        print(f"  ⚠ Could not write config file {path}: {e}")


def write_port_file(port: int, path: str = PORT_FILE):
    """Write the active port to a file so Tauri (or other processes) can discover it."""
    try:
        port_path = Path(path)
        port_path.parent.mkdir(parents=True, exist_ok=True)
        port_path.write_text(str(port))
    except (IOError, OSError) as e:
        print(f"  ⚠ Could not write port file {path}: {e}")


def read_port_file(path: str = PORT_FILE) -> Optional[int]:
    """Read the active port from the port file. Returns None if missing or invalid."""
    try:
        port_path = Path(path)
        if port_path.exists():
            text = port_path.read_text().strip()
            return int(text)
    except (ValueError, IOError, OSError):
        pass
    return None


def cleanup_port_file(path: str = PORT_FILE):
    """Remove the port file on shutdown."""
    try:
        port_path = Path(path)
        if port_path.exists():
            port_path.unlink()
    except (IOError, OSError):
        pass


class Config:
    """
    Application configuration.
    
    Loads from: env vars > config file > defaults.
    Call Config.resolve_port() after construction to find a free port.
    """
    
    def __init__(self):
        # Ensure brian directory exists
        BRIAN_DIR.mkdir(parents=True, exist_ok=True)
        
        # Load config file
        self._config_path = os.getenv("BRIAN_CONFIG", DEFAULT_CONFIG_PATH)
        self._file_config = _load_config_file(self._config_path)
        
        # ── Resolve values: env var > config file > default ──
        
        self.DB_PATH = (
            os.getenv("BRIAN_DB_PATH")
            or self._file_config.get("db_path")
            or DEFAULT_DB_PATH
        )
        
        self.API_HOST = (
            os.getenv("BRIAN_HOST")
            or self._file_config.get("host")
            or DEFAULT_HOST
        )
        
        # Port: env var > config file > default (actual binding resolved later)
        self._configured_port = int(
            os.getenv("BRIAN_PORT")
            or self._file_config.get("port")
            or DEFAULT_PORT
        )
        self.API_PORT = self._configured_port  # May change after resolve_port()
        
        self.DEBUG = (
            os.getenv("BRIAN_DEBUG", "").lower() == "true"
            or self._file_config.get("debug", False)
        )
        
        # Application metadata
        self.APP_NAME = "brian"
        self.APP_VERSION = _read_version()
        self.APP_DESCRIPTION = "Your personal knowledge base - a play on brain"
        
        # CORS (for desktop app)
        self.CORS_ORIGINS = [
            "http://localhost:*",
            "http://127.0.0.1:*",
            "app://brian",
        ]
    
    def resolve_port(self) -> int:
        """
        Find a free port starting from the configured port.
        Updates self.API_PORT and writes the port file.
        
        Returns:
            The resolved free port.
        """
        self.API_PORT = _find_free_port(self.API_HOST, self._configured_port)
        
        if self.API_PORT != self._configured_port:
            print(f"  ⚠ Port {self._configured_port} is in use, using {self.API_PORT} instead")
        
        write_port_file(self.API_PORT)
        return self.API_PORT
    
    def save(self):
        """Persist current settings to the config file."""
        data = {
            "db_path": self.DB_PATH,
            "host": self.API_HOST,
            "port": self._configured_port,  # Save the preferred port, not the resolved one
            "debug": self.DEBUG,
        }
        _save_config_file(self._config_path, data)
    
    def to_dict(self) -> dict:
        """Return config as a dictionary (for API responses)."""
        return {
            "db_path": self.DB_PATH,
            "host": self.API_HOST,
            "port": self.API_PORT,
            "configured_port": self._configured_port,
            "debug": self.DEBUG,
            "config_file": self._config_path,
            "app_version": self.APP_VERSION,
        }
