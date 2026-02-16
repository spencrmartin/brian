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
    SKILL = "skill"  # Anthropic skills from skills repository


class RegionType(str, Enum):
    """Types of knowledge regions"""
    MANUAL = "manual"        # User-created via lasso/selection
    TAG_BASED = "tag-based"  # Auto-generated from tags
    CLUSTER = "cluster"      # ML clustering based
    SMART = "smart"          # AI-suggested regions


class ContextStrategy(str, Enum):
    """Strategies for retrieving context from a region"""
    FULL = "full"                        # Include all items in region
    DENSE_RETRIEVAL = "dense_retrieval"  # TF-IDF similarity to query
    HIERARCHICAL = "hierarchical"        # Parent regions first, then children
    RECENCY_WEIGHTED = "recency_weighted"  # Prefer recent items
    GRAPH_TRAVERSAL = "graph_traversal"  # Follow similarity connections


# Default project ID for migration compatibility
DEFAULT_PROJECT_ID = "00000000-0000-0000-0000-000000000001"


@dataclass
class Project:
    """
    A project represents a separate knowledge base.
    Projects allow users to organize knowledge into distinct, isolated collections.
    """
    
    name: str
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    description: Optional[str] = None
    color: str = "#8b5cf6"  # Default purple
    icon: Optional[str] = None  # Emoji icon
    is_default: bool = False
    is_archived: bool = False
    last_accessed_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # Computed fields (not stored in DB)
    item_count: int = 0
    region_count: int = 0
    profile_count: int = 0
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "color": self.color,
            "icon": self.icon,
            "is_default": self.is_default,
            "is_archived": self.is_archived,
            "last_accessed_at": self.last_accessed_at.isoformat() if self.last_accessed_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "item_count": self.item_count,
            "region_count": self.region_count,
            "profile_count": self.profile_count,
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Project':
        """Create from dictionary"""
        # Convert string dates to datetime
        for date_field in ['created_at', 'updated_at', 'last_accessed_at']:
            if data.get(date_field) and isinstance(data[date_field], str):
                data[date_field] = datetime.fromisoformat(data[date_field])
        
        return cls(**data)
    
    @classmethod
    def from_db_row(cls, row: dict, item_count: int = 0, region_count: int = 0, profile_count: int = 0) -> 'Project':
        """Create from database row"""
        return cls(
            id=row['id'],
            name=row['name'],
            description=row.get('description'),
            color=row.get('color', '#8b5cf6'),
            icon=row.get('icon'),
            is_default=bool(row.get('is_default', False)),
            is_archived=bool(row.get('is_archived', False)),
            last_accessed_at=datetime.fromisoformat(row['last_accessed_at']) if row.get('last_accessed_at') else None,
            created_at=datetime.fromisoformat(row['created_at']) if row.get('created_at') else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row.get('updated_at') else None,
            item_count=item_count,
            region_count=region_count,
            profile_count=profile_count,
        )


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
    # Project association
    project_id: Optional[str] = None
    # Skill-specific metadata (JSON string when stored in DB)
    skill_metadata: Optional[dict] = None  # For SKILL type: {name, description, license, source_url, source_commit, bundled_resources}
    
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
            "project_id": self.project_id,
            "skill_metadata": self.skill_metadata,
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
        import json
        
        # Parse skill_metadata if it's a JSON string
        skill_metadata = row.get('skill_metadata')
        if skill_metadata and isinstance(skill_metadata, str):
            try:
                skill_metadata = json.loads(skill_metadata)
            except json.JSONDecodeError:
                skill_metadata = None
        
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
            project_id=row.get('project_id'),
            skill_metadata=skill_metadata,
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


@dataclass
class Region:
    """A spatial grouping of knowledge items in the graph view"""
    
    name: str
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    description: Optional[str] = None
    color: str = "#8b5cf6"  # Default purple
    region_type: RegionType = RegionType.MANUAL
    bounds_json: Optional[str] = None  # JSON string for polygon/bounds
    is_visible: bool = True
    item_ids: List[str] = field(default_factory=list)  # Items in this region
    profile_id: Optional[str] = None  # Associated region profile
    project_id: Optional[str] = None  # Associated project
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "color": self.color,
            "region_type": self.region_type.value if isinstance(self.region_type, RegionType) else self.region_type,
            "bounds_json": self.bounds_json,
            "is_visible": self.is_visible,
            "item_ids": self.item_ids,
            "item_count": len(self.item_ids),
            "profile_id": self.profile_id,
            "project_id": self.project_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Region':
        """Create from dictionary"""
        # Convert string dates to datetime
        for date_field in ['created_at', 'updated_at']:
            if data.get(date_field) and isinstance(data[date_field], str):
                data[date_field] = datetime.fromisoformat(data[date_field])
        
        # Convert region_type string to enum
        if 'region_type' in data and isinstance(data['region_type'], str):
            data['region_type'] = RegionType(data['region_type'])
        
        # Remove item_count if present (computed field)
        data.pop('item_count', None)
        
        return cls(**data)
    
    @classmethod
    def from_db_row(cls, row: dict, item_ids: List[str] = None) -> 'Region':
        """Create from database row"""
        return cls(
            id=row['id'],
            name=row['name'],
            description=row.get('description'),
            color=row.get('color', '#8b5cf6'),
            region_type=RegionType(row['region_type']) if row.get('region_type') else RegionType.MANUAL,
            bounds_json=row.get('bounds_json'),
            is_visible=bool(row.get('is_visible', True)),
            item_ids=item_ids or [],
            profile_id=row.get('profile_id'),
            project_id=row.get('project_id'),
            created_at=datetime.fromisoformat(row['created_at']) if row.get('created_at') else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row.get('updated_at') else None,
        )


@dataclass
class RegionProfile:
    """
    A reusable configuration profile for AI behavior within a region.
    
    Profiles define how the AI should behave when working with items
    in a region - including model selection, temperature, system prompts,
    context retrieval strategies, and tool configurations.
    """
    
    name: str
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    description: Optional[str] = None
    
    # Model configuration
    model_provider: Optional[str] = None  # e.g., "openai", "anthropic", "google"
    model_name: Optional[str] = None      # e.g., "gpt-4o", "claude-sonnet-4"
    temperature: float = 0.7
    
    # Prompt configuration
    system_prompt: Optional[str] = None   # Custom system prompt for this profile
    
    # Context retrieval configuration
    context_strategy: ContextStrategy = ContextStrategy.DENSE_RETRIEVAL
    max_context_items: int = 20           # Limit items in context window
    
    # Tool configuration (JSON string)
    tools_config: Optional[str] = None    # JSON: {"enabled": [...], "disabled": [...], "settings": {...}}
    
    # Recipe association
    recipe_path: Optional[str] = None     # Path to associated recipe file
    
    # Metadata
    is_default: bool = False
    project_id: Optional[str] = None  # Associated project
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def to_dict(self) -> dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "model_provider": self.model_provider,
            "model_name": self.model_name,
            "temperature": self.temperature,
            "system_prompt": self.system_prompt,
            "context_strategy": self.context_strategy.value if isinstance(self.context_strategy, ContextStrategy) else self.context_strategy,
            "max_context_items": self.max_context_items,
            "tools_config": self.tools_config,
            "recipe_path": self.recipe_path,
            "is_default": self.is_default,
            "project_id": self.project_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'RegionProfile':
        """Create from dictionary"""
        # Convert string dates to datetime
        for date_field in ['created_at', 'updated_at']:
            if data.get(date_field) and isinstance(data[date_field], str):
                data[date_field] = datetime.fromisoformat(data[date_field])
        
        # Convert context_strategy string to enum
        if 'context_strategy' in data and isinstance(data['context_strategy'], str):
            data['context_strategy'] = ContextStrategy(data['context_strategy'])
        
        return cls(**data)
    
    @classmethod
    def from_db_row(cls, row: dict) -> 'RegionProfile':
        """Create from database row"""
        return cls(
            id=row['id'],
            name=row['name'],
            description=row.get('description'),
            model_provider=row.get('model_provider'),
            model_name=row.get('model_name'),
            temperature=row.get('temperature', 0.7),
            system_prompt=row.get('system_prompt'),
            context_strategy=ContextStrategy(row['context_strategy']) if row.get('context_strategy') else ContextStrategy.DENSE_RETRIEVAL,
            max_context_items=row.get('max_context_items', 20),
            tools_config=row.get('tools_config'),
            recipe_path=row.get('recipe_path'),
            is_default=bool(row.get('is_default', False)),
            project_id=row.get('project_id'),
            created_at=datetime.fromisoformat(row['created_at']) if row.get('created_at') else None,
            updated_at=datetime.fromisoformat(row['updated_at']) if row.get('updated_at') else None,
        )


# Preset profile templates for quick setup
PROFILE_TEMPLATES = {
    "code_assistant": RegionProfile(
        name="Code Assistant",
        description="Optimized for code-related tasks with precise, technical responses",
        model_provider="anthropic",
        model_name="claude-sonnet-4-20250514",
        temperature=0.3,
        system_prompt="You are a precise coding assistant. Focus on clean, efficient code with clear explanations. Prefer showing code examples over lengthy descriptions.",
        context_strategy=ContextStrategy.DENSE_RETRIEVAL,
        max_context_items=15,
    ),
    "research_mode": RegionProfile(
        name="Research Mode",
        description="Deep analysis and comprehensive exploration of topics",
        model_provider="anthropic",
        model_name="claude-sonnet-4-20250514",
        temperature=0.7,
        system_prompt="You are a thorough research assistant. Analyze information deeply, consider multiple perspectives, and provide comprehensive insights with citations to source materials when available.",
        context_strategy=ContextStrategy.FULL,
        max_context_items=30,
    ),
    "creative_writing": RegionProfile(
        name="Creative Writing",
        description="For brainstorming, ideation, and creative content",
        model_provider="openai",
        model_name="gpt-4o",
        temperature=0.9,
        system_prompt="You are a creative collaborator. Think outside the box, offer unique perspectives, and help generate innovative ideas. Be imaginative and exploratory.",
        context_strategy=ContextStrategy.RECENCY_WEIGHTED,
        max_context_items=10,
    ),
    "quick_lookup": RegionProfile(
        name="Quick Lookup",
        description="Fast, concise answers for quick reference",
        model_provider="openai",
        model_name="gpt-4o-mini",
        temperature=0.2,
        system_prompt="Provide brief, direct answers. Be concise and to the point. If more detail is needed, offer to elaborate.",
        context_strategy=ContextStrategy.DENSE_RETRIEVAL,
        max_context_items=5,
    ),
    "documentation": RegionProfile(
        name="Documentation",
        description="For creating and understanding documentation",
        model_provider="anthropic",
        model_name="claude-sonnet-4-20250514",
        temperature=0.5,
        system_prompt="You are a technical writer. Create clear, well-structured documentation. Use proper formatting, include examples, and ensure accuracy.",
        context_strategy=ContextStrategy.HIERARCHICAL,
        max_context_items=20,
    ),
}
