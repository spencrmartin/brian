"""
Database connection and initialization - inspired by Goose's session manager
"""
import sqlite3
import os
from pathlib import Path
from typing import Optional
from contextlib import contextmanager

from .schema import SCHEMA_SQL, SCHEMA_VERSION, get_schema_version_sql


class Database:
    """SQLite database manager for brian"""
    
    def __init__(self, db_path: Optional[str] = None):
        """
        Initialize database connection
        
        Args:
            db_path: Path to SQLite database file. If None, uses default location.
        """
        if db_path is None:
            # Default to ~/.brian/brian.db
            home = Path.home()
            brian_dir = home / ".brian"
            brian_dir.mkdir(exist_ok=True, parents=True)
            db_path = str(brian_dir / "brian.db")
        else:
            # Ensure parent directory exists for custom path
            db_file = Path(db_path)
            db_file.parent.mkdir(exist_ok=True, parents=True)
        
        self.db_path = db_path
        self._connection: Optional[sqlite3.Connection] = None
        
    def connect(self) -> sqlite3.Connection:
        """Get or create database connection"""
        if self._connection is None:
            self._connection = sqlite3.connect(
                self.db_path,
                check_same_thread=False,
                isolation_level=None  # Autocommit mode
            )
            # Enable foreign keys
            self._connection.execute("PRAGMA foreign_keys = ON")
            # Use Row factory for dict-like access
            self._connection.row_factory = sqlite3.Row
            
        return self._connection
    
    def initialize(self):
        """Initialize database schema"""
        conn = self.connect()
        cursor = conn.cursor()
        
        # Check if database is already initialized
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'"
        )
        
        if cursor.fetchone() is None:
            # New database - create schema
            print(f"Initializing new brian database at {self.db_path}")
            cursor.executescript(SCHEMA_SQL)
            cursor.execute(get_schema_version_sql())
            conn.commit()
            print("Database initialized successfully!")
        else:
            # Check schema version
            cursor.execute("SELECT version FROM schema_version ORDER BY version DESC LIMIT 1")
            result = cursor.fetchone()
            current_version = result[0] if result else 0
            
            if current_version < SCHEMA_VERSION:
                print(f"Migrating database from version {current_version} to {SCHEMA_VERSION}")
                self._migrate(current_version, SCHEMA_VERSION)
            elif current_version > SCHEMA_VERSION:
                raise ValueError(
                    f"Database version {current_version} is newer than application version {SCHEMA_VERSION}"
                )
    
    def _migrate(self, from_version: int, to_version: int):
        """Run database migrations"""
        from .migrations import apply_migrations
        
        conn = self.connect()
        apply_migrations(conn, from_version, to_version)
        print(f"Migration complete: {from_version} -> {to_version}")
    
    @contextmanager
    def transaction(self):
        """Context manager for database transactions"""
        conn = self.connect()
        cursor = conn.cursor()
        
        # Start transaction
        cursor.execute("BEGIN")
        
        try:
            yield cursor
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
    
    def execute(self, query: str, params: tuple = ()):
        """Execute a single query"""
        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute(query, params)
        return cursor
    
    def executemany(self, query: str, params_list: list):
        """Execute query with multiple parameter sets"""
        conn = self.connect()
        cursor = conn.cursor()
        cursor.executemany(query, params_list)
        return cursor
    
    def fetchone(self, query: str, params: tuple = ()):
        """Execute query and fetch one result"""
        cursor = self.execute(query, params)
        return cursor.fetchone()
    
    def fetchall(self, query: str, params: tuple = ()):
        """Execute query and fetch all results"""
        cursor = self.execute(query, params)
        return cursor.fetchall()
    
    def close(self):
        """Close database connection"""
        if self._connection:
            self._connection.close()
            self._connection = None
    
    def __enter__(self):
        """Context manager entry"""
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()
