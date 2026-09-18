# Brian Backend

The Python backend for Brian, your personal knowledge base with vector-based similarity search and Goose AI integration.

## Overview

This package provides:
- FastAPI REST API for knowledge item management
- SQLite database with FTS5 full-text search
- TF-IDF vector similarity calculations
- MCP server for Goose AI assistant integration
- Project and region management

## Quick Start

```bash
# Install in development mode
pip install -e .

# Start the backend server
python -m brian.main
```

The API will be available at `http://127.0.0.1:8080`

## Configuration

Environment variables:

```bash
BRIAN_DB_PATH=~/.brian/brian.db
BRIAN_HOST=127.0.0.1
BRIAN_PORT=8080
BRIAN_DEBUG=false
```

## Project Structure

```
brian/
├── api/               # FastAPI routes
│   └── routes.py      # All API endpoints
├── database/          # SQLite database layer
│   ├── migrations.py  # Database migrations
│   ├── repository.py  # Data access layer
│   └── schema.py      # Database schema
├── models/            # Data models
│   └── knowledge_item.py
├── services/          # Business logic
│   ├── similarity.py  # TF-IDF similarity calculations
│   ├── clustering.py  # Item clustering
│   └── link_preview.py # URL metadata extraction
├── skills/            # CLI and import utilities
│   ├── cli.py         # Command-line interface
│   └── importer.py    # Data import tools
├── templates/         # HTML templates
└── main.py            # FastAPI application entry point
```

## API Endpoints

### Knowledge Items
- `GET /api/items` - List all knowledge items
- `POST /api/items` - Create a new item
- `GET /api/items/{id}` - Get item details
- `PUT /api/items/{id}` - Update an item
- `DELETE /api/items/{id}` - Delete an item

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create a new project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update a project
- `DELETE /api/projects/{id}` - Delete a project

### Regions
- `GET /api/regions` - List all regions
- `POST /api/regions` - Create a new region
- `GET /api/regions/{id}` - Get region details

### Search
- `GET /api/search` - Full-text and similarity search
- `GET /api/items/{id}/similar` - Find similar items

### Connections
- `GET /api/connections` - List all explicit connections
- `POST /api/connections` - Create a connection between items
- `DELETE /api/connections/{id}` - Delete a connection

## MCP Server

The `brian_mcp` package provides Goose AI assistant integration via the Model Context Protocol.

### Setup

The setup script automatically configures Goose to use the MCP server:

```yaml
extensions:
  brian:
    provider: mcp
    config:
      command: "/path/to/brian/venv/bin/python"
      args:
        - "-m"
        - "brian_mcp.server"
```

### MCP Tools

- `create_knowledge_item` - Add new items
- `search_knowledge` - Search with full-text and similarity
- `find_similar_items` - Find related items
- `list_projects` / `create_project` / `switch_project` - Project management
- `list_regions` / `create_region` - Region management
- `get_knowledge_context` - Get relevant context for a topic
- `create_connection` / `get_item_connections` - Manage explicit connections

## Database Schema

The SQLite database includes:

- `knowledge_items` - All knowledge items (links, notes, snippets, papers)
- `projects` - Knowledge base projects
- `regions` - Knowledge regions within projects
- `connections` - Explicit connections between items
- `item_tags` - Tag associations

FTS5 virtual tables enable fast full-text search.

## Similarity Algorithm

Brian uses TF-IDF vectorization with cosine similarity:

1. Text is tokenized and vectorized using TF-IDF
2. Cosine similarity measures the angle between vectors
3. Connections are filtered by a threshold (default: 0.15)
4. Global IDF scores are pre-computed for efficiency

## Development

```bash
# Run tests
pytest

# Run the MCP server directly
python -m brian_mcp.server

# Type check
mypy brian

# Lint
ruff check brian
```

## Dependencies

- Python 3.8+
- FastAPI
- Uvicorn
- MCP
- Requests
- BeautifulSoup4
- SQLite3 (included in Python standard library)
