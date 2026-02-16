#!/usr/bin/env python3
"""
Brian MCP Server

Exposes Brian's knowledge management capabilities through the Model Context Protocol.
Allows AI assistants to search, create, and connect knowledge items.
"""

import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Any, Optional

# Add parent directory to path to import brian modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from brian.database.connection import Database
from brian.database.repository import KnowledgeRepository, RegionRepository, RegionProfileRepository, ProjectRepository
from brian.services.similarity import SimilarityService
from brian.services.link_preview import fetch_link_metadata, is_google_doc
from brian.models.knowledge_item import KnowledgeItem, ItemType, Region, RegionType, RegionProfile, ContextStrategy, PROFILE_TEMPLATES, Project, DEFAULT_PROJECT_ID
from brian.skills import list_available_skills, fetch_skill, skill_to_knowledge_item, SkillImportError

from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.server.stdio import stdio_server
from mcp.types import (
    Resource,
    Tool,
    TextContent,
    ImageContent,
    EmbeddedResource,
    LoggingLevel,
    ReadResourceRequest,
    ReadResourceResult,
    TextResourceContents,
    ServerResult,
)

# Initialize server
server = Server("brian-knowledge")

# Global repository instances
repo: Optional[KnowledgeRepository] = None
region_repo: Optional[RegionRepository] = None
profile_repo: Optional[RegionProfileRepository] = None
project_repo: Optional[ProjectRepository] = None
similarity_service: Optional[SimilarityService] = None


def init_services():
    """Initialize database connection and services"""
    global repo, region_repo, profile_repo, project_repo, similarity_service
    db_path = os.path.expanduser("~/.brian/brian.db")
    db = Database(db_path)
    # Don't call initialize() - it breaks FTS queries in autocommit mode
    # The database should already be initialized by the web app
    repo = KnowledgeRepository(db)
    region_repo = RegionRepository(db)
    profile_repo = RegionProfileRepository(db)
    project_repo = ProjectRepository(db)
    similarity_service = SimilarityService()


# Load HTML template for item view
TEMPLATES_DIR = Path(__file__).parent / "mcp-app-views"
ITEM_VIEW_TEMPLATE = (TEMPLATES_DIR / "item_view.html").read_text()


def generate_item_view_html() -> str:
    """Return the HTML template for item view (MCP App)
    
    Data is populated client-side via tool result notifications.
    """
    return ITEM_VIEW_TEMPLATE


# MCP App URI constant
MCP_APP_ITEM_URI = "ui://brian/item"
MCP_APPS_MIME_TYPE = "text/html;profile=mcp-app"


@server.list_resources()
async def handle_list_resources() -> list[Resource]:
    """List available resources"""
    return [
        Resource(
            uri="brian://stats",
            name="Knowledge Base Statistics",
            description="Overall statistics about the knowledge base",
            mimeType="application/json",
        ),
        Resource(
            uri="brian://graph",
            name="Connection Graph",
            description="Full graph of connections between knowledge items",
            mimeType="application/json",
        ),
        Resource(
            uri="brian://recent",
            name="Recent Items",
            description="Recently created knowledge items",
            mimeType="application/json",
        ),
        Resource(
            uri=MCP_APP_ITEM_URI,
            name="Item Details",
            description="View details of a knowledge item",
            mimeType=MCP_APPS_MIME_TYPE,
        ),
    ]


# Register read_resource handler directly to support _meta for MCP Apps
async def handle_read_resource(req: ReadResourceRequest) -> ServerResult:
    """Read a specific resource - registered directly to support _meta"""
    # Convert uri to string for comparison (it may be AnyUrl type)
    uri_str = str(req.params.uri)
    
    if uri_str == "brian://stats":
        items = repo.get_all()
        stats = {
            "total_items": len(items),
            "by_type": {},
            "total_tags": len(set(tag for item in items if item.tags for tag in item.tags)),
            "favorites": len([i for i in items if i.favorite]),
        }
        
        for item in items:
            item_type = item.item_type or "unknown"
            stats["by_type"][item_type] = stats["by_type"].get(item_type, 0) + 1
        
        return ServerResult(ReadResourceResult(
            contents=[TextResourceContents(
                uri=uri_str,
                mimeType="application/json",
                text=json.dumps(stats, indent=2)
            )]
        ))
    
    elif uri_str == "brian://graph":
        # Get all connections
        items = repo.get_all()
        connections = []
        
        # Get similarity connections
        if similarity_service:
            sim_connections = similarity_service.find_similar_items(threshold=0.15)
            for conn in sim_connections:
                connections.append({
                    "from_id": conn["item1_id"],
                    "to_id": conn["item2_id"],
                    "type": "similarity",
                    "strength": conn["similarity"]
                })
        
        # Get manual connections (would need to implement in repo)
        graph = {
            "nodes": [{"id": item.id, "title": item.title, "type": item.item_type} for item in items],
            "edges": connections
        }
        
        return ServerResult(ReadResourceResult(
            contents=[TextResourceContents(
                uri=uri_str,
                mimeType="application/json",
                text=json.dumps(graph, indent=2)
            )]
        ))
    
    elif uri_str == "brian://recent":
        items = repo.get_all()
        # Sort by created_at, most recent first
        items.sort(key=lambda x: x.created_at, reverse=True)
        recent = items[:10]
        
        result = [{
            "id": item.id,
            "title": item.title,
            "type": str(item.item_type.value) if hasattr(item.item_type, 'value') else str(item.item_type),
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "tags": item.tags,
        } for item in recent]
        
        return ServerResult(ReadResourceResult(
            contents=[TextResourceContents(
                uri=uri_str,
                mimeType="application/json",
                text=json.dumps(result, indent=2)
            )]
        ))
    
    elif uri_str == MCP_APP_ITEM_URI:
        # Return the HTML template for item details with MCP App metadata
        html_content = generate_item_view_html()
        
        return ServerResult(ReadResourceResult(
            contents=[TextResourceContents(
                uri=uri_str,
                mimeType=MCP_APPS_MIME_TYPE,
                text=html_content,
                _meta={
                    "ui": {
                        "prefersBorder": True,
                        "csp": {
                            "connectDomains": [],
                            "resourceDomains": [],
                        },
                    }
                }
            )]
        ))
    
    else:
        raise ValueError(f"Unknown resource: {uri_str}")

# Register the handler directly
server.request_handlers[ReadResourceRequest] = handle_read_resource


@server.list_tools()
async def handle_list_tools() -> list[Tool]:
    """List available tools"""
    return [
        Tool(
            name="search_knowledge",
            description="Search the knowledge base for items matching a query. Supports full-text search across titles and content. Can be scoped to a specific project.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query to find relevant knowledge items"
                    },
                    "item_type": {
                        "type": "string",
                        "enum": ["note", "link", "code", "paper"],
                        "description": "Optional filter by item type"
                    },
                    "project_id": {
                        "type": "string",
                        "description": "Optional project ID to scope search (uses all projects if not specified)"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of results to return (default: 10)",
                        "default": 10
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="create_knowledge_item",
            description="""Create a new knowledge item in the database. Can be a note, link, code snippet, or paper.

IMPORTANT: For Google Docs URLs:
- FIRST use the Google Drive MCP 'read' tool to automatically fetch the document content
- Then use type 'paper' or 'note' (NOT 'link') 
- Put the fetched document content in the 'content' field
- Include the URL in the 'url' field
- This ensures the document is searchable and can be related to other items

For other documents (Notion, PDFs, etc):
- Use type 'paper' or 'note' (NOT 'link')
- Extract or summarize the document content into the 'content' field
- Include the URL in the 'url' field

For simple web links without document content:
- Use type 'link'
- Content can be a brief description or the URL""",
            inputSchema={
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Title of the knowledge item"
                    },
                    "content": {
                        "type": "string",
                        "description": "Main content/body. For documents (Google Docs, papers), include the actual text content or a detailed summary. For links, include a description."
                    },
                    "item_type": {
                        "type": "string",
                        "enum": ["note", "link", "code", "paper"],
                        "description": "Type: 'paper' for documents/articles, 'note' for personal notes, 'link' for simple web links, 'code' for code snippets"
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Optional tags for categorization"
                    },
                    "url": {
                        "type": "string",
                        "description": "Optional URL - the source link for papers/documents"
                    },
                    "language": {
                        "type": "string",
                        "description": "Programming language (for code type)"
                    },
                    "project_id": {
                        "type": "string",
                        "description": "Optional project ID to add item to (uses default project if not specified)"
                    }
                },
                "required": ["title", "content", "item_type"]
            },
            _meta={
                "ui": {
                    "resourceUri": MCP_APP_ITEM_URI
                }
            }
        ),
        Tool(
            name="find_similar_items",
            description="Find knowledge items similar to a given item using cosine similarity on content.",
            inputSchema={
                "type": "object",
                "properties": {
                    "item_id": {
                        "type": "string",
                        "description": "ID of the item to find similar items for"
                    },
                    "threshold": {
                        "type": "number",
                        "description": "Similarity threshold (0.0-1.0, default: 0.15)",
                        "default": 0.15
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of similar items to return",
                        "default": 5
                    }
                },
                "required": ["item_id"]
            }
        ),
        Tool(
            name="get_item_details",
            description="Get full details of a specific knowledge item by ID.",
            inputSchema={
                "type": "object",
                "properties": {
                    "item_id": {
                        "type": "string",
                        "description": "ID of the item to retrieve"
                    }
                },
                "required": ["item_id"]
            },
            _meta={
                "ui": {
                    "resourceUri": MCP_APP_ITEM_URI
                }
            }
        ),
        Tool(
            name="get_knowledge_context",
            description="Get relevant knowledge items for a topic. Combines search with similarity to find the most relevant context.",
            inputSchema={
                "type": "object",
                "properties": {
                    "topic": {
                        "type": "string",
                        "description": "Topic or concept to get context for"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of items to return",
                        "default": 5
                    }
                },
                "required": ["topic"]
            }
        ),
        Tool(
            name="update_knowledge_item",
            description="Update an existing knowledge item's content, tags, or other properties.",
            inputSchema={
                "type": "object",
                "properties": {
                    "item_id": {
                        "type": "string",
                        "description": "ID of the item to update"
                    },
                    "title": {
                        "type": "string",
                        "description": "New title (optional)"
                    },
                    "content": {
                        "type": "string",
                        "description": "New content (optional)"
                    },
                    "tags": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "New tags (optional)"
                    },
                    "url": {
                        "type": "string",
                        "description": "New URL (optional)"
                    }
                },
                "required": ["item_id"]
            }
        ),
        Tool(
            name="list_all_tags",
            description="Get a list of all unique tags used in the knowledge base.",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        Tool(
            name="debug_item_connections",
            description="Debug why an item might not be showing connections in the graph. Shows similarity scores to all other items and identifies potential issues.",
            inputSchema={
                "type": "object",
                "properties": {
                    "item_id": {
                        "type": "string",
                        "description": "ID of the item to debug"
                    },
                    "show_all": {
                        "type": "boolean",
                        "description": "Show all similarity scores, even very low ones (default: false)",
                        "default": False
                    }
                },
                "required": ["item_id"]
            }
        ),
        # Region tools
        Tool(
            name="list_regions",
            description="List all knowledge regions. Regions are named groupings of related knowledge items that can be used to scope queries and provide organizational context.",
            inputSchema={
                "type": "object",
                "properties": {
                    "include_hidden": {
                        "type": "boolean",
                        "description": "Include hidden regions (default: false)",
                        "default": False
                    }
                }
            }
        ),
        Tool(
            name="get_region",
            description="Get details of a specific region including its items.",
            inputSchema={
                "type": "object",
                "properties": {
                    "region_id": {
                        "type": "string",
                        "description": "ID of the region to retrieve"
                    }
                },
                "required": ["region_id"]
            }
        ),
        Tool(
            name="get_region_context",
            description="Get knowledge context from a specific region. Returns all items in the region with their full content, useful for scoped queries.",
            inputSchema={
                "type": "object",
                "properties": {
                    "region_id": {
                        "type": "string",
                        "description": "ID of the region to get context from"
                    },
                    "query": {
                        "type": "string",
                        "description": "Optional query to filter/rank items within the region"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of items to return (default: all)",
                        "default": 50
                    }
                },
                "required": ["region_id"]
            }
        ),
        Tool(
            name="suggest_regions",
            description="Suggest which regions are most relevant for a given query or topic. Helps route questions to the right knowledge context.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Query or topic to find relevant regions for"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of regions to suggest (default: 3)",
                        "default": 3
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="create_region",
            description="Create a new knowledge region to group related items.",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Name of the region"
                    },
                    "description": {
                        "type": "string",
                        "description": "Description of what this region contains"
                    },
                    "color": {
                        "type": "string",
                        "description": "Hex color code for the region (e.g., '#8b5cf6')"
                    },
                    "item_ids": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "IDs of items to include in the region"
                    }
                },
                "required": ["name"]
            }
        ),
        Tool(
            name="add_items_to_region",
            description="Add items to an existing region.",
            inputSchema={
                "type": "object",
                "properties": {
                    "region_id": {
                        "type": "string",
                        "description": "ID of the region"
                    },
                    "item_ids": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "IDs of items to add"
                    }
                },
                "required": ["region_id", "item_ids"]
            }
        ),
        # Profile tools
        Tool(
            name="list_profiles",
            description="List all region profiles. Profiles define AI behavior settings (model, temperature, system prompt, context strategy) that can be assigned to regions.",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        Tool(
            name="get_profile_templates",
            description="Get preset profile templates for quick setup. Templates include: code_assistant, research_mode, creative_writing, quick_lookup, documentation.",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        Tool(
            name="get_region_profile",
            description="Get the AI profile assigned to a region. Returns profile settings including model, temperature, system prompt, and context strategy.",
            inputSchema={
                "type": "object",
                "properties": {
                    "region_id": {
                        "type": "string",
                        "description": "ID of the region"
                    }
                },
                "required": ["region_id"]
            }
        ),
        Tool(
            name="get_context_with_profile",
            description="Get region context with profile settings applied. Returns items from the region along with recommended AI settings for processing.",
            inputSchema={
                "type": "object",
                "properties": {
                    "region_id": {
                        "type": "string",
                        "description": "ID of the region"
                    },
                    "query": {
                        "type": "string",
                        "description": "Optional query to filter/rank items"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum items to return (default: uses profile's max_context_items)",
                        "default": None
                    }
                },
                "required": ["region_id"]
            }
        ),
        Tool(
            name="suggest_profile",
            description="Suggest the most appropriate profile for a query or content type. Analyzes the query to recommend profiles optimized for that type of task.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Query or description of the task"
                    },
                    "content_type": {
                        "type": "string",
                        "enum": ["code", "research", "creative", "documentation", "general"],
                        "description": "Optional hint about content type"
                    }
                },
                "required": ["query"]
            }
        ),
        # Project (Knowledge Base) tools
        Tool(
            name="list_projects",
            description="List all knowledge base projects. Projects are isolated knowledge bases that can contain their own items, regions, and profiles.",
            inputSchema={
                "type": "object",
                "properties": {
                    "include_archived": {
                        "type": "boolean",
                        "description": "Include archived projects (default: false)",
                        "default": False
                    }
                }
            }
        ),
        Tool(
            name="get_project",
            description="Get details of a specific project including statistics.",
            inputSchema={
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "ID of the project to retrieve"
                    }
                },
                "required": ["project_id"]
            }
        ),
        Tool(
            name="get_current_project",
            description="Get the current default project. This is the project that new items will be added to by default.",
            inputSchema={
                "type": "object",
                "properties": {}
            }
        ),
        Tool(
            name="create_project",
            description="Create a new knowledge base project.",
            inputSchema={
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Name of the project"
                    },
                    "description": {
                        "type": "string",
                        "description": "Description of the project"
                    },
                    "color": {
                        "type": "string",
                        "description": "Hex color code for the project (e.g., '#3b82f6')"
                    },
                    "icon": {
                        "type": "string",
                        "description": "Emoji icon for the project (e.g., '🪿')"
                    }
                },
                "required": ["name"]
            }
        ),
        Tool(
            name="switch_project",
            description="Switch the default project. New items will be added to this project by default.",
            inputSchema={
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "ID of the project to switch to"
                    }
                },
                "required": ["project_id"]
            }
        ),
        Tool(
            name="get_project_context",
            description="Get knowledge context from a specific project. Returns items, regions, and statistics for the project.",
            inputSchema={
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "ID of the project (uses default project if not specified)"
                    },
                    "query": {
                        "type": "string",
                        "description": "Optional query to filter/rank items within the project"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of items to return (default: 20)",
                        "default": 20
                    }
                }
            }
        ),
        # Skills tools - Anthropic skills repository integration
        Tool(
            name="list_skills",
            description="List all available skills from Anthropic's skills repository. Skills are specialized prompts and workflows that extend AI capabilities.",
            inputSchema={
                "type": "object",
                "properties": {
                    "github_token": {
                        "type": "string",
                        "description": "Optional GitHub token for higher rate limits (5000/hour vs 60/hour)"
                    }
                }
            }
        ),
        Tool(
            name="get_skill",
            description="Get detailed information about a specific skill from Anthropic's repository, including metadata, content, and bundled resources.",
            inputSchema={
                "type": "object",
                "properties": {
                    "skill_name": {
                        "type": "string",
                        "description": "Name of the skill (e.g., 'skill-creator', 'mcp-builder', 'algorithmic-art')"
                    },
                    "github_token": {
                        "type": "string",
                        "description": "Optional GitHub token for higher rate limits"
                    }
                },
                "required": ["skill_name"]
            }
        ),
        Tool(
            name="search_skills",
            description="Search for skills by name or description. Returns skills matching the query from both Anthropic's repository and imported skills in Brian.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query (e.g., 'document', 'MCP', 'design')"
                    },
                    "source": {
                        "type": "string",
                        "enum": ["all", "anthropic", "imported"],
                        "description": "Search source: 'all' (both), 'anthropic' (repository only), 'imported' (Brian only)",
                        "default": "all"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of results",
                        "default": 10
                    }
                },
                "required": ["query"]
            }
        ),
        Tool(
            name="import_skill",
            description="Import a skill from Anthropic's repository into Brian's knowledge base. Makes the skill searchable and accessible in your knowledge graph.",
            inputSchema={
                "type": "object",
                "properties": {
                    "skill_name": {
                        "type": "string",
                        "description": "Name of the skill to import"
                    },
                    "project_id": {
                        "type": "string",
                        "description": "Optional project ID to import into (uses default if not specified)"
                    },
                    "github_token": {
                        "type": "string",
                        "description": "Optional GitHub token for higher rate limits"
                    }
                },
                "required": ["skill_name"]
            }
        ),
        Tool(
            name="get_imported_skills",
            description="List all skills that have been imported into Brian's knowledge base.",
            inputSchema={
                "type": "object",
                "properties": {
                    "project_id": {
                        "type": "string",
                        "description": "Optional project ID to filter by"
                    }
                }
            }
        ),
    ]


@server.call_tool()
async def handle_call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Handle tool calls"""
    
    if name == "search_knowledge":
        query = arguments["query"]
        item_type = arguments.get("item_type")
        project_id = arguments.get("project_id")
        limit = arguments.get("limit", 10)
        
        # First, do full-text search (with optional project scoping)
        text_results = repo.search(query, project_id=project_id)
        
        if item_type:
            text_results = [r for r in text_results if r.item_type == item_type]
        
        # If we have text results, enhance with similarity-based related items
        all_items = repo.get_all(project_id=project_id)
        
        # Convert items to dict format for similarity service
        items_dict = [{
            'id': item.id,
            'title': item.title,
            'content': item.content,
            'tags': item.tags or []
        } for item in all_items]
        
        # Build similarity index
        similarity_service.build_index(items_dict)
        
        # Collect results with similarity scores
        results_with_scores = []
        seen_ids = set()
        
        # Add text search results first (highest priority)
        for item in text_results[:limit]:
            if item.id not in seen_ids:
                results_with_scores.append({
                    "id": item.id,
                    "title": item.title,
                    "content": item.content[:200] + "..." if len(item.content) > 200 else item.content,
                    "type": str(item.item_type.value) if hasattr(item.item_type, 'value') else str(item.item_type),
                    "tags": item.tags,
                    "url": item.url,
                    "created_at": item.created_at.isoformat() if item.created_at else None,
                    "relevance": "text_match",
                    "score": 1.0
                })
                seen_ids.add(item.id)
        
        # If we need more results, add similar items
        if len(results_with_scores) < limit and text_results:
            for item in text_results[:3]:  # Use top 3 matches as seeds
                item_dict = next((i for i in items_dict if i['id'] == item.id), None)
                if item_dict:
                    # Find similar items
                    similar = similarity_service.get_related_items(
                        item_dict, 
                        items_dict, 
                        top_k=limit - len(results_with_scores),
                        threshold=0.15
                    )
                    
                    for similar_item, similarity_score in similar:
                        if similar_item['id'] not in seen_ids and len(results_with_scores) < limit:
                            # Get full item details
                            full_item = next((i for i in all_items if i.id == similar_item['id']), None)
                            if full_item:
                                results_with_scores.append({
                                    "id": full_item.id,
                                    "title": full_item.title,
                                    "content": full_item.content[:200] + "..." if len(full_item.content) > 200 else full_item.content,
                                    "type": str(full_item.item_type.value) if hasattr(full_item.item_type, 'value') else str(full_item.item_type),
                                    "tags": full_item.tags,
                                    "url": full_item.url,
                                    "created_at": full_item.created_at.isoformat() if full_item.created_at else None,
                                    "relevance": "similar",
                                    "score": similarity_score
                                })
                                seen_ids.add(full_item.id)
        
        response = {
            "count": len(results_with_scores),
            "items": results_with_scores
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "create_knowledge_item":
        title = arguments["title"]
        content = arguments["content"]
        item_type = ItemType(arguments["item_type"])
        tags = arguments.get("tags", [])
        url = arguments.get("url")
        language = arguments.get("language")
        project_id = arguments.get("project_id")
        
        # If no project_id specified, use the default project
        if not project_id:
            default_project = project_repo.get_default()
            if default_project:
                project_id = default_project.id
        
        # Check if this is a Google Docs URL and we should fetch content
        google_doc_content = None
        if url and is_google_doc(url):
            # Signal that Google Drive MCP should be used to fetch content
            google_doc_content = {
                "is_google_doc": True,
                "url": url,
                "message": "This is a Google Docs URL. Use the Google Drive MCP 'read' tool to fetch the document content automatically."
            }
        
        # Fetch link metadata if URL is provided and item is a link
        link_metadata = {}
        if url and item_type == ItemType.LINK:
            try:
                metadata = fetch_link_metadata(url)
                link_metadata = {
                    'link_title': metadata.get('link_title'),
                    'link_description': metadata.get('link_description'),
                    'link_image': metadata.get('link_image'),
                    'link_site_name': metadata.get('link_site_name')
                }
                
                # If title wasn't provided or is generic, use fetched title
                if metadata.get('link_title') and (not title or title == url):
                    title = metadata['link_title']
                
                # If content is empty or just the URL, use fetched description
                if metadata.get('link_description') and (not content or content == url):
                    content = metadata['link_description']
                    
            except Exception as e:
                # If metadata fetch fails, continue without it
                print(f"Warning: Could not fetch metadata for {url}: {e}")
        
        item = KnowledgeItem(
            title=title,
            content=content,
            item_type=item_type,
            tags=tags,
            url=url,
            language=language,
            project_id=project_id,
            **link_metadata
        )
        
        created_item = repo.create(item)
        
        item_type_str = str(created_item.item_type.value) if hasattr(created_item.item_type, 'value') else str(created_item.item_type)
        
        # Return structured content for the MCP App view
        structured_content = {
            "id": created_item.id,
            "title": created_item.title,
            "content": created_item.content,
            "type": item_type_str,
            "tags": created_item.tags,
            "url": created_item.url,
            "language": created_item.language,
            "favorite": created_item.favorite,
            "created_at": created_item.created_at.isoformat() if created_item.created_at else None,
            "updated_at": created_item.updated_at.isoformat() if created_item.updated_at else None,
        }
        
        # Build text content
        text_content = "Successfully created the item."
        if google_doc_content:
            text_content += f"\n\nNote: {google_doc_content['message']}"
        
        return {
            "content": [
                {
                    "type": "text",
                    "text": text_content
                }
            ],
            "structuredContent": structured_content
        }
    
    elif name == "find_similar_items":
        item_id = arguments["item_id"]
        threshold = arguments.get("threshold", 0.15)
        limit = arguments.get("limit", 5)
        
        # Get the target item
        target_item = repo.get_by_id(item_id)
        if not target_item:
            return [TextContent(
                type="text",
                text=json.dumps({"error": f"Item {item_id} not found"})
            )]
        
        # Get all items and convert to dict format
        all_items = repo.get_all()
        items_dict = [{
            'id': item.id,
            'title': item.title,
            'content': item.content,
            'tags': item.tags or []
        } for item in all_items]
        
        # Find the target item dict
        target_dict = next((i for i in items_dict if i['id'] == item_id), None)
        if not target_dict:
            return [TextContent(
                type="text",
                text=json.dumps({"error": f"Item {item_id} not found in index"})
            )]
        
        # Find similar items
        similar = similarity_service.get_related_items(
            target_dict,
            items_dict,
            top_k=limit,
            threshold=threshold
        )
        
        response = {
            "count": len(similar),
            "similar_items": [{
                "id": item["id"],
                "title": item["title"],
                "similarity": similarity_score,
                "type": str(next((i.item_type.value for i in all_items if i.id == item["id"]), "unknown")),
            } for item, similarity_score in similar]
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "get_item_details":
        item_id = arguments["item_id"]
        item = repo.get_by_id(item_id)
        
        if not item:
            return [TextContent(
                type="text",
                text=json.dumps({"error": f"Item {item_id} not found"})
            )]
        
        item_type_str = str(item.item_type.value) if hasattr(item.item_type, 'value') else str(item.item_type)
        
        # Return structured content - the _meta.ui.resourceUri is in the tool definition
        structured_content = {
            "id": item.id,
            "title": item.title,
            "content": item.content,
            "type": item_type_str,
            "tags": item.tags,
            "url": item.url,
            "language": item.language,
            "favorite": item.favorite,
            "created_at": item.created_at.isoformat() if item.created_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None,
        }
        
        # Return both content and structuredContent for the MCP App
        return {
            "content": [
                {
                    "type": "text",
                    "text": "Here is the item."
                }
            ],
            "structuredContent": structured_content
        }
    
    elif name == "get_knowledge_context":
        topic = arguments["topic"]
        limit = arguments.get("limit", 5)
        
        # Search for the topic
        results = repo.search(topic)
        
        # Get all items for similarity service
        all_items = repo.get_all()
        items_dict = [{
            'id': item.id,
            'title': item.title,
            'content': item.content,
            'tags': item.tags or []
        } for item in all_items]
        
        # Build similarity index
        similarity_service.build_index(items_dict)
        
        # If we have results, also find similar items
        context_items = []
        seen_ids = set()
        
        for item in results[:3]:  # Top 3 search results
            if item.id not in seen_ids:
                context_items.append({
                    "id": item.id,
                    "title": item.title,
                    "content": item.content[:300] + "..." if len(item.content) > 300 else item.content,
                    "type": str(item.item_type.value) if hasattr(item.item_type, 'value') else str(item.item_type),
                    "tags": item.tags,
                    "relevance": "direct_match"
                })
                seen_ids.add(item.id)
            
            # Find similar items using the similarity service
            if len(context_items) < limit:
                item_dict = next((i for i in items_dict if i['id'] == item.id), None)
                if item_dict:
                    similar = similarity_service.get_related_items(
                        item_dict, 
                        items_dict, 
                        top_k=limit - len(context_items),
                        threshold=0.2
                    )
                    
                    for similar_item, similarity_score in similar:
                        if similar_item["id"] not in seen_ids and len(context_items) < limit:
                            # Get full item details
                            full_item = next((i for i in all_items if i.id == similar_item["id"]), None)
                            if full_item:
                                context_items.append({
                                    "id": full_item.id,
                                    "title": full_item.title,
                                    "content": full_item.content[:300] + "..." if len(full_item.content) > 300 else full_item.content,
                                    "type": str(full_item.item_type.value) if hasattr(full_item.item_type, 'value') else str(full_item.item_type),
                                    "tags": full_item.tags,
                                    "relevance": "similar",
                                    "similarity": similarity_score
                                })
                                seen_ids.add(full_item.id)
        
        response = {
            "topic": topic,
            "count": len(context_items),
            "context": context_items
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "update_knowledge_item":
        item_id = arguments["item_id"]
        item = repo.get_by_id(item_id)
        
        if not item:
            return [TextContent(
                type="text",
                text=json.dumps({"error": f"Item {item_id} not found"})
            )]
        
        # Update fields if provided
        if "title" in arguments:
            item.title = arguments["title"]
        if "content" in arguments:
            item.content = arguments["content"]
        if "tags" in arguments:
            item.tags = arguments["tags"]
        if "url" in arguments:
            item.url = arguments["url"]
        
        updated_item = repo.update(item)
        
        response = {
            "success": True,
            "item": {
                "id": updated_item.id,
                "title": updated_item.title,
                "updated_at": updated_item.updated_at.isoformat() if updated_item.updated_at else None,
            }
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "list_all_tags":
        items = repo.get_all()
        all_tags = set()
        
        for item in items:
            if item.tags:
                all_tags.update(item.tags)
        
        response = {
            "count": len(all_tags),
            "tags": sorted(list(all_tags))
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "debug_item_connections":
        item_id = arguments["item_id"]
        show_all = arguments.get("show_all", False)
        
        # Get the target item
        target_item = repo.get_by_id(item_id)
        if not target_item:
            return [TextContent(
                type="text",
                text=json.dumps({"error": f"Item {item_id} not found"})
            )]
        
        # Get all items
        all_items = repo.get_all()
        items_dict = [{
            'id': item.id,
            'title': item.title,
            'content': item.content,
            'tags': item.tags or []
        } for item in all_items]
        
        # Find target dict
        target_dict = next((i for i in items_dict if i['id'] == item_id), None)
        
        # Build similarity index
        similarity_service.build_index(items_dict)
        
        # Calculate similarity to ALL items
        all_similarities = []
        for item_dict in items_dict:
            if item_dict['id'] != item_id:  # Skip self
                score = similarity_service.get_similarity_score(target_dict, item_dict)
                all_similarities.append({
                    "id": item_dict["id"],
                    "title": item_dict["title"],
                    "similarity": round(score, 4),
                    "above_threshold_0.15": score >= 0.15,
                    "above_threshold_0.10": score >= 0.10,
                    "above_threshold_0.05": score >= 0.05
                })
        
        # Sort by similarity
        all_similarities.sort(key=lambda x: x["similarity"], reverse=True)
        
        # Filter if not showing all
        if not show_all:
            all_similarities = [s for s in all_similarities if s["similarity"] >= 0.05]
        
        # Analysis
        above_15 = sum(1 for s in all_similarities if s["above_threshold_0.15"])
        above_10 = sum(1 for s in all_similarities if s["above_threshold_0.10"])
        above_5 = sum(1 for s in all_similarities if s["above_threshold_0.05"])
        
        response = {
            "item": {
                "id": target_item.id,
                "title": target_item.title,
                "type": str(target_item.item_type.value) if hasattr(target_item.item_type, 'value') else str(target_item.item_type),
                "content_length": len(target_item.content),
                "tags": target_item.tags
            },
            "analysis": {
                "total_items_in_db": len(all_items) - 1,  # Excluding self
                "connections_at_threshold_0.15": above_15,
                "connections_at_threshold_0.10": above_10,
                "connections_at_threshold_0.05": above_5,
                "graph_default_threshold": 0.15,
                "will_show_in_graph": above_15 > 0
            },
            "recommendations": [],
            "similarity_scores": all_similarities[:20] if not show_all else all_similarities
        }
        
        # Add recommendations
        if above_15 == 0:
            if above_10 > 0:
                response["recommendations"].append("Lower the graph threshold to 0.10 to see connections")
            elif above_5 > 0:
                response["recommendations"].append("Lower the graph threshold to 0.05 to see connections")
            else:
                response["recommendations"].append("This item has very low similarity to all other items. Consider:")
                response["recommendations"].append("- Adding more related documents on similar topics")
                response["recommendations"].append("- Expanding the content with more details")
                response["recommendations"].append("- Adding tags that match other documents")
        else:
            response["recommendations"].append(f"✅ This item should appear in the graph with {above_15} connection(s)")
            response["recommendations"].append("If not visible, try refreshing the web app (Ctrl+Shift+R)")
        
        if len(target_item.content) < 100:
            response["recommendations"].append("⚠️ Content is very short - may affect similarity calculations")
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    # Region tool handlers
    elif name == "list_regions":
        include_hidden = arguments.get("include_hidden", False)
        
        regions = region_repo.get_all(visible_only=not include_hidden)
        
        response = {
            "count": len(regions),
            "regions": [r.to_dict() for r in regions]
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "get_region":
        region_id = arguments["region_id"]
        region = region_repo.get_by_id(region_id)
        
        if not region:
            return [TextContent(
                type="text",
                text=json.dumps({"error": f"Region {region_id} not found"})
            )]
        
        # Get items with details
        items = region_repo.get_items_with_details(region_id)
        
        response = {
            "region": region.to_dict(),
            "items": [{
                "id": item.id,
                "title": item.title,
                "type": str(item.item_type.value) if hasattr(item.item_type, 'value') else str(item.item_type),
                "tags": item.tags,
                "content_preview": item.content[:200] + "..." if len(item.content) > 200 else item.content
            } for item in items]
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "get_region_context":
        region_id = arguments["region_id"]
        query = arguments.get("query")
        limit = arguments.get("limit", 50)
        
        region = region_repo.get_by_id(region_id)
        if not region:
            return [TextContent(
                type="text",
                text=json.dumps({"error": f"Region {region_id} not found"})
            )]
        
        # Get all items in the region with full details
        items = region_repo.get_items_with_details(region_id)
        
        # If query provided, rank items by relevance
        if query and items:
            items_dict = [{
                'id': item.id,
                'title': item.title,
                'content': item.content,
                'tags': item.tags or []
            } for item in items]
            
            # Build index and score items
            similarity_service.build_index(items_dict)
            
            # Create a pseudo-item for the query
            query_dict = {'id': 'query', 'title': query, 'content': query, 'tags': []}
            
            scored_items = []
            for item, item_dict in zip(items, items_dict):
                score = similarity_service.get_similarity_score(query_dict, item_dict)
                scored_items.append((item, score))
            
            # Sort by score and limit
            scored_items.sort(key=lambda x: x[1], reverse=True)
            items = [item for item, score in scored_items[:limit]]
        else:
            items = items[:limit]
        
        response = {
            "region": {
                "id": region.id,
                "name": region.name,
                "description": region.description,
                "color": region.color,
                "type": region.region_type
            },
            "item_count": len(items),
            "items": [{
                "id": item.id,
                "title": item.title,
                "content": item.content,  # Full content for context
                "type": str(item.item_type.value) if hasattr(item.item_type, 'value') else str(item.item_type),
                "tags": item.tags,
                "url": item.url
            } for item in items]
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "suggest_regions":
        query = arguments["query"]
        limit = arguments.get("limit", 3)
        
        regions = region_repo.get_all(visible_only=True)
        
        if not regions:
            return [TextContent(
                type="text",
                text=json.dumps({"count": 0, "suggestions": [], "message": "No regions found"})
            )]
        
        # Score each region by relevance to the query
        scored_regions = []
        
        for region in regions:
            score = 0.0
            
            # Check name match
            if query.lower() in region.name.lower():
                score += 0.5
            
            # Check description match
            if region.description and query.lower() in region.description.lower():
                score += 0.3
            
            # Get items and check content relevance
            items = region_repo.get_items_with_details(region.id)
            if items:
                # Check if query terms appear in item titles/tags
                query_terms = query.lower().split()
                for item in items:
                    for term in query_terms:
                        if term in item.title.lower():
                            score += 0.1
                        if item.tags and any(term in tag.lower() for tag in item.tags):
                            score += 0.05
            
            if score > 0:
                scored_regions.append((region, score, len(items)))
        
        # Sort by score
        scored_regions.sort(key=lambda x: x[1], reverse=True)
        
        response = {
            "query": query,
            "count": min(len(scored_regions), limit),
            "suggestions": [{
                "region_id": region.id,
                "name": region.name,
                "description": region.description,
                "color": region.color,
                "item_count": item_count,
                "relevance_score": round(score, 3)
            } for region, score, item_count in scored_regions[:limit]]
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "create_region":
        name = arguments["name"]
        description = arguments.get("description", "")
        color = arguments.get("color", "#8b5cf6")  # Default purple
        item_ids = arguments.get("item_ids", [])
        
        region = Region(
            name=name,
            description=description,
            color=color,
            region_type=RegionType.MANUAL,
            item_ids=item_ids
        )
        
        created_region = region_repo.create(region)
        
        # Add items if provided
        if item_ids:
            region_repo.set_items(created_region.id, item_ids)
        
        response = {
            "success": True,
            "region": created_region.to_dict()
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "add_items_to_region":
        region_id = arguments["region_id"]
        item_ids = arguments["item_ids"]
        
        region = region_repo.get_by_id(region_id)
        if not region:
            return [TextContent(
                type="text",
                text=json.dumps({"error": f"Region {region_id} not found"})
            )]
        
        region_repo.add_items(region_id, item_ids)
        
        # Get updated region
        updated_region = region_repo.get_by_id(region_id)
        
        response = {
            "success": True,
            "region": updated_region.to_dict(),
            "added_count": len(item_ids)
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    # Profile tool handlers
    elif name == "list_profiles":
        profiles = profile_repo.get_all()
        
        response = {
            "count": len(profiles),
            "profiles": [p.to_dict() for p in profiles]
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "get_profile_templates":
        templates = {}
        for key, profile in PROFILE_TEMPLATES.items():
            templates[key] = profile.to_dict()
        
        response = {
            "count": len(templates),
            "templates": templates
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "get_region_profile":
        region_id = arguments["region_id"]
        
        region = region_repo.get_by_id(region_id)
        if not region:
            return [TextContent(
                type="text",
                text=json.dumps({"error": f"Region {region_id} not found"})
            )]
        
        profile = region_repo.get_profile(region_id)
        
        if not profile:
            response = {
                "region_id": region_id,
                "region_name": region.name,
                "profile": None,
                "message": "No profile assigned to this region"
            }
        else:
            response = {
                "region_id": region_id,
                "region_name": region.name,
                "profile": profile.to_dict()
            }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "get_context_with_profile":
        region_id = arguments["region_id"]
        query = arguments.get("query")
        limit = arguments.get("limit")
        
        region = region_repo.get_by_id(region_id)
        if not region:
            return [TextContent(
                type="text",
                text=json.dumps({"error": f"Region {region_id} not found"})
            )]
        
        # Get profile for this region
        profile = region_repo.get_profile(region_id)
        
        # Use profile's max_context_items if no limit specified
        if limit is None and profile:
            limit = profile.max_context_items
        elif limit is None:
            limit = 20  # Default
        
        # Get items in the region
        items = region_repo.get_items_with_details(region_id)
        
        # If query provided, rank items by relevance
        if query and items:
            items_dict = [{
                'id': item.id,
                'title': item.title,
                'content': item.content,
                'tags': item.tags or []
            } for item in items]
            
            similarity_service.build_index(items_dict)
            query_dict = {'id': 'query', 'title': query, 'content': query, 'tags': []}
            
            scored_items = []
            for item, item_dict in zip(items, items_dict):
                score = similarity_service.get_similarity_score(query_dict, item_dict)
                scored_items.append((item, score))
            
            scored_items.sort(key=lambda x: x[1], reverse=True)
            items = [item for item, score in scored_items[:limit]]
        else:
            items = items[:limit]
        
        # Build response with profile settings
        response = {
            "region": {
                "id": region.id,
                "name": region.name,
                "description": region.description
            },
            "profile": profile.to_dict() if profile else None,
            "ai_settings": {
                "model_provider": profile.model_provider if profile else None,
                "model_name": profile.model_name if profile else None,
                "temperature": profile.temperature if profile else 0.7,
                "system_prompt": profile.system_prompt if profile else None,
                "context_strategy": profile.context_strategy.value if profile and hasattr(profile.context_strategy, 'value') else "dense_retrieval"
            },
            "item_count": len(items),
            "items": [{
                "id": item.id,
                "title": item.title,
                "content": item.content,
                "type": str(item.item_type.value) if hasattr(item.item_type, 'value') else str(item.item_type),
                "tags": item.tags,
                "url": item.url
            } for item in items]
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "suggest_profile":
        query = arguments["query"]
        content_type = arguments.get("content_type")
        
        # Get all profiles (both saved and templates)
        saved_profiles = profile_repo.get_all()
        
        # Score profiles based on query and content type
        scored_profiles = []
        
        # Keywords for different profile types
        code_keywords = ["code", "programming", "function", "debug", "implement", "api", "bug", "syntax", "error"]
        research_keywords = ["research", "analyze", "study", "explore", "investigate", "understand", "compare"]
        creative_keywords = ["creative", "brainstorm", "idea", "write", "story", "design", "imagine"]
        doc_keywords = ["document", "documentation", "explain", "guide", "tutorial", "readme", "how to"]
        
        query_lower = query.lower()
        
        # Score templates
        for key, template in PROFILE_TEMPLATES.items():
            score = 0.0
            
            # Content type hint
            if content_type:
                if content_type == "code" and key == "code_assistant":
                    score += 0.5
                elif content_type == "research" and key == "research_mode":
                    score += 0.5
                elif content_type == "creative" and key == "creative_writing":
                    score += 0.5
                elif content_type == "documentation" and key == "documentation":
                    score += 0.5
            
            # Keyword matching
            if key == "code_assistant":
                score += sum(0.1 for kw in code_keywords if kw in query_lower)
            elif key == "research_mode":
                score += sum(0.1 for kw in research_keywords if kw in query_lower)
            elif key == "creative_writing":
                score += sum(0.1 for kw in creative_keywords if kw in query_lower)
            elif key == "documentation":
                score += sum(0.1 for kw in doc_keywords if kw in query_lower)
            elif key == "quick_lookup":
                if len(query.split()) <= 5:  # Short queries
                    score += 0.2
            
            if score > 0:
                scored_profiles.append({
                    "type": "template",
                    "key": key,
                    "profile": template.to_dict(),
                    "score": score
                })
        
        # Score saved profiles
        for profile in saved_profiles:
            score = 0.0
            
            # Check name/description match
            if profile.name and query_lower in profile.name.lower():
                score += 0.3
            if profile.description and query_lower in profile.description.lower():
                score += 0.2
            
            if score > 0:
                scored_profiles.append({
                    "type": "saved",
                    "id": profile.id,
                    "profile": profile.to_dict(),
                    "score": score
                })
        
        # Sort by score
        scored_profiles.sort(key=lambda x: x["score"], reverse=True)
        
        # If no matches, suggest based on content type or default
        if not scored_profiles:
            if content_type == "code":
                scored_profiles.append({
                    "type": "template",
                    "key": "code_assistant",
                    "profile": PROFILE_TEMPLATES["code_assistant"].to_dict(),
                    "score": 0.1,
                    "reason": "Default for code tasks"
                })
            elif content_type == "research":
                scored_profiles.append({
                    "type": "template",
                    "key": "research_mode",
                    "profile": PROFILE_TEMPLATES["research_mode"].to_dict(),
                    "score": 0.1,
                    "reason": "Default for research tasks"
                })
            else:
                scored_profiles.append({
                    "type": "template",
                    "key": "quick_lookup",
                    "profile": PROFILE_TEMPLATES["quick_lookup"].to_dict(),
                    "score": 0.1,
                    "reason": "General purpose default"
                })
        
        response = {
            "query": query,
            "content_type": content_type,
            "suggestions": scored_profiles[:3]
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    # Project (Knowledge Base) tool handlers
    elif name == "list_projects":
        include_archived = arguments.get("include_archived", False)
        
        projects = project_repo.get_all(include_archived=include_archived)
        
        response = {
            "count": len(projects),
            "projects": [p.to_dict() for p in projects]
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "get_project":
        project_id = arguments["project_id"]
        project = project_repo.get_by_id(project_id)
        
        if not project:
            return [TextContent(
                type="text",
                text=json.dumps({"error": f"Project {project_id} not found"})
            )]
        
        # Get stats for the project
        stats = project_repo.get_stats(project_id)
        
        response = {
            "project": project.to_dict(),
            "stats": stats
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "get_current_project":
        project = project_repo.get_default()
        
        if not project:
            return [TextContent(
                type="text",
                text=json.dumps({"error": "No default project found"})
            )]
        
        response = {
            "project": project.to_dict(),
            "message": "This is the current default project. New items will be added here."
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "create_project":
        name = arguments["name"]
        description = arguments.get("description", "")
        color = arguments.get("color", "#6366f1")  # Default indigo
        icon = arguments.get("icon", "📁")
        
        project = Project(
            name=name,
            description=description,
            color=color,
            icon=icon
        )
        
        created_project = project_repo.create(project)
        
        response = {
            "success": True,
            "project": created_project.to_dict()
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "switch_project":
        project_id = arguments["project_id"]
        
        project = project_repo.get_by_id(project_id)
        if not project:
            return [TextContent(
                type="text",
                text=json.dumps({"error": f"Project {project_id} not found"})
            )]
        
        # Set as default
        project_repo.set_default(project_id)
        
        # Update last accessed
        project_repo.update_last_accessed(project_id)
        
        response = {
            "success": True,
            "project": project.to_dict(),
            "message": f"Switched to project '{project.name}'. New items will be added here."
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    elif name == "get_project_context":
        project_id = arguments.get("project_id")
        query = arguments.get("query")
        limit = arguments.get("limit", 20)
        
        # Use default project if not specified
        if not project_id:
            default_project = project_repo.get_default()
            if default_project:
                project_id = default_project.id
            else:
                return [TextContent(
                    type="text",
                    text=json.dumps({"error": "No project specified and no default project found"})
                )]
        
        project = project_repo.get_by_id(project_id)
        if not project:
            return [TextContent(
                type="text",
                text=json.dumps({"error": f"Project {project_id} not found"})
            )]
        
        # Get items for this project
        items = repo.get_all(project_id=project_id, limit=limit)
        
        # If query provided, rank items by relevance
        if query and items:
            items_dict = [{
                'id': item.id,
                'title': item.title,
                'content': item.content,
                'tags': item.tags or []
            } for item in items]
            
            similarity_service.build_index(items_dict)
            query_dict = {'id': 'query', 'title': query, 'content': query, 'tags': []}
            
            scored_items = []
            for item, item_dict in zip(items, items_dict):
                score = similarity_service.get_similarity_score(query_dict, item_dict)
                scored_items.append((item, score))
            
            scored_items.sort(key=lambda x: x[1], reverse=True)
            items = [item for item, score in scored_items[:limit]]
        
        # Get regions for this project
        regions = region_repo.get_all(project_id=project_id)
        
        # Get stats
        stats = project_repo.get_stats(project_id)
        
        response = {
            "project": project.to_dict(),
            "stats": stats,
            "regions": [{
                "id": r.id,
                "name": r.name,
                "description": r.description,
                "color": r.color,
                "item_count": len(r.item_ids) if r.item_ids else 0
            } for r in regions],
            "item_count": len(items),
            "items": [{
                "id": item.id,
                "title": item.title,
                "content": item.content[:300] + "..." if len(item.content) > 300 else item.content,
                "type": str(item.item_type.value) if hasattr(item.item_type, 'value') else str(item.item_type),
                "tags": item.tags,
                "url": item.url
            } for item in items]
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    # Skills tool handlers
    elif name == "list_skills":
        github_token = arguments.get("github_token")
        
        try:
            skills = list_available_skills(github_token)
            
            response = {
                "count": len(skills),
                "skills": [{
                    "name": skill["name"],
                    "url": skill["url"],
                    "path": skill["path"]
                } for skill in skills]
            }
            
            return [TextContent(
                type="text",
                text=json.dumps(response, indent=2)
            )]
            
        except SkillImportError as e:
            return [TextContent(
                type="text",
                text=json.dumps({"error": str(e)})
            )]
    
    elif name == "get_skill":
        skill_name = arguments["skill_name"]
        github_token = arguments.get("github_token")
        
        try:
            skill_data = fetch_skill(skill_name, github_token)
            
            # Count bundled resources
            resource_count = sum(len(files) for files in skill_data['bundled_resources'].values())
            
            response = {
                "name": skill_data["name"],
                "metadata": skill_data["frontmatter"],
                "content": skill_data["content"],
                "source_url": skill_data["source_url"],
                "bundled_resources": skill_data["bundled_resources"],
                "resource_count": resource_count
            }
            
            return [TextContent(
                type="text",
                text=json.dumps(response, indent=2)
            )]
            
        except SkillImportError as e:
            return [TextContent(
                type="text",
                text=json.dumps({"error": str(e)})
            )]
    
    elif name == "search_skills":
        query = arguments["query"]
        source = arguments.get("source", "all")
        limit = arguments.get("limit", 10)
        
        results = []
        query_lower = query.lower()
        
        try:
            # Search Anthropic repository if requested
            if source in ["all", "anthropic"]:
                github_token = arguments.get("github_token")
                available_skills = list_available_skills(github_token)
                
                for skill in available_skills:
                    # Simple name matching for now
                    if query_lower in skill["name"].lower():
                        results.append({
                            "name": skill["name"],
                            "source": "anthropic",
                            "url": skill["url"],
                            "imported": False
                        })
            
            # Search imported skills if requested
            if source in ["all", "imported"]:
                imported = repo.search(query, item_type="skill")
                
                for item in imported[:limit]:
                    skill_meta = item.skill_metadata or {}
                    results.append({
                        "name": skill_meta.get("name", item.title),
                        "source": "imported",
                        "id": item.id,
                        "title": item.title,
                        "description": skill_meta.get("description", ""),
                        "url": item.url,
                        "imported": True,
                        "created_at": item.created_at.isoformat() if item.created_at else None
                    })
            
            response = {
                "query": query,
                "count": len(results[:limit]),
                "results": results[:limit]
            }
            
            return [TextContent(
                type="text",
                text=json.dumps(response, indent=2)
            )]
            
        except SkillImportError as e:
            return [TextContent(
                type="text",
                text=json.dumps({"error": str(e)})
            )]
    
    elif name == "import_skill":
        skill_name = arguments["skill_name"]
        project_id = arguments.get("project_id")
        github_token = arguments.get("github_token")
        
        try:
            # Fetch skill from Anthropic repository
            skill_data = fetch_skill(skill_name, github_token)
            
            # Use default project if not specified
            if not project_id:
                default_project = project_repo.get_default()
                if default_project:
                    project_id = default_project.id
            
            # Convert to knowledge item
            item_data = skill_to_knowledge_item(skill_data, project_id)
            
            # Check if already imported
            existing = repo.search(f"Skill: {skill_data['name']}", item_type="skill")
            
            if existing:
                return [TextContent(
                    type="text",
                    text=json.dumps({
                        "warning": f"Skill '{skill_name}' is already imported",
                        "existing_item_id": existing[0].id,
                        "message": "Use update_knowledge_item to modify it, or delete and reimport"
                    })
                )]
            
            # Create skill item
            skill_item = KnowledgeItem(
                title=item_data['title'],
                content=item_data['content'],
                item_type=ItemType.SKILL,
                url=item_data['url'],
                skill_metadata=item_data['skill_metadata'],
                project_id=item_data.get('project_id'),
                tags=item_data.get('tags', []),
            )
            
            created_item = repo.create(skill_item)
            
            # Count resources
            bundled = skill_data['bundled_resources']
            resource_count = sum(len(files) for files in bundled.values())
            
            response = {
                "success": True,
                "skill_name": skill_data['name'],
                "item_id": created_item.id,
                "source_url": skill_data['source_url'],
                "resource_count": resource_count,
                "bundled_resources": {
                    k: len(v) for k, v in bundled.items() if v
                },
                "message": f"Successfully imported skill '{skill_name}' into Brian"
            }
            
            return [TextContent(
                type="text",
                text=json.dumps(response, indent=2)
            )]
            
        except SkillImportError as e:
            return [TextContent(
                type="text",
                text=json.dumps({"error": str(e)})
            )]
        except Exception as e:
            return [TextContent(
                type="text",
                text=json.dumps({"error": f"Unexpected error: {str(e)}"})
            )]
    
    elif name == "get_imported_skills":
        project_id = arguments.get("project_id")
        
        # Get all skill items
        all_items = repo.get_all(project_id=project_id)
        skills = [item for item in all_items if item.item_type == ItemType.SKILL]
        
        response = {
            "count": len(skills),
            "skills": [{
                "id": item.id,
                "title": item.title,
                "name": item.skill_metadata.get("name") if item.skill_metadata else None,
                "description": item.skill_metadata.get("description") if item.skill_metadata else None,
                "source_url": item.url,
                "tags": item.tags,
                "created_at": item.created_at.isoformat() if item.created_at else None,
                "bundled_resources": item.skill_metadata.get("bundled_resources") if item.skill_metadata else None
            } for item in skills]
        }
        
        return [TextContent(
            type="text",
            text=json.dumps(response, indent=2)
        )]
    
    else:
        raise ValueError(f"Unknown tool: {name}")


async def main():
    """Main entry point for the MCP server"""
    # Initialize services
    init_services()
    
    # Run the server using stdin/stdout streams
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="brian-knowledge",
                server_version="0.1.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )


if __name__ == "__main__":
    asyncio.run(main())
