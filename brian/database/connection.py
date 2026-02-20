"""
Database connection and initialization - inspired by Goose's session manager
"""
import sqlite3
import shutil
import os
from pathlib import Path
from typing import Optional
from contextlib import contextmanager
from datetime import datetime

from .schema import SCHEMA_SQL, SCHEMA_VERSION, get_schema_version_sql


# Maximum number of backup files to keep
MAX_BACKUPS = 5


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
        """Initialize database schema, running migrations if needed."""
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
                    f"Database version {current_version} is newer than application version {SCHEMA_VERSION}. "
                    f"Please update Brian to the latest version."
                )
    
    def get_schema_version(self) -> int:
        """Return the current schema version of the database."""
        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='schema_version'"
        )
        if cursor.fetchone() is None:
            return 0
        cursor.execute("SELECT version FROM schema_version ORDER BY version DESC LIMIT 1")
        result = cursor.fetchone()
        return result[0] if result else 0

    def get_sqlite_version(self) -> str:
        """Return the SQLite library version."""
        conn = self.connect()
        cursor = conn.cursor()
        cursor.execute("SELECT sqlite_version()")
        return cursor.fetchone()[0]

    def fts5_available(self) -> bool:
        """Check if FTS5 is available in this SQLite build."""
        try:
            import sqlite3
            conn = sqlite3.connect(":memory:")
            conn.execute("CREATE VIRTUAL TABLE _fts5_test USING fts5(content)")
            conn.execute("DROP TABLE _fts5_test")
            conn.close()
            return True
        except Exception:
            return False

    # ── Backup & Restore ─────────────────────────────────────────────────────

    def backup(self, reason: str = "manual") -> Optional[str]:
        """
        Create a backup of the database file.
        
        Args:
            reason: Label for the backup (e.g. 'pre-migrate-v8', 'manual')
            
        Returns:
            Path to the backup file, or None if backup failed.
        """
        db_file = Path(self.db_path)
        if not db_file.exists():
            return None
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"{db_file.stem}.backup.{reason}.{timestamp}{db_file.suffix}"
        backup_path = db_file.parent / backup_name
        
        try:
            # Use SQLite's online backup API for a consistent snapshot,
            # even if the database is currently open.
            conn = self.connect()
            backup_conn = sqlite3.connect(str(backup_path))
            conn.backup(backup_conn)
            backup_conn.close()
            
            size_mb = backup_path.stat().st_size / (1024 * 1024)
            print(f"  ✓ Backup created: {backup_path.name} ({size_mb:.1f} MB)")
            return str(backup_path)
        except Exception as e:
            print(f"  ✗ Backup failed: {e}")
            # Clean up partial backup
            if backup_path.exists():
                backup_path.unlink()
            return None

    def restore(self, backup_path: str) -> bool:
        """
        Restore the database from a backup file.
        
        Closes the current connection, replaces the db file, and reconnects.
        
        Args:
            backup_path: Path to the backup file.
            
        Returns:
            True if restore succeeded.
        """
        backup_file = Path(backup_path)
        if not backup_file.exists():
            print(f"  ✗ Restore failed: backup not found at {backup_path}")
            return False
        
        try:
            # Close current connection
            self.close()
            
            # Replace the database file
            shutil.copy2(str(backup_file), self.db_path)
            
            # Reconnect and verify
            conn = self.connect()
            cursor = conn.cursor()
            cursor.execute("PRAGMA integrity_check")
            result = cursor.fetchone()
            if result[0] != "ok":
                print(f"  ✗ Restored database failed integrity check: {result[0]}")
                return False
            
            print(f"  ✓ Database restored from {backup_file.name}")
            return True
        except Exception as e:
            print(f"  ✗ Restore failed: {e}")
            return False

    def list_backups(self) -> list[dict]:
        """
        List all backup files for this database.
        
        Returns:
            List of dicts with 'path', 'name', 'size_mb', 'created_at'.
        """
        db_file = Path(self.db_path)
        pattern = f"{db_file.stem}.backup.*{db_file.suffix}"
        backups = []
        
        for f in sorted(db_file.parent.glob(pattern), reverse=True):
            backups.append({
                "path": str(f),
                "name": f.name,
                "size_mb": round(f.stat().st_size / (1024 * 1024), 2),
                "created_at": datetime.fromtimestamp(f.stat().st_mtime).isoformat(),
            })
        
        return backups

    def cleanup_backups(self, keep: int = MAX_BACKUPS):
        """
        Remove old backups, keeping the most recent `keep` files.
        """
        backups = self.list_backups()
        if len(backups) <= keep:
            return
        
        for old in backups[keep:]:
            try:
                Path(old["path"]).unlink()
                print(f"  🗑 Removed old backup: {old['name']}")
            except Exception as e:
                print(f"  ✗ Failed to remove {old['name']}: {e}")

    # ── Migration with backup + rollback ─────────────────────────────────────

    def _migrate(self, from_version: int, to_version: int):
        """Run database migrations with automatic backup and rollback."""
        from .migrations import apply_migrations
        
        # Create a pre-migration backup
        backup_path = self.backup(reason=f"pre-migrate-v{from_version}-to-v{to_version}")
        if backup_path is None and Path(self.db_path).exists():
            print("  ⚠ WARNING: Could not create backup before migration. Proceeding anyway.")
        
        conn = self.connect()
        
        try:
            apply_migrations(conn, from_version, to_version)
            print(f"Migration complete: v{from_version} → v{to_version}")
            
            # Clean up old backups after successful migration
            self.cleanup_backups()
            
        except Exception as e:
            print(f"  ✗ Migration FAILED at v{from_version} → v{to_version}: {e}")
            
            if backup_path:
                print(f"  ↩ Rolling back to pre-migration backup...")
                if self.restore(backup_path):
                    print(f"  ✓ Rollback successful. Database is at v{from_version}.")
                else:
                    print(f"  ✗ Rollback FAILED. Manual recovery needed from: {backup_path}")
            
            raise RuntimeError(
                f"Database migration failed (v{from_version} → v{to_version}): {e}. "
                f"{'Rolled back to previous version.' if backup_path else 'No backup available.'}"
            ) from e
    
    # ── Core database operations ─────────────────────────────────────────────

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
