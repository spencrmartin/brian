"""
API routes for brian
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime

from ..models import KnowledgeItem, Tag, Connection, ItemType
from ..database import Database
from ..database.repository import KnowledgeRepository, TagRepository, ConnectionRepository
from ..services import SimilarityService

# Create router
router = APIRouter()

# Database instance (will be set by main app)
db: Optional[Database] = None


def get_repositories():
    """Get repository instances"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    return (
        KnowledgeRepository(db),
        TagRepository(db),
        ConnectionRepository(db)
    )


# ============================================================================
# Knowledge Items Endpoints
# ============================================================================

@router.post("/items", response_model=dict, status_code=201)
async def create_item(item: dict):
    """Create a new knowledge item"""
    repo, _, _ = get_repositories()
    
    try:
        # Parse created_at if provided
        created_at = None
        if item.get("created_at"):
            try:
                created_at = datetime.fromisoformat(item["created_at"].replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                pass  # Use default if parsing fails
        
        knowledge_item = KnowledgeItem(
            title=item["title"],
            content=item["content"],
            item_type=ItemType(item["item_type"]),
            url=item.get("url"),
            language=item.get("language"),
            tags=item.get("tags", []),
            created_at=created_at,
            link_title=item.get("link_title"),
            link_description=item.get("link_description"),
            link_image=item.get("link_image"),
            link_site_name=item.get("link_site_name")
        )
        
        created = repo.create(knowledge_item)
        return created.to_dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/items", response_model=List[dict])
async def get_items(
    item_type: Optional[str] = None,
    favorite_only: bool = False,
    limit: int = Query(100, le=500),
    offset: int = 0,
    sort_by: str = "created_at",
    sort_order: str = "DESC"
):
    """Get all knowledge items with filtering and pagination"""
    repo, _, _ = get_repositories()
    
    type_filter = ItemType(item_type) if item_type else None
    items = repo.get_all(
        item_type=type_filter,
        favorite_only=favorite_only,
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    return [item.to_dict() for item in items]


@router.get("/items/{item_id}", response_model=dict)
async def get_item(item_id: str):
    """Get a specific knowledge item"""
    repo, _, _ = get_repositories()
    
    item = repo.get_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return item.to_dict()


@router.put("/items/{item_id}", response_model=dict)
async def update_item(item_id: str, item_data: dict):
    """Update a knowledge item"""
    repo, _, _ = get_repositories()
    
    # Get existing item
    existing = repo.get_by_id(item_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Update fields
    existing.title = item_data.get("title", existing.title)
    existing.content = item_data.get("content", existing.content)
    existing.item_type = ItemType(item_data.get("item_type", existing.item_type.value))
    existing.url = item_data.get("url", existing.url)
    existing.language = item_data.get("language", existing.language)
    existing.tags = item_data.get("tags", existing.tags)
    existing.link_title = item_data.get("link_title", existing.link_title)
    existing.link_description = item_data.get("link_description", existing.link_description)
    existing.link_image = item_data.get("link_image", existing.link_image)
    existing.link_site_name = item_data.get("link_site_name", existing.link_site_name)
    
    updated = repo.update(existing)
    return updated.to_dict()


@router.delete("/items/{item_id}", status_code=204)
async def delete_item(item_id: str):
    """Delete a knowledge item"""
    repo, _, _ = get_repositories()
    
    success = repo.delete(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return None


@router.post("/items/{item_id}/favorite", response_model=dict)
async def toggle_favorite(item_id: str):
    """Toggle favorite status"""
    repo, _, _ = get_repositories()
    
    success = repo.toggle_favorite(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item = repo.get_by_id(item_id)
    return item.to_dict()


@router.post("/items/{item_id}/vote", response_model=dict)
async def vote_item(item_id: str, direction: str = Query(..., pattern="^(up|down)$")):
    """Vote on an item (up or down)"""
    repo, _, _ = get_repositories()
    
    if direction == "up":
        vote_count = repo.increment_vote(item_id)
    else:
        vote_count = repo.decrement_vote(item_id)
    
    item = repo.get_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return item.to_dict()


@router.patch("/items/{item_id}/position", response_model=dict)
async def update_position(item_id: str, position_data: dict):
    """Update pinboard position for an item"""
    repo, _, _ = get_repositories()
    
    # Get existing item
    existing = repo.get_by_id(item_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Update position
    existing.pinboard_x = position_data.get("x")
    existing.pinboard_y = position_data.get("y")
    
    updated = repo.update(existing)
    return updated.to_dict()


# ============================================================================
# Search Endpoints
# ============================================================================

@router.get("/search", response_model=List[dict])
async def search_items(
    q: str = Query(..., min_length=1),
    limit: int = Query(50, le=200)
):
    """Full-text search across knowledge items"""
    repo, _, _ = get_repositories()
    
    items = repo.search(q, limit=limit)
    return [item.to_dict() for item in items]


# ============================================================================
# Time Machine Endpoints
# ============================================================================

@router.get("/timeline", response_model=List[dict])
async def get_timeline(
    start_date: str = Query(..., description="ISO format date"),
    end_date: str = Query(..., description="ISO format date")
):
    """Get items within a date range for Time Machine view"""
    repo, _, _ = get_repositories()
    
    try:
        start = datetime.fromisoformat(start_date)
        end = datetime.fromisoformat(end_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format.")
    
    items = repo.get_by_date_range(start, end)
    return [item.to_dict() for item in items]


# ============================================================================
# Tags Endpoints
# ============================================================================

@router.get("/tags", response_model=List[dict])
async def get_tags():
    """Get all tags"""
    _, tag_repo, _ = get_repositories()
    
    tags = tag_repo.get_all()
    return [tag.to_dict() for tag in tags]


@router.get("/tags/popular", response_model=List[dict])
async def get_popular_tags(limit: int = Query(20, le=100)):
    """Get most used tags"""
    _, tag_repo, _ = get_repositories()
    
    return tag_repo.get_popular(limit=limit)


# ============================================================================
# Knowledge Graph / Connections Endpoints
# ============================================================================

@router.post("/connections", response_model=dict, status_code=201)
async def create_connection(connection_data: dict):
    """Create a connection between two items"""
    _, _, conn_repo = get_repositories()
    
    try:
        connection = Connection(
            source_item_id=connection_data["source_item_id"],
            target_item_id=connection_data["target_item_id"],
            connection_type=connection_data.get("connection_type", "related"),
            strength=connection_data.get("strength", 1.0),
            notes=connection_data.get("notes")
        )
        
        created = conn_repo.create(connection)
        return created.to_dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/connections/{item_id}", response_model=List[dict])
async def get_item_connections(item_id: str):
    """Get all connections for an item"""
    _, _, conn_repo = get_repositories()
    
    connections = conn_repo.get_for_item(item_id)
    return [conn.to_dict() for conn in connections]


@router.get("/graph", response_model=dict)
async def get_graph():
    """Get full knowledge graph data for visualization"""
    _, _, conn_repo = get_repositories()
    
    return conn_repo.get_graph_data()


@router.delete("/connections/{connection_id}", status_code=204)
async def delete_connection(connection_id: int):
    """Delete a connection"""
    _, _, conn_repo = get_repositories()
    
    success = conn_repo.delete(connection_id)
    if not success:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    return None


# ============================================================================
# Stats / Info Endpoints
# ============================================================================

@router.get("/stats", response_model=dict)
async def get_stats():
    """Get statistics about the knowledge base"""
    repo, tag_repo, conn_repo = get_repositories()
    
    # Count items by type
    stats = {
        "total_items": 0,
        "by_type": {},
        "total_tags": len(tag_repo.get_all()),
        "total_connections": len(conn_repo.get_graph_data()["connections"]),
        "favorites": 0
    }
    
    for item_type in ItemType:
        items = repo.get_all(item_type=item_type, limit=10000)
        count = len(items)
        stats["by_type"][item_type.value] = count
        stats["total_items"] += count
    
    # Count favorites
    favorites = repo.get_all(favorite_only=True, limit=10000)
    stats["favorites"] = len(favorites)
    
    return stats


# ============================================================================
# Similarity / AI Endpoints
# ============================================================================

@router.get("/similarity/connections", response_model=List[dict])
async def get_similarity_connections(
    threshold: float = Query(0.15, ge=0.0, le=1.0, description="Minimum similarity score"),
    max_per_item: int = Query(5, ge=1, le=20, description="Max connections per item")
):
    """
    Compute content similarity connections between all items
    Uses TF-IDF and cosine similarity
    """
    repo, _, _ = get_repositories()
    
    # Get all items
    items = repo.get_all(limit=1000)
    items_dict = [item.to_dict() for item in items]
    
    # Compute similarities
    similarity_service = SimilarityService()
    connections = similarity_service.find_similar_items(
        items_dict,
        threshold=threshold,
        max_connections_per_item=max_per_item
    )
    
    return connections


@router.get("/similarity/related/{item_id}", response_model=List[dict])
async def get_related_items(
    item_id: str,
    top_k: int = Query(5, ge=1, le=20),
    threshold: float = Query(0.1, ge=0.0, le=1.0)
):
    """Get the most similar items to a specific item"""
    repo, _, _ = get_repositories()
    
    # Get target item
    target_item = repo.get_by_id(item_id)
    if not target_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # Get all items
    all_items = repo.get_all(limit=1000)
    all_items_dict = [item.to_dict() for item in all_items]
    target_dict = target_item.to_dict()
    
    # Find similar items
    similarity_service = SimilarityService()
    related = similarity_service.get_related_items(
        target_dict,
        all_items_dict,
        top_k=top_k,
        threshold=threshold
    )
    
    # Format response
    return [
        {
            "item": item,
            "similarity": score
        }
        for item, score in related
    ]


@router.get("/similarity/score", response_model=dict)
async def compute_similarity_score(
    item1_id: str = Query(..., description="First item ID"),
    item2_id: str = Query(..., description="Second item ID")
):
    """Compute similarity score between two specific items"""
    repo, _, _ = get_repositories()
    
    # Get both items
    item1 = repo.get_by_id(item1_id)
    item2 = repo.get_by_id(item2_id)
    
    if not item1:
        raise HTTPException(status_code=404, detail=f"Item {item1_id} not found")
    if not item2:
        raise HTTPException(status_code=404, detail=f"Item {item2_id} not found")
    
    # Compute similarity
    similarity_service = SimilarityService()
    score = similarity_service.get_similarity_score(
        item1.to_dict(),
        item2.to_dict()
    )
    
    return {
        "item1_id": item1_id,
        "item2_id": item2_id,
        "similarity": round(score, 3)
    }



