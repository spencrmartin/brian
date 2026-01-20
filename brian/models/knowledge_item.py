"""
Knowledge Item model - represents any piece of knowledge in brian
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List
from enum import Enum
import uuid


class ItemType(str, Enum):
    """Types of knowledge items"""
    LINK = "link"
    NOTE = "note"
    SNIPPET = "snippet"
    PAPER = "paper"


@dataclass
class KnowledgeItem:
    """A single knowledge item in brian"""
    
    title: str
    content: str
    item_type: ItemType
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    url: Optional[str] = None
    language: Optional[str] = None  # For code snippets
    favorite: bool = False
    vote_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    accessed_at: Optional[datetime] = None
    tags: List[str] = field(default_factory=list)
    # Link preview metadata
    link_title: Optional[str] = None
    link_description: Optional[str] = None
    link_image: Optional[str] = None
    link_site_name: Optional[str] = None
    # Pinboard position
    pinboard_x: Optional[float] = None
    pinboard_y: Optional[float] = None
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "item_type": self.item_type.value if isinstance(self.item_type, ItemType) else self.item_type,
            "url": self.url,
            "language": self.language,
            "favorite": self.favorite,
            "vote_count": self.vote_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "accessed_at": self.accessed_at.isoformat() if self.accessed_at else None,
            "tags": self.tags,
            "link_title": self.link_title,
            "link_description": self.link_description,
            "link_image": self.link_image,
            "link_site_name": self.link_site_name,
            "pinboard_x": self.pinboard_x,
            "pinboard_y": self.pinboard_y,
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'KnowledgeItem':
        """Create from dictionary"""
        # Convert string dates to datetime
        for date_field in ['created_at', 'updated_at', 'accessed_at']:
            if data.get(date_field) and isinstance(data[date_field], str):
                data[date_field] = datetime.fromisoformat(data[date_field])
        
        # Convert item_type string to enum
        if 'item_type' in data and isinstance(data['item_type'], str):
            data['item_type'] = ItemType(data['item_type'])
        
        return cls(**data)
    
    @classmethod
    def from_db_row(cls, row: dict, tags: List[str] = None) -> 'KnowledgeItem':
        """Create from database row"""
        return cls(
            id=row['id'],
            title=row['title'],
            content=row['content'],
            item_type=ItemType(row['item_type']),
            url=row.get('url'),
            language=row.get('language'),
            favorite=bool(row['favorite']),
            vote_count=row['vote_count'],
            created_at=datetime.fromisoformat(row['created_at']) if row.get('created_at') else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row.get('updated_at') else None,
            accessed_at=datetime.fromisoformat(row['accessed_at']) if row.get('accessed_at') else None,
            tags=tags or [],
            link_title=row.get('link_title'),
            link_description=row.get('link_description'),
            link_image=row.get('link_image'),
            link_site_name=row.get('link_site_name'),
            pinboard_x=row.get('pinboard_x'),
            pinboard_y=row.get('pinboard_y'),
        )


@dataclass
class Tag:
    """A tag for organizing knowledge"""
    
    name: str
    id: Optional[int] = None
    color: Optional[str] = None
    created_at: Optional[datetime] = None
    
    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "color": self.color,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
    
    @classmethod
    def from_db_row(cls, row: dict) -> 'Tag':
        """Create from database row"""
        return cls(
            id=row['id'],
            name=row['name'],
            color=row.get('color'),
            created_at=datetime.fromisoformat(row['created_at']) if row.get('created_at') else None,
        )


@dataclass
class Connection:
    """A connection between two knowledge items"""
    
    source_item_id: str
    target_item_id: str
    connection_type: str = "related"
    strength: float = 1.0
    notes: Optional[str] = None
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    
    def to_dict(self) -> dict:
        """Convert to dictionary"""
        return {
            "id": self.id,
            "source_item_id": self.source_item_id,
            "target_item_id": self.target_item_id,
            "connection_type": self.connection_type,
            "strength": self.strength,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
    
    @classmethod
    def from_db_row(cls, row: dict) -> 'Connection':
        """Create from database row"""
        return cls(
            id=row['id'],
            source_item_id=row['source_item_id'],
            target_item_id=row['target_item_id'],
            connection_type=row['connection_type'],
            strength=row['strength'],
            notes=row.get('notes'),
            created_at=datetime.fromisoformat(row['created_at']) if row.get('created_at') else None,
        )
