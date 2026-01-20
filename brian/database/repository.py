"""
Repository layer for database operations
"""
from typing import List, Optional, Dict
from datetime import datetime

from .connection import Database
from ..models import KnowledgeItem, Tag, Connection, ItemType


class KnowledgeRepository:
    """Repository for knowledge items operations"""
    
    def __init__(self, db: Database):
        self.db = db
    
    def create(self, item: KnowledgeItem) -> KnowledgeItem:
        """Create a new knowledge item"""
        # If created_at is provided, use it; otherwise let DB use default
        if item.created_at:
            query = """
                INSERT INTO knowledge_items 
                (id, title, content, item_type, url, language, favorite, vote_count, 
                 created_at, updated_at, accessed_at, link_title, link_description, link_image, link_site_name,
                 pinboard_x, pinboard_y)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            created_at_str = item.created_at.isoformat()
            self.db.execute(query, (
                item.id,
                item.title,
                item.content,
                item.item_type.value,
                item.url,
                item.language,
                item.favorite,
                item.vote_count,
                created_at_str,
                created_at_str,  # updated_at same as created_at initially
                created_at_str,  # accessed_at same as created_at initially
                item.link_title,
                item.link_description,
                item.link_image,
                item.link_site_name,
                item.pinboard_x,
                item.pinboard_y
            ))
        else:
            query = """
                INSERT INTO knowledge_items 
                (id, title, content, item_type, url, language, favorite, vote_count,
                 link_title, link_description, link_image, link_site_name, pinboard_x, pinboard_y)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            self.db.execute(query, (
                item.id,
                item.title,
                item.content,
                item.item_type.value,
                item.url,
                item.language,
                item.favorite,
                item.vote_count,
                item.link_title,
                item.link_description,
                item.link_image,
                item.link_site_name,
                item.pinboard_x,
                item.pinboard_y
            ))
        
        # Add tags if provided
        if item.tags:
            self._add_tags_to_item(item.id, item.tags)
        
        return self.get_by_id(item.id)
    
    def get_by_id(self, item_id: str) -> Optional[KnowledgeItem]:
        """Get knowledge item by ID"""
        query = "SELECT * FROM knowledge_items WHERE id = ?"
        row = self.db.fetchone(query, (item_id,))
        
        if not row:
            return None
        
        # Get tags for this item
        tags = self._get_tags_for_item(item_id)
        
        return KnowledgeItem.from_db_row(dict(row), tags)
    
    def get_all(self, 
                item_type: Optional[ItemType] = None,
                favorite_only: bool = False,
                limit: int = 100,
                offset: int = 0,
                sort_by: str = "created_at",
                sort_order: str = "DESC") -> List[KnowledgeItem]:
        """Get all knowledge items with optional filtering"""
        
        query = "SELECT * FROM knowledge_items WHERE 1=1"
        params = []
        
        if item_type:
            query += " AND item_type = ?"
            params.append(item_type.value)
        
        if favorite_only:
            query += " AND favorite = 1"
        
        # Add sorting
        valid_sort_fields = ["created_at", "updated_at", "vote_count", "title"]
        if sort_by not in valid_sort_fields:
            sort_by = "created_at"
        
        sort_order = "DESC" if sort_order.upper() == "DESC" else "ASC"
        query += f" ORDER BY {sort_by} {sort_order}"
        
        # Add pagination
        query += " LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        rows = self.db.fetchall(query, tuple(params))
        
        items = []
        for row in rows:
            tags = self._get_tags_for_item(row['id'])
            items.append(KnowledgeItem.from_db_row(dict(row), tags))
        
        return items
    
    def update(self, item: KnowledgeItem) -> KnowledgeItem:
        """Update a knowledge item"""
        query = """
            UPDATE knowledge_items 
            SET title = ?, content = ?, item_type = ?, url = ?, 
                language = ?, favorite = ?, vote_count = ?,
                link_title = ?, link_description = ?, link_image = ?, link_site_name = ?,
                pinboard_x = ?, pinboard_y = ?
            WHERE id = ?
        """
        self.db.execute(query, (
            item.title,
            item.content,
            item.item_type.value,
            item.url,
            item.language,
            item.favorite,
            item.vote_count,
            item.link_title,
            item.link_description,
            item.link_image,
            item.link_site_name,
            item.pinboard_x,
            item.pinboard_y,
            item.id
        ))
        
        # Update tags
        self._update_tags_for_item(item.id, item.tags)
        
        return self.get_by_id(item.id)
    
    def delete(self, item_id: str) -> bool:
        """Delete a knowledge item"""
        query = "DELETE FROM knowledge_items WHERE id = ?"
        cursor = self.db.execute(query, (item_id,))
        return cursor.rowcount > 0
    
    def search(self, query_text: str, limit: int = 50) -> List[KnowledgeItem]:
        """Full-text search across knowledge items"""
        import sqlite3
        
        # Create a fresh connection for FTS queries to avoid the initialize() issue
        # The Database wrapper's connection gets corrupted after initialize() is called
        conn = sqlite3.connect(self.db.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # First, search the FTS table to get matching item IDs
        fts_query = """
            SELECT item_id, rank 
            FROM knowledge_search 
            WHERE knowledge_search MATCH ? 
            ORDER BY rank
            LIMIT ?
        """
        cursor.execute(fts_query, (query_text, limit))
        fts_rows = cursor.fetchall()
        conn.close()
        
        if not fts_rows:
            return []
        
        # Get the full item details for matching IDs using the regular db connection
        item_ids = [row['item_id'] for row in fts_rows]
        placeholders = ','.join('?' * len(item_ids))
        
        items_query = f"""
            SELECT * FROM knowledge_items 
            WHERE id IN ({placeholders})
        """
        rows = self.db.fetchall(items_query, tuple(item_ids))
        
        # Create a map of id to rank for sorting
        rank_map = {row['item_id']: idx for idx, row in enumerate(fts_rows)}
        
        items = []
        for row in rows:
            tags = self._get_tags_for_item(row['id'])
            items.append(KnowledgeItem.from_db_row(dict(row), tags))
        
        # Sort by FTS rank
        items.sort(key=lambda item: rank_map.get(item.id, 999))
        
        return items
    
    def toggle_favorite(self, item_id: str) -> bool:
        """Toggle favorite status"""
        item = self.get_by_id(item_id)
        if not item:
            return False
        
        query = "UPDATE knowledge_items SET favorite = ? WHERE id = ?"
        self.db.execute(query, (not item.favorite, item_id))
        return True
    
    def increment_vote(self, item_id: str) -> int:
        """Increment vote count"""
        query = "UPDATE knowledge_items SET vote_count = vote_count + 1 WHERE id = ?"
        self.db.execute(query, (item_id,))
        
        item = self.get_by_id(item_id)
        return item.vote_count if item else 0
    
    def decrement_vote(self, item_id: str) -> int:
        """Decrement vote count"""
        query = "UPDATE knowledge_items SET vote_count = vote_count - 1 WHERE id = ?"
        self.db.execute(query, (item_id,))
        
        item = self.get_by_id(item_id)
        return item.vote_count if item else 0
    
    def get_by_date_range(self, start_date: datetime, end_date: datetime) -> List[KnowledgeItem]:
        """Get items within a date range (for Time Machine view)"""
        query = """
            SELECT * FROM knowledge_items 
            WHERE created_at BETWEEN ? AND ?
            ORDER BY created_at DESC
        """
        rows = self.db.fetchall(query, (start_date.isoformat(), end_date.isoformat()))
        
        items = []
        for row in rows:
            tags = self._get_tags_for_item(row['id'])
            items.append(KnowledgeItem.from_db_row(dict(row), tags))
        
        return items
    
    def _get_tags_for_item(self, item_id: str) -> List[str]:
        """Get all tags for an item"""
        query = """
            SELECT t.name FROM tags t
            JOIN item_tags it ON t.id = it.tag_id
            WHERE it.item_id = ?
        """
        rows = self.db.fetchall(query, (item_id,))
        return [row['name'] for row in rows]
    
    def _add_tags_to_item(self, item_id: str, tags: List[str]):
        """Add tags to an item"""
        for tag_name in tags:
            # Get or create tag
            tag_id = self._get_or_create_tag(tag_name)
            
            # Link tag to item
            query = "INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)"
            self.db.execute(query, (item_id, tag_id))
    
    def _update_tags_for_item(self, item_id: str, tags: List[str]):
        """Update tags for an item (replace all)"""
        # Remove existing tags
        self.db.execute("DELETE FROM item_tags WHERE item_id = ?", (item_id,))
        
        # Add new tags
        self._add_tags_to_item(item_id, tags)
    
    def _get_or_create_tag(self, tag_name: str) -> int:
        """Get existing tag ID or create new tag"""
        # Try to get existing
        query = "SELECT id FROM tags WHERE name = ?"
        row = self.db.fetchone(query, (tag_name,))
        
        if row:
            return row['id']
        
        # Create new
        query = "INSERT INTO tags (name) VALUES (?)"
        cursor = self.db.execute(query, (tag_name,))
        return cursor.lastrowid


class TagRepository:
    """Repository for tag operations"""
    
    def __init__(self, db: Database):
        self.db = db
    
    def get_all(self) -> List[Tag]:
        """Get all tags"""
        query = "SELECT * FROM tags ORDER BY name"
        rows = self.db.fetchall(query)
        return [Tag.from_db_row(dict(row)) for row in rows]
    
    def get_popular(self, limit: int = 20) -> List[Dict]:
        """Get most used tags"""
        query = """
            SELECT t.*, COUNT(it.item_id) as usage_count
            FROM tags t
            LEFT JOIN item_tags it ON t.id = it.tag_id
            GROUP BY t.id
            ORDER BY usage_count DESC
            LIMIT ?
        """
        rows = self.db.fetchall(query, (limit,))
        return [dict(row) for row in rows]


class ConnectionRepository:
    """Repository for knowledge graph connections"""
    
    def __init__(self, db: Database):
        self.db = db
    
    def create(self, connection: Connection) -> Connection:
        """Create a connection between items"""
        query = """
            INSERT INTO connections 
            (source_item_id, target_item_id, connection_type, strength, notes)
            VALUES (?, ?, ?, ?, ?)
        """
        cursor = self.db.execute(query, (
            connection.source_item_id,
            connection.target_item_id,
            connection.connection_type,
            connection.strength,
            connection.notes
        ))
        
        connection.id = cursor.lastrowid
        return connection
    
    def get_for_item(self, item_id: str) -> List[Connection]:
        """Get all connections for an item (both source and target)"""
        query = """
            SELECT * FROM connections 
            WHERE source_item_id = ? OR target_item_id = ?
        """
        rows = self.db.fetchall(query, (item_id, item_id))
        return [Connection.from_db_row(dict(row)) for row in rows]
    
    def get_graph_data(self) -> Dict:
        """Get all connections for graph visualization"""
        query = "SELECT * FROM connections"
        rows = self.db.fetchall(query)
        
        connections = [Connection.from_db_row(dict(row)) for row in rows]
        
        # Get all items involved
        item_ids = set()
        for conn in connections:
            item_ids.add(conn.source_item_id)
            item_ids.add(conn.target_item_id)
        
        return {
            "connections": [c.to_dict() for c in connections],
            "item_ids": list(item_ids)
        }
    
    def delete(self, connection_id: int) -> bool:
        """Delete a connection"""
        query = "DELETE FROM connections WHERE id = ?"
        cursor = self.db.execute(query, (connection_id,))
        return cursor.rowcount > 0
