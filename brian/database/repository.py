"""
Repository layer for database operations
"""
from typing import List, Optional, Dict
from datetime import datetime

from .connection import Database
from ..models import (
    KnowledgeItem, Tag, Connection, ItemType, 
    Region, RegionType, 
    RegionProfile, ContextStrategy, PROFILE_TEMPLATES,
    Project, DEFAULT_PROJECT_ID
)


class KnowledgeRepository:
    """Repository for knowledge items operations"""
    
    def __init__(self, db: Database):
        self.db = db
    
    def create(self, item: KnowledgeItem) -> KnowledgeItem:
        """Create a new knowledge item"""
        # Serialize skill_metadata to JSON if present
        import json
        skill_metadata_json = None
        if item.skill_metadata:
            skill_metadata_json = json.dumps(item.skill_metadata)
        
        # If created_at is provided, use it; otherwise let DB use default
        if item.created_at:
            query = """
                INSERT INTO knowledge_items 
                (id, title, content, item_type, url, language, favorite, vote_count, 
                 created_at, updated_at, accessed_at, link_title, link_description, link_image, link_site_name,
                 pinboard_x, pinboard_y, project_id, skill_metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                item.pinboard_y,
                item.project_id,
                skill_metadata_json
            ))
        else:
            query = """
                INSERT INTO knowledge_items 
                (id, title, content, item_type, url, language, favorite, vote_count,
                 link_title, link_description, link_image, link_site_name, pinboard_x, pinboard_y, project_id, skill_metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                item.pinboard_y,
                item.project_id,
                skill_metadata_json
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
                sort_order: str = "DESC",
                project_id: Optional[str] = None) -> List[KnowledgeItem]:
        """Get all knowledge items with optional filtering"""
        
        query = "SELECT * FROM knowledge_items WHERE 1=1"
        params = []
        
        if item_type:
            query += " AND item_type = ?"
            params.append(item_type.value)
        
        if favorite_only:
            query += " AND favorite = 1"
        
        if project_id:
            query += " AND project_id = ?"
            params.append(project_id)
        
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
    
    def search(self, query_text: str, limit: int = 50, project_id: Optional[str] = None) -> List[KnowledgeItem]:
        """Full-text search across knowledge items"""
        import sqlite3
        
        # Create a fresh connection for FTS queries to avoid the initialize() issue
        # The Database wrapper's connection gets corrupted after initialize() is called
        conn = sqlite3.connect(self.db.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # First, search the FTS table to get matching item IDs
        fts_query = """
            SELECT id, rank 
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
        item_ids = [row['id'] for row in fts_rows]
        placeholders = ','.join('?' * len(item_ids))
        
        # Build query with optional project_id filter
        if project_id:
            items_query = f"""
                SELECT * FROM knowledge_items 
                WHERE id IN ({placeholders}) AND project_id = ?
            """
            rows = self.db.fetchall(items_query, tuple(item_ids) + (project_id,))
        else:
            items_query = f"""
                SELECT * FROM knowledge_items 
                WHERE id IN ({placeholders})
            """
            rows = self.db.fetchall(items_query, tuple(item_ids))
        
        # Create a map of id to rank for sorting
        rank_map = {row['id']: idx for idx, row in enumerate(fts_rows)}
        
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

    def get_by_id(self, connection_id: int) -> Optional[Connection]:
        """Get a connection by ID"""
        query = "SELECT * FROM connections WHERE id = ?"
        row = self.db.fetchone(query, (connection_id,))
        if not row:
            return None
        return Connection.from_db_row(dict(row))

    def update(self, connection_id: int, **kwargs) -> Optional[Connection]:
        """Update a connection's type, strength, or notes"""
        allowed = {"connection_type", "strength", "notes"}
        updates = {k: v for k, v in kwargs.items() if k in allowed}
        if not updates:
            return self.get_by_id(connection_id)

        set_parts = [f"{k} = ?" for k in updates]
        params = list(updates.values()) + [connection_id]
        query = f"UPDATE connections SET {', '.join(set_parts)} WHERE id = ?"
        self.db.execute(query, tuple(params))
        return self.get_by_id(connection_id)


class RegionRepository:
    """Repository for knowledge region operations"""
    
    def __init__(self, db: Database):
        self.db = db
    
    def create(self, region: Region) -> Region:
        """Create a new region"""
        query = """
            INSERT INTO regions 
            (id, name, description, color, region_type, bounds_json, is_visible)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        self.db.execute(query, (
            region.id,
            region.name,
            region.description,
            region.color,
            region.region_type.value if isinstance(region.region_type, RegionType) else region.region_type,
            region.bounds_json,
            region.is_visible
        ))
        
        # Add items to region if provided
        if region.item_ids:
            self.add_items(region.id, region.item_ids)
        
        return self.get_by_id(region.id)
    
    def get_by_id(self, region_id: str) -> Optional[Region]:
        """Get region by ID with its items"""
        query = "SELECT * FROM regions WHERE id = ?"
        row = self.db.fetchone(query, (region_id,))
        
        if not row:
            return None
        
        # Get items in this region
        item_ids = self._get_items_for_region(region_id)
        
        return Region.from_db_row(dict(row), item_ids)
    
    def get_all(
        self,
        region_type: Optional[RegionType] = None,
        visible_only: bool = False,
        limit: int = 100,
        offset: int = 0,
        project_id: Optional[str] = None
    ) -> List[Region]:
        """Get all regions with optional filtering"""
        query = "SELECT * FROM regions WHERE 1=1"
        params = []
        
        if region_type:
            query += " AND region_type = ?"
            params.append(region_type.value)
        
        if visible_only:
            query += " AND is_visible = 1"
        
        if project_id:
            query += " AND project_id = ?"
            params.append(project_id)
        
        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        rows = self.db.fetchall(query, tuple(params))
        
        regions = []
        for row in rows:
            item_ids = self._get_items_for_region(row['id'])
            regions.append(Region.from_db_row(dict(row), item_ids))
        
        return regions
    
    def update(self, region: Region) -> Region:
        """Update a region"""
        query = """
            UPDATE regions 
            SET name = ?, description = ?, color = ?, region_type = ?,
                bounds_json = ?, is_visible = ?
            WHERE id = ?
        """
        self.db.execute(query, (
            region.name,
            region.description,
            region.color,
            region.region_type.value if isinstance(region.region_type, RegionType) else region.region_type,
            region.bounds_json,
            region.is_visible,
            region.id
        ))
        
        return self.get_by_id(region.id)
    
    def delete(self, region_id: str) -> bool:
        """Delete a region (items are automatically unlinked via CASCADE)"""
        query = "DELETE FROM regions WHERE id = ?"
        cursor = self.db.execute(query, (region_id,))
        return cursor.rowcount > 0
    
    def add_items(self, region_id: str, item_ids: List[str]) -> bool:
        """Add items to a region"""
        query = "INSERT OR IGNORE INTO region_items (region_id, item_id) VALUES (?, ?)"
        for item_id in item_ids:
            self.db.execute(query, (region_id, item_id))
        return True
    
    def remove_item(self, region_id: str, item_id: str) -> bool:
        """Remove an item from a region"""
        query = "DELETE FROM region_items WHERE region_id = ? AND item_id = ?"
        cursor = self.db.execute(query, (region_id, item_id))
        return cursor.rowcount > 0
    
    def clear_items(self, region_id: str) -> bool:
        """Remove all items from a region"""
        query = "DELETE FROM region_items WHERE region_id = ?"
        self.db.execute(query, (region_id,))
        return True
    
    def set_items(self, region_id: str, item_ids: List[str]) -> bool:
        """Replace all items in a region"""
        self.clear_items(region_id)
        return self.add_items(region_id, item_ids)
    
    def get_regions_for_item(self, item_id: str) -> List[Region]:
        """Get all regions that contain a specific item"""
        query = """
            SELECT r.* FROM regions r
            JOIN region_items ri ON r.id = ri.region_id
            WHERE ri.item_id = ?
            ORDER BY r.name
        """
        rows = self.db.fetchall(query, (item_id,))
        
        regions = []
        for row in rows:
            item_ids = self._get_items_for_region(row['id'])
            regions.append(Region.from_db_row(dict(row), item_ids))
        
        return regions
    
    def toggle_visibility(self, region_id: str) -> bool:
        """Toggle region visibility"""
        region = self.get_by_id(region_id)
        if not region:
            return False
        
        query = "UPDATE regions SET is_visible = ? WHERE id = ?"
        self.db.execute(query, (not region.is_visible, region_id))
        return True
    
    def _get_items_for_region(self, region_id: str) -> List[str]:
        """Get all item IDs in a region"""
        query = "SELECT item_id FROM region_items WHERE region_id = ?"
        rows = self.db.fetchall(query, (region_id,))
        return [row['item_id'] for row in rows]
    
    def get_items_with_details(self, region_id: str) -> List[KnowledgeItem]:
        """Get full item details for all items in a region"""
        query = """
            SELECT ki.* FROM knowledge_items ki
            JOIN region_items ri ON ki.id = ri.item_id
            WHERE ri.region_id = ?
            ORDER BY ki.created_at DESC
        """
        rows = self.db.fetchall(query, (region_id,))
        
        items = []
        for row in rows:
            # Get tags for each item
            tags_query = """
                SELECT t.name FROM tags t
                JOIN item_tags it ON t.id = it.tag_id
                WHERE it.item_id = ?
            """
            tag_rows = self.db.fetchall(tags_query, (row['id'],))
            tags = [tr['name'] for tr in tag_rows]
            items.append(KnowledgeItem.from_db_row(dict(row), tags))
        
        return items
    
    def get_profile(self, region_id: str) -> Optional[RegionProfile]:
        """Get the profile assigned to a region"""
        query = """
            SELECT rp.* FROM region_profiles rp
            JOIN regions r ON r.profile_id = rp.id
            WHERE r.id = ?
        """
        row = self.db.fetchone(query, (region_id,))
        if not row:
            return None
        return RegionProfile.from_db_row(dict(row))
    
    def set_profile(self, region_id: str, profile_id: Optional[str]) -> bool:
        """Assign a profile to a region (or remove with None)"""
        query = "UPDATE regions SET profile_id = ? WHERE id = ?"
        cursor = self.db.execute(query, (profile_id, region_id))
        return cursor.rowcount > 0


class RegionProfileRepository:
    """Repository for region profile operations"""
    
    def __init__(self, db: Database):
        self.db = db
    
    def create(self, profile: RegionProfile) -> RegionProfile:
        """Create a new region profile"""
        query = """
            INSERT INTO region_profiles
            (id, name, description, model_provider, model_name, temperature,
             system_prompt, context_strategy, max_context_items, tools_config, 
             recipe_path, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        self.db.execute(query, (
            profile.id,
            profile.name,
            profile.description,
            profile.model_provider,
            profile.model_name,
            profile.temperature,
            profile.system_prompt,
            profile.context_strategy.value if isinstance(profile.context_strategy, ContextStrategy) else profile.context_strategy,
            profile.max_context_items,
            profile.tools_config,
            profile.recipe_path,
            profile.is_default
        ))
        return self.get_by_id(profile.id)
    
    def get_by_id(self, profile_id: str) -> Optional[RegionProfile]:
        """Get region profile by ID"""
        query = "SELECT * FROM region_profiles WHERE id = ?"
        row = self.db.fetchone(query, (profile_id,))
        if not row:
            return None
        return RegionProfile.from_db_row(dict(row))
    
    def get_by_name(self, name: str) -> Optional[RegionProfile]:
        """Get region profile by name"""
        query = "SELECT * FROM region_profiles WHERE name = ?"
        row = self.db.fetchone(query, (name,))
        if not row:
            return None
        return RegionProfile.from_db_row(dict(row))
    
    def get_all(self) -> List[RegionProfile]:
        """Get all region profiles"""
        query = "SELECT * FROM region_profiles ORDER BY name"
        rows = self.db.fetchall(query)
        return [RegionProfile.from_db_row(dict(row)) for row in rows]
    
    def update(self, profile: RegionProfile) -> RegionProfile:
        """Update a region profile"""
        query = """
            UPDATE region_profiles
            SET name = ?, description = ?, model_provider = ?, model_name = ?, 
                temperature = ?, system_prompt = ?, context_strategy = ?, 
                max_context_items = ?, tools_config = ?, recipe_path = ?, is_default = ?
            WHERE id = ?
        """
        self.db.execute(query, (
            profile.name,
            profile.description,
            profile.model_provider,
            profile.model_name,
            profile.temperature,
            profile.system_prompt,
            profile.context_strategy.value if isinstance(profile.context_strategy, ContextStrategy) else profile.context_strategy,
            profile.max_context_items,
            profile.tools_config,
            profile.recipe_path,
            profile.is_default,
            profile.id
        ))
        return self.get_by_id(profile.id)
    
    def delete(self, profile_id: str) -> bool:
        """Delete a region profile"""
        query = "DELETE FROM region_profiles WHERE id = ?"
        cursor = self.db.execute(query, (profile_id,))
        return cursor.rowcount > 0
    
    def get_default(self) -> Optional[RegionProfile]:
        """Get the default profile"""
        query = "SELECT * FROM region_profiles WHERE is_default = 1"
        row = self.db.fetchone(query)
        if row:
            return RegionProfile.from_db_row(dict(row))
        return None
    
    def set_default(self, profile_id: str) -> bool:
        """Set a profile as the default (unsets any existing default)"""
        # First, unset any existing default
        self.db.execute("UPDATE region_profiles SET is_default = 0 WHERE is_default = 1")
        # Set the new default
        query = "UPDATE region_profiles SET is_default = 1 WHERE id = ?"
        cursor = self.db.execute(query, (profile_id,))
        return cursor.rowcount > 0
    
    def create_from_template(self, template_key: str, name: Optional[str] = None) -> Optional[RegionProfile]:
        """Create a new profile from a preset template"""
        if template_key not in PROFILE_TEMPLATES:
            return None
        
        template = PROFILE_TEMPLATES[template_key]
        
        # Create a new profile based on the template
        profile = RegionProfile(
            name=name or template.name,
            description=template.description,
            model_provider=template.model_provider,
            model_name=template.model_name,
            temperature=template.temperature,
            system_prompt=template.system_prompt,
            context_strategy=template.context_strategy,
            max_context_items=template.max_context_items,
            tools_config=template.tools_config,
            recipe_path=template.recipe_path,
        )
        
        return self.create(profile)
    
    def get_regions_using_profile(self, profile_id: str) -> List[Region]:
        """Get all regions that use a specific profile"""
        query = """
            SELECT r.* FROM regions r
            WHERE r.profile_id = ?
            ORDER BY r.name
        """
        rows = self.db.fetchall(query, (profile_id,))
        
        regions = []
        for row in rows:
            # Get item IDs for each region
            items_query = "SELECT item_id FROM region_items WHERE region_id = ?"
            item_rows = self.db.fetchall(items_query, (row['id'],))
            item_ids = [ir['item_id'] for ir in item_rows]
            regions.append(Region.from_db_row(dict(row), item_ids))
        
        return regions


class ProjectRepository:
    """Repository for project (knowledge base) operations"""
    
    def __init__(self, db: Database):
        self.db = db
    
    def create(self, project: Project) -> Project:
        """Create a new project"""
        query = """
            INSERT INTO projects
            (id, name, description, color, icon, is_default, is_archived)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        self.db.execute(query, (
            project.id,
            project.name,
            project.description,
            project.color,
            project.icon,
            project.is_default,
            project.is_archived
        ))
        return self.get_by_id(project.id)
    
    def get_by_id(self, project_id: str) -> Optional[Project]:
        """Get project by ID with counts"""
        query = "SELECT * FROM projects WHERE id = ?"
        row = self.db.fetchone(query, (project_id,))
        
        if not row:
            return None
        
        # Get counts
        item_count = self._get_item_count(project_id)
        region_count = self._get_region_count(project_id)
        profile_count = self._get_profile_count(project_id)
        
        return Project.from_db_row(dict(row), item_count, region_count, profile_count)
    
    def get_all(
        self,
        include_archived: bool = False,
        limit: int = 100,
        offset: int = 0
    ) -> List[Project]:
        """Get all projects with optional filtering"""
        query = "SELECT * FROM projects WHERE 1=1"
        params = []
        
        if not include_archived:
            query += " AND is_archived = 0"
        
        query += " ORDER BY last_accessed_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        rows = self.db.fetchall(query, tuple(params))
        
        projects = []
        for row in rows:
            item_count = self._get_item_count(row['id'])
            region_count = self._get_region_count(row['id'])
            profile_count = self._get_profile_count(row['id'])
            projects.append(Project.from_db_row(dict(row), item_count, region_count, profile_count))
        
        return projects
    
    def update(self, project: Project) -> Project:
        """Update a project"""
        query = """
            UPDATE projects
            SET name = ?, description = ?, color = ?, icon = ?, 
                is_default = ?, is_archived = ?
            WHERE id = ?
        """
        self.db.execute(query, (
            project.name,
            project.description,
            project.color,
            project.icon,
            project.is_default,
            project.is_archived,
            project.id
        ))
        return self.get_by_id(project.id)
    
    def delete(self, project_id: str) -> bool:
        """Delete a project (items, regions, profiles will have project_id set to NULL)"""
        # Don't allow deleting the default project
        project = self.get_by_id(project_id)
        if project and project.is_default:
            return False
        
        query = "DELETE FROM projects WHERE id = ?"
        cursor = self.db.execute(query, (project_id,))
        return cursor.rowcount > 0
    
    def get_default(self) -> Optional[Project]:
        """Get the default project"""
        query = "SELECT * FROM projects WHERE is_default = 1"
        row = self.db.fetchone(query)
        if not row:
            return None
        
        item_count = self._get_item_count(row['id'])
        region_count = self._get_region_count(row['id'])
        profile_count = self._get_profile_count(row['id'])
        return Project.from_db_row(dict(row), item_count, region_count, profile_count)
    
    def set_default(self, project_id: str) -> bool:
        """Set a project as the default (unsets any existing default)"""
        # First, unset any existing default
        self.db.execute("UPDATE projects SET is_default = 0 WHERE is_default = 1")
        # Set the new default
        query = "UPDATE projects SET is_default = 1 WHERE id = ?"
        cursor = self.db.execute(query, (project_id,))
        return cursor.rowcount > 0
    
    def archive(self, project_id: str) -> bool:
        """Archive a project"""
        query = "UPDATE projects SET is_archived = 1 WHERE id = ?"
        cursor = self.db.execute(query, (project_id,))
        return cursor.rowcount > 0
    
    def unarchive(self, project_id: str) -> bool:
        """Unarchive a project"""
        query = "UPDATE projects SET is_archived = 0 WHERE id = ?"
        cursor = self.db.execute(query, (project_id,))
        return cursor.rowcount > 0
    
    def update_last_accessed(self, project_id: str) -> bool:
        """Update the last_accessed_at timestamp"""
        query = "UPDATE projects SET last_accessed_at = CURRENT_TIMESTAMP WHERE id = ?"
        cursor = self.db.execute(query, (project_id,))
        return cursor.rowcount > 0
    
    def _get_item_count(self, project_id: str) -> int:
        """Get count of items in a project"""
        query = "SELECT COUNT(*) as count FROM knowledge_items WHERE project_id = ?"
        row = self.db.fetchone(query, (project_id,))
        return row['count'] if row else 0
    
    def _get_region_count(self, project_id: str) -> int:
        """Get count of regions in a project"""
        query = "SELECT COUNT(*) as count FROM regions WHERE project_id = ?"
        row = self.db.fetchone(query, (project_id,))
        return row['count'] if row else 0
    
    def _get_profile_count(self, project_id: str) -> int:
        """Get count of profiles in a project"""
        query = "SELECT COUNT(*) as count FROM region_profiles WHERE project_id = ?"
        row = self.db.fetchone(query, (project_id,))
        return row['count'] if row else 0
    
    def get_stats(self, project_id: str) -> Dict:
        """Get detailed statistics for a project"""
        project = self.get_by_id(project_id)
        if not project:
            return {}
        
        # Get item counts by type
        items_by_type_query = """
            SELECT item_type, COUNT(*) as count 
            FROM knowledge_items 
            WHERE project_id = ?
            GROUP BY item_type
        """
        type_rows = self.db.fetchall(items_by_type_query, (project_id,))
        items_by_type = {row['item_type']: row['count'] for row in type_rows}
        
        # Get favorite count
        favorites_query = """
            SELECT COUNT(*) as count 
            FROM knowledge_items 
            WHERE project_id = ? AND favorite = 1
        """
        fav_row = self.db.fetchone(favorites_query, (project_id,))
        favorites_count = fav_row['count'] if fav_row else 0
        
        return {
            "project": project.to_dict(),
            "items_by_type": items_by_type,
            "favorites_count": favorites_count,
            "total_items": project.item_count,
            "total_regions": project.region_count,
            "total_profiles": project.profile_count
        }
