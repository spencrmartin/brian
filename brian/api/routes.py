"""
API routes for brian
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime

from ..models import KnowledgeItem, Tag, Connection, ItemType, Region, RegionType, RegionProfile, ContextStrategy, PROFILE_TEMPLATES, Project, DEFAULT_PROJECT_ID
from ..database import Database
from ..database.repository import KnowledgeRepository, TagRepository, ConnectionRepository, RegionRepository, RegionProfileRepository, ProjectRepository
from ..services import SimilarityService
from ..services.clustering import ClusteringService

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
        ConnectionRepository(db),
        RegionRepository(db),
        RegionProfileRepository(db),
        ProjectRepository(db)
    )


# ============================================================================
# Knowledge Items Endpoints
# ============================================================================

@router.post("/items", response_model=dict, status_code=201)
async def create_item(item: dict):
    """Create a new knowledge item"""
    repo, _, _, _, _, project_repo = get_repositories()
    
    try:
        # Parse created_at if provided
        created_at = None
        if item.get("created_at"):
            try:
                created_at = datetime.fromisoformat(item["created_at"].replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                pass  # Use default if parsing fails
        
        # Get project_id - use provided, or default project
        project_id = item.get("project_id")
        if not project_id:
            default_project = project_repo.get_default()
            project_id = default_project.id if default_project else DEFAULT_PROJECT_ID
        
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
            link_site_name=item.get("link_site_name"),
            project_id=project_id
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
    sort_order: str = "DESC",
    project_id: Optional[str] = None
):
    """Get all knowledge items with filtering and pagination"""
    repo, _, _, _, _, _ = get_repositories()
    
    type_filter = ItemType(item_type) if item_type else None
    items = repo.get_all(
        item_type=type_filter,
        favorite_only=favorite_only,
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        sort_order=sort_order,
        project_id=project_id
    )
    
    return [item.to_dict() for item in items]


@router.get("/items/{item_id}", response_model=dict)
async def get_item(item_id: str):
    """Get a specific knowledge item"""
    repo, _, _, _, _, _ = get_repositories()
    
    item = repo.get_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return item.to_dict()


@router.put("/items/{item_id}", response_model=dict)
async def update_item(item_id: str, item_data: dict):
    """Update a knowledge item"""
    repo, _, _, _, _, _ = get_repositories()
    
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
    repo, _, _, _, _, _ = get_repositories()
    
    success = repo.delete(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return None


@router.post("/items/{item_id}/favorite", response_model=dict)
async def toggle_favorite(item_id: str):
    """Toggle favorite status"""
    repo, _, _, _, _, _ = get_repositories()
    
    success = repo.toggle_favorite(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item = repo.get_by_id(item_id)
    return item.to_dict()


@router.post("/items/{item_id}/vote", response_model=dict)
async def vote_item(item_id: str, direction: str = Query(..., pattern="^(up|down)$")):
    """Vote on an item (up or down)"""
    repo, _, _, _, _, _ = get_repositories()
    
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
    repo, _, _, _, _, _ = get_repositories()
    
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
    limit: int = Query(50, le=200),
    project_id: Optional[str] = None
):
    """Full-text search across knowledge items"""
    repo, _, _, _, _, _ = get_repositories()
    
    items = repo.search(q, limit=limit, project_id=project_id)
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
    repo, _, _, _, _, _ = get_repositories()
    
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
    _, tag_repo, _, _, _, _ = get_repositories()
    
    tags = tag_repo.get_all()
    return [tag.to_dict() for tag in tags]


@router.get("/tags/popular", response_model=List[dict])
async def get_popular_tags(limit: int = Query(20, le=100)):
    """Get most used tags"""
    _, tag_repo, _, _, _, _ = get_repositories()
    
    return tag_repo.get_popular(limit=limit)


# ============================================================================
# Knowledge Graph / Connections Endpoints
# ============================================================================

@router.post("/connections", response_model=dict, status_code=201)
async def create_connection(connection_data: dict):
    """Create a connection between two items"""
    _, _, conn_repo, _, _, _ = get_repositories()
    
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
    _, _, conn_repo, _, _, _ = get_repositories()
    
    connections = conn_repo.get_for_item(item_id)
    return [conn.to_dict() for conn in connections]


@router.get("/graph", response_model=dict)
async def get_graph():
    """Get full knowledge graph data for visualization"""
    _, _, conn_repo, _, _, _ = get_repositories()
    
    return conn_repo.get_graph_data()


@router.delete("/connections/{connection_id}", status_code=204)
async def delete_connection(connection_id: int):
    """Delete a connection"""
    _, _, conn_repo, _, _, _ = get_repositories()
    
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
    repo, tag_repo, conn_repo, _, _, _ = get_repositories()
    
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
    max_per_item: int = Query(5, ge=1, le=20, description="Max connections per item"),
    project_id: Optional[str] = Query(None, description="Filter to items in a specific project")
):
    """
    Compute content similarity connections between all items
    Uses TF-IDF and cosine similarity
    Optionally scoped to a specific project
    """
    repo, _, _, _, _, _ = get_repositories()
    
    # Get items (optionally filtered by project)
    items = repo.get_all(limit=1000, project_id=project_id)
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
    repo, _, _, _, _, _ = get_repositories()
    
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
    repo, _, _, _, _, _ = get_repositories()
    
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


# ============================================================================
# Knowledge Regions Endpoints
# ============================================================================

@router.post("/regions", response_model=dict, status_code=201)
async def create_region(region_data: dict):
    """Create a new knowledge region"""
    _, _, _, region_repo, _, project_repo = get_repositories()
    
    try:
        # Get project_id - use provided, or default project
        project_id = region_data.get("project_id")
        if not project_id:
            default_project = project_repo.get_default()
            project_id = default_project.id if default_project else None
        
        region = Region(
            name=region_data["name"],
            description=region_data.get("description"),
            color=region_data.get("color", "#8b5cf6"),
            region_type=RegionType(region_data.get("region_type", "manual")),
            bounds_json=region_data.get("bounds_json"),
            is_visible=region_data.get("is_visible", True),
            item_ids=region_data.get("item_ids", []),
            project_id=project_id
        )
        
        created = region_repo.create(region)
        return created.to_dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/regions", response_model=List[dict])
async def get_regions(
    region_type: Optional[str] = None,
    visible_only: bool = False,
    limit: int = Query(100, le=500),
    offset: int = 0,
    project_id: Optional[str] = None
):
    """Get all regions with optional filtering"""
    _, _, _, region_repo, _, _ = get_repositories()
    
    type_filter = RegionType(region_type) if region_type else None
    regions = region_repo.get_all(
        region_type=type_filter,
        visible_only=visible_only,
        limit=limit,
        offset=offset,
        project_id=project_id
    )
    
    return [region.to_dict() for region in regions]


@router.get("/regions/{region_id}", response_model=dict)
async def get_region(region_id: str):
    """Get a specific region with its items"""
    _, _, _, region_repo, _, _ = get_repositories()
    
    region = region_repo.get_by_id(region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    
    return region.to_dict()


@router.get("/regions/{region_id}/items", response_model=List[dict])
async def get_region_items(region_id: str):
    """Get full details of all items in a region"""
    _, _, _, region_repo, _, _ = get_repositories()
    
    region = region_repo.get_by_id(region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    
    items = region_repo.get_items_with_details(region_id)
    return [item.to_dict() for item in items]


@router.put("/regions/{region_id}", response_model=dict)
async def update_region(region_id: str, region_data: dict):
    """Update a region"""
    _, _, _, region_repo, _, _ = get_repositories()
    
    existing = region_repo.get_by_id(region_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Region not found")
    
    # Update fields
    existing.name = region_data.get("name", existing.name)
    existing.description = region_data.get("description", existing.description)
    existing.color = region_data.get("color", existing.color)
    existing.bounds_json = region_data.get("bounds_json", existing.bounds_json)
    existing.is_visible = region_data.get("is_visible", existing.is_visible)
    
    if "region_type" in region_data:
        existing.region_type = RegionType(region_data["region_type"])
    
    updated = region_repo.update(existing)
    return updated.to_dict()


@router.delete("/regions/{region_id}", status_code=204)
async def delete_region(region_id: str):
    """Delete a region"""
    _, _, _, region_repo, _, _ = get_repositories()
    
    success = region_repo.delete(region_id)
    if not success:
        raise HTTPException(status_code=404, detail="Region not found")
    
    return None


@router.post("/regions/{region_id}/items", response_model=dict)
async def add_items_to_region(region_id: str, items_data: dict):
    """Add items to a region"""
    _, _, _, region_repo, _, _ = get_repositories()
    
    region = region_repo.get_by_id(region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    
    item_ids = items_data.get("item_ids", [])
    if not item_ids:
        raise HTTPException(status_code=400, detail="item_ids is required")
    
    region_repo.add_items(region_id, item_ids)
    
    # Return updated region
    updated = region_repo.get_by_id(region_id)
    return updated.to_dict()


@router.delete("/regions/{region_id}/items/{item_id}", status_code=204)
async def remove_item_from_region(region_id: str, item_id: str):
    """Remove an item from a region"""
    _, _, _, region_repo, _, _ = get_repositories()
    
    region = region_repo.get_by_id(region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    
    success = region_repo.remove_item(region_id, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Item not in region")
    
    return None


@router.post("/regions/{region_id}/visibility", response_model=dict)
async def toggle_region_visibility(region_id: str):
    """Toggle region visibility"""
    _, _, _, region_repo, _, _ = get_repositories()
    
    success = region_repo.toggle_visibility(region_id)
    if not success:
        raise HTTPException(status_code=404, detail="Region not found")
    
    region = region_repo.get_by_id(region_id)
    return region.to_dict()


@router.get("/items/{item_id}/regions", response_model=List[dict])
async def get_item_regions(item_id: str):
    """Get all regions that contain a specific item"""
    repo, _, _, region_repo, _, _ = get_repositories()
    
    # Verify item exists
    item = repo.get_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    regions = region_repo.get_regions_for_item(item_id)
    return [region.to_dict() for region in regions]


# ============================================================================
# Clustering / Auto-Region Endpoints
# ============================================================================

# Color palette for auto-generated regions
CLUSTER_COLORS = [
    '#8b5cf6',  # violet
    '#3b82f6',  # blue
    '#06b6d4',  # cyan
    '#10b981',  # emerald
    '#22c55e',  # green
    '#eab308',  # yellow
    '#f97316',  # orange
    '#ef4444',  # red
    '#ec4899',  # pink
    '#a855f7',  # purple
]


@router.get("/clustering/suggest", response_model=dict)
async def suggest_clusters(
    n_clusters: Optional[int] = Query(None, ge=2, le=20, description="Number of clusters (auto-detect if not specified)"),
    max_clusters: int = Query(8, ge=2, le=15, description="Maximum clusters for auto-detection")
):
    """
    Analyze knowledge items and suggest cluster-based regions.
    Uses TF-IDF vectors and k-means clustering.
    
    Returns cluster suggestions with:
    - Suggested name based on keywords
    - Keywords for each cluster
    - Items that would belong to each cluster
    """
    repo, _, _, _, _, _ = get_repositories()
    
    # Get all items
    items = repo.get_all(limit=1000)
    if len(items) < 2:
        return {
            "clusters": [],
            "message": "Need at least 2 items to cluster"
        }
    
    items_dict = [item.to_dict() for item in items]
    
    # Run clustering
    clustering_service = ClusteringService()
    clusters = clustering_service.cluster_items(
        items_dict,
        n_clusters=n_clusters,
        auto_detect=(n_clusters is None),
        max_clusters=max_clusters
    )
    
    # Format response
    result = {
        "n_clusters": len(clusters),
        "total_items": len(items_dict),
        "clusters": []
    }
    
    for i, cluster in enumerate(clusters):
        result["clusters"].append({
            "suggested_name": cluster["name"],
            "keywords": cluster["keywords"],
            "size": cluster["size"],
            "item_ids": cluster["item_ids"],
            "suggested_color": CLUSTER_COLORS[i % len(CLUSTER_COLORS)],
            "items_preview": [
                {"id": item["id"], "title": item["title"]}
                for item in cluster["items"][:5]  # Preview first 5 items
            ]
        })
    
    return result


@router.post("/clustering/generate-regions", response_model=dict)
async def generate_cluster_regions(
    options: dict
):
    """
    Generate regions from cluster analysis.
    
    Options:
    - n_clusters: Number of clusters (optional, auto-detect if not specified)
    - max_clusters: Maximum clusters for auto-detection (default: 8)
    - prefix: Prefix for region names (optional)
    - replace_existing: Whether to delete existing cluster regions first (default: false)
    
    Returns created regions.
    """
    repo, _, _, region_repo, _, _ = get_repositories()
    
    n_clusters = options.get("n_clusters")
    max_clusters = options.get("max_clusters", 8)
    prefix = options.get("prefix", "")
    replace_existing = options.get("replace_existing", False)
    
    # Get all items
    items = repo.get_all(limit=1000)
    if len(items) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 items to cluster")
    
    items_dict = [item.to_dict() for item in items]
    
    # Optionally delete existing cluster regions
    if replace_existing:
        existing_regions = region_repo.get_all(region_type=RegionType.CLUSTER)
        for region in existing_regions:
            region_repo.delete(region.id)
    
    # Run clustering
    clustering_service = ClusteringService()
    clusters = clustering_service.cluster_items(
        items_dict,
        n_clusters=n_clusters,
        auto_detect=(n_clusters is None),
        max_clusters=max_clusters
    )
    
    # Create regions from clusters
    created_regions = []
    for i, cluster in enumerate(clusters):
        name = f"{prefix}{cluster['name']}" if prefix else cluster["name"]
        
        region = Region(
            name=name,
            description=f"Auto-generated cluster region. Keywords: {', '.join(cluster['keywords'][:5])}",
            color=CLUSTER_COLORS[i % len(CLUSTER_COLORS)],
            region_type=RegionType.CLUSTER,
            is_visible=True,
            item_ids=cluster["item_ids"]
        )
        
        created = region_repo.create(region)
        created_regions.append(created.to_dict())
    
    return {
        "created_count": len(created_regions),
        "regions": created_regions
    }


@router.get("/clustering/optimal-k", response_model=dict)
async def get_optimal_cluster_count(
    max_k: int = Query(10, ge=2, le=20, description="Maximum k to evaluate"),
    method: str = Query("elbow", pattern="^(elbow|silhouette)$", description="Method: 'elbow' or 'silhouette'")
):
    """
    Estimate the optimal number of clusters for the knowledge base.
    
    Methods:
    - elbow: Finds the "elbow" point where adding clusters has diminishing returns
    - silhouette: Maximizes cluster cohesion and separation
    """
    repo, _, _, _, _, _ = get_repositories()
    
    items = repo.get_all(limit=1000)
    if len(items) < 3:
        return {
            "optimal_k": 1,
            "message": "Need at least 3 items for meaningful clustering"
        }
    
    items_dict = [item.to_dict() for item in items]
    
    clustering_service = ClusteringService()
    optimal_k = clustering_service.estimate_optimal_k(
        items_dict,
        max_k=min(max_k, len(items_dict)),
        method=method
    )
    
    return {
        "optimal_k": optimal_k,
        "total_items": len(items_dict),
        "method": method,
        "max_k_evaluated": min(max_k, len(items_dict))
    }


# ============================================================================
# Region Profiles Endpoints
# ============================================================================

@router.post("/profiles", response_model=dict, status_code=201)
async def create_profile(profile_data: dict):
    """Create a new region profile"""
    _, _, _, _, profile_repo, _ = get_repositories()
    
    try:
        # Handle context_strategy enum conversion
        context_strategy = profile_data.get("context_strategy", "dense_retrieval")
        if isinstance(context_strategy, str):
            context_strategy = ContextStrategy(context_strategy)
        
        profile = RegionProfile(
            name=profile_data["name"],
            description=profile_data.get("description"),
            model_provider=profile_data.get("model_provider"),
            model_name=profile_data.get("model_name"),
            temperature=profile_data.get("temperature", 0.7),
            system_prompt=profile_data.get("system_prompt"),
            context_strategy=context_strategy,
            max_context_items=profile_data.get("max_context_items", 20),
            tools_config=profile_data.get("tools_config"),
            recipe_path=profile_data.get("recipe_path"),
            is_default=profile_data.get("is_default", False)
        )
        
        created = profile_repo.create(profile)
        return created.to_dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/profiles", response_model=List[dict])
async def get_profiles():
    """Get all region profiles"""
    _, _, _, _, profile_repo, _ = get_repositories()
    
    profiles = profile_repo.get_all()
    return [profile.to_dict() for profile in profiles]


@router.get("/profiles/templates", response_model=dict)
async def get_profile_templates():
    """Get preset profile templates for quick setup"""
    templates = {}
    for key, profile in PROFILE_TEMPLATES.items():
        templates[key] = profile.to_dict()
    
    return {
        "templates": templates,
        "count": len(templates)
    }


@router.get("/profiles/{profile_id}", response_model=dict)
async def get_profile(profile_id: str):
    """Get a specific region profile"""
    _, _, _, _, profile_repo, _ = get_repositories()
    
    profile = profile_repo.get_by_id(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return profile.to_dict()


@router.put("/profiles/{profile_id}", response_model=dict)
async def update_profile(profile_id: str, profile_data: dict):
    """Update a region profile"""
    _, _, _, _, profile_repo, _ = get_repositories()
    
    existing = profile_repo.get_by_id(profile_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Update fields
    existing.name = profile_data.get("name", existing.name)
    existing.description = profile_data.get("description", existing.description)
    existing.model_provider = profile_data.get("model_provider", existing.model_provider)
    existing.model_name = profile_data.get("model_name", existing.model_name)
    existing.temperature = profile_data.get("temperature", existing.temperature)
    existing.system_prompt = profile_data.get("system_prompt", existing.system_prompt)
    existing.max_context_items = profile_data.get("max_context_items", existing.max_context_items)
    existing.tools_config = profile_data.get("tools_config", existing.tools_config)
    existing.recipe_path = profile_data.get("recipe_path", existing.recipe_path)
    existing.is_default = profile_data.get("is_default", existing.is_default)
    
    if "context_strategy" in profile_data:
        strategy = profile_data["context_strategy"]
        existing.context_strategy = ContextStrategy(strategy) if isinstance(strategy, str) else strategy
    
    updated = profile_repo.update(existing)
    return updated.to_dict()


@router.delete("/profiles/{profile_id}", status_code=204)
async def delete_profile(profile_id: str):
    """Delete a region profile"""
    _, _, _, _, profile_repo, _ = get_repositories()
    
    success = profile_repo.delete(profile_id)
    if not success:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return None


@router.post("/profiles/{profile_id}/default", response_model=dict)
async def set_default_profile(profile_id: str):
    """Set a profile as the default"""
    _, _, _, _, profile_repo, _ = get_repositories()
    
    profile = profile_repo.get_by_id(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    profile_repo.set_default(profile_id)
    
    # Return updated profile
    updated = profile_repo.get_by_id(profile_id)
    return updated.to_dict()


@router.get("/profiles/{profile_id}/regions", response_model=List[dict])
async def get_profile_regions(profile_id: str):
    """Get all regions using a specific profile"""
    _, _, _, _, profile_repo, _ = get_repositories()
    
    profile = profile_repo.get_by_id(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    regions = profile_repo.get_regions_using_profile(profile_id)
    return [region.to_dict() for region in regions]


@router.post("/profiles/from-template", response_model=dict, status_code=201)
async def create_profile_from_template(template_data: dict):
    """Create a new profile from a preset template"""
    _, _, _, _, profile_repo, _ = get_repositories()
    
    template_key = template_data.get("template_key")
    custom_name = template_data.get("name")
    
    if not template_key:
        raise HTTPException(status_code=400, detail="template_key is required")
    
    if template_key not in PROFILE_TEMPLATES:
        raise HTTPException(
            status_code=400, 
            detail=f"Unknown template: {template_key}. Available: {list(PROFILE_TEMPLATES.keys())}"
        )
    
    profile = profile_repo.create_from_template(template_key, custom_name)
    if not profile:
        raise HTTPException(status_code=500, detail="Failed to create profile from template")
    
    return profile.to_dict()


# ============================================================================
# Region-Profile Association Endpoints
# ============================================================================

@router.get("/regions/{region_id}/profile", response_model=dict)
async def get_region_profile(region_id: str):
    """Get the profile assigned to a region"""
    _, _, _, region_repo, _, _ = get_repositories()
    
    region = region_repo.get_by_id(region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    
    profile = region_repo.get_profile(region_id)
    if not profile:
        return {"profile": None, "message": "No profile assigned to this region"}
    
    return {"profile": profile.to_dict()}


@router.put("/regions/{region_id}/profile", response_model=dict)
async def assign_region_profile(region_id: str, profile_data: dict):
    """Assign a profile to a region"""
    _, _, _, region_repo, profile_repo, _ = get_repositories()
    
    region = region_repo.get_by_id(region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    
    profile_id = profile_data.get("profile_id")
    if not profile_id:
        raise HTTPException(status_code=400, detail="profile_id is required")
    
    # Verify profile exists
    profile = profile_repo.get_by_id(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    success = region_repo.set_profile(region_id, profile_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to assign profile")
    
    return {
        "success": True,
        "region_id": region_id,
        "profile": profile.to_dict()
    }


@router.delete("/regions/{region_id}/profile", status_code=204)
async def remove_region_profile(region_id: str):
    """Remove the profile from a region"""
    _, _, _, region_repo, _, _ = get_repositories()
    
    region = region_repo.get_by_id(region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Region not found")
    
    region_repo.set_profile(region_id, None)
    return None



# ============================================================================
# Projects (Knowledge Bases) Endpoints
# ============================================================================

@router.post("/projects", response_model=dict, status_code=201)
async def create_project(project_data: dict):
    """Create a new project (knowledge base)"""
    _, _, _, _, _, project_repo = get_repositories()
    
    try:
        project = Project(
            name=project_data["name"],
            description=project_data.get("description"),
            color=project_data.get("color", "#8b5cf6"),
            icon=project_data.get("icon"),
            is_default=project_data.get("is_default", False),
            is_archived=project_data.get("is_archived", False)
        )
        
        created = project_repo.create(project)
        return created.to_dict()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/projects", response_model=List[dict])
async def get_projects(
    include_archived: bool = False,
    limit: int = Query(100, le=500),
    offset: int = 0
):
    """Get all projects with optional filtering"""
    _, _, _, _, _, project_repo = get_repositories()
    
    projects = project_repo.get_all(
        include_archived=include_archived,
        limit=limit,
        offset=offset
    )
    
    return [project.to_dict() for project in projects]


@router.get("/projects/default", response_model=dict)
async def get_default_project():
    """Get the default project"""
    _, _, _, _, _, project_repo = get_repositories()
    
    project = project_repo.get_default()
    if not project:
        raise HTTPException(status_code=404, detail="No default project found")
    
    return project.to_dict()


@router.get("/projects/{project_id}", response_model=dict)
async def get_project(project_id: str):
    """Get a specific project with counts"""
    _, _, _, _, _, project_repo = get_repositories()
    
    project = project_repo.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return project.to_dict()


@router.get("/projects/{project_id}/stats", response_model=dict)
async def get_project_stats(project_id: str):
    """Get detailed statistics for a project"""
    _, _, _, _, _, project_repo = get_repositories()
    
    stats = project_repo.get_stats(project_id)
    if not stats:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return stats


@router.put("/projects/{project_id}", response_model=dict)
async def update_project(project_id: str, project_data: dict):
    """Update a project"""
    _, _, _, _, _, project_repo = get_repositories()
    
    existing = project_repo.get_by_id(project_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Update fields
    existing.name = project_data.get("name", existing.name)
    existing.description = project_data.get("description", existing.description)
    existing.color = project_data.get("color", existing.color)
    existing.icon = project_data.get("icon", existing.icon)
    existing.is_default = project_data.get("is_default", existing.is_default)
    existing.is_archived = project_data.get("is_archived", existing.is_archived)
    
    updated = project_repo.update(existing)
    return updated.to_dict()


@router.delete("/projects/{project_id}", status_code=204)
async def delete_project(project_id: str):
    """Delete a project (cannot delete default project)"""
    _, _, _, _, _, project_repo = get_repositories()
    
    project = project_repo.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.is_default:
        raise HTTPException(status_code=400, detail="Cannot delete the default project")
    
    success = project_repo.delete(project_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete project")
    
    return None


@router.post("/projects/{project_id}/default", response_model=dict)
async def set_default_project(project_id: str):
    """Set a project as the default"""
    _, _, _, _, _, project_repo = get_repositories()
    
    project = project_repo.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project_repo.set_default(project_id)
    
    # Return updated project
    updated = project_repo.get_by_id(project_id)
    return updated.to_dict()


@router.post("/projects/{project_id}/archive", response_model=dict)
async def archive_project(project_id: str):
    """Archive a project"""
    _, _, _, _, _, project_repo = get_repositories()
    
    project = project_repo.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.is_default:
        raise HTTPException(status_code=400, detail="Cannot archive the default project")
    
    project_repo.archive(project_id)
    
    # Return updated project
    updated = project_repo.get_by_id(project_id)
    return updated.to_dict()


@router.post("/projects/{project_id}/unarchive", response_model=dict)
async def unarchive_project(project_id: str):
    """Unarchive a project"""
    _, _, _, _, _, project_repo = get_repositories()
    
    project = project_repo.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project_repo.unarchive(project_id)
    
    # Return updated project
    updated = project_repo.get_by_id(project_id)
    return updated.to_dict()


@router.post("/projects/{project_id}/access", response_model=dict)
async def update_project_access(project_id: str):
    """Update the last_accessed_at timestamp for a project"""
    _, _, _, _, _, project_repo = get_repositories()
    
    project = project_repo.get_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project_repo.update_last_accessed(project_id)
    
    # Return updated project
    updated = project_repo.get_by_id(project_id)
    return updated.to_dict()


# ── Database Management Endpoints ────────────────────────────────────────────

@router.get("/database/info")
async def get_database_info():
    """Get database info including schema version, path, size, and FTS5 status"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    from pathlib import Path
    db_file = Path(db.db_path)
    size_mb = round(db_file.stat().st_size / (1024 * 1024), 2) if db_file.exists() else 0
    
    return {
        "path": db.db_path,
        "size_mb": size_mb,
        "schema_version": db.get_schema_version(),
        "sqlite_version": db.get_sqlite_version(),
        "fts5_available": db.fts5_available(),
    }


@router.get("/database/backups")
async def list_backups():
    """List all database backups"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    backups = db.list_backups()
    return {"count": len(backups), "backups": backups}


@router.post("/database/backups")
async def create_backup():
    """Create a manual database backup"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    backup_path = db.backup(reason="manual")
    if backup_path is None:
        raise HTTPException(status_code=500, detail="Backup failed")
    
    return {"path": backup_path, "message": "Backup created successfully"}


@router.post("/database/restore")
async def restore_backup(data: dict):
    """Restore database from a backup file. Requires {"path": "..."}"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    backup_path = data.get("path")
    if not backup_path:
        raise HTTPException(status_code=400, detail="Missing 'path' field")
    
    success = db.restore(backup_path)
    if not success:
        raise HTTPException(status_code=500, detail="Restore failed")
    
    return {"message": "Database restored successfully", "schema_version": db.get_schema_version()}
