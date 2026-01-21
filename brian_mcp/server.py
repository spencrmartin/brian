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
from brian.database.repository import KnowledgeRepository
from brian.services.similarity import SimilarityService
from brian.services.link_preview import fetch_link_metadata, is_google_doc
from brian.models.knowledge_item import KnowledgeItem, ItemType

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

# Global repository instance
repo: Optional[KnowledgeRepository] = None
similarity_service: Optional[SimilarityService] = None




def init_services():
    """Initialize database connection and services"""
    global repo, similarity_service
    db_path = os.path.expanduser("~/.brian/brian.db")
    db = Database(db_path)
    # Don't call initialize() - it breaks FTS queries in autocommit mode
    # The database should already be initialized by the web app
    repo = KnowledgeRepository(db)
    similarity_service = SimilarityService()


# Load HTML template for item view
TEMPLATES_DIR = Path(__file__).parent / "templates"
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
            description="Search the knowledge base for items matching a query. Supports full-text search across titles and content.",
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
    ]


@server.call_tool()
async def handle_call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Handle tool calls"""
    
    if name == "search_knowledge":
        query = arguments["query"]
        item_type = arguments.get("item_type")
        limit = arguments.get("limit", 10)
        
        # First, do full-text search
        text_results = repo.search(query)
        
        if item_type:
            text_results = [r for r in text_results if r.item_type == item_type]
        
        # If we have text results, enhance with similarity-based related items
        all_items = repo.get_all()
        
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
        
        # Build text content - instruct LLM not to repeat the structured data
        text_content = f"Successfully created the item. The details are displayed in the UI above - no need to repeat them."
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
        # Text content instructs LLM not to repeat the data shown in UI
        return {
            "content": [
                {
                    "type": "text",
                    "text": "Here is the item. The details are displayed in the UI above - no need to repeat them."
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
