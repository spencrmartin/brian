# Brian MCP Server

Model Context Protocol server for Brian, your personal knowledge management system.

## Features

The Brian MCP server exposes your knowledge base to AI assistants through the Model Context Protocol, enabling:

- **Search**: Full-text search across all knowledge items
- **Create**: Add new notes, links, code snippets, and papers
- **Discover**: Find similar items using cosine similarity
- **Context**: Get relevant knowledge for any topic
- **Update**: Modify existing knowledge items
- **Explore**: Access statistics, graphs, and recent items

## Installation

From the brian directory:

```bash
# Install in development mode
pip install -e .

# Or install MCP dependencies only
pip install mcp
```

## Configuration for Goose

Add Brian to your Goose configuration:

### For Goose Desktop

Edit your Goose configuration file (usually at `~/.config/goose/config.yaml` or similar):

```yaml
mcp_servers:
  brian:
    command: python
    args:
      - -m
      - brian_mcp.server
    cwd: /Users/spencermartin/brian
    env: {}
```

### For Goose CLI

Add to your `~/.config/goose/profiles.yaml`:

```yaml
default:
  provider: openai
  processor: gpt-4
  accelerator: gpt-4o-mini
  moderator: passive
  
  mcp_servers:
    brian:
      command: python
      args:
        - -m
        - brian_mcp.server
      cwd: /Users/spencermartin/brian
```

## Available Tools

### search_knowledge
Search the knowledge base for items matching a query.

```json
{
  "query": "machine learning",
  "item_type": "note",  // optional: note, link, code, paper
  "limit": 10           // optional: max results
}
```

### create_knowledge_item
Create a new knowledge item.

```json
{
  "title": "Understanding Transformers",
  "content": "Transformers are a type of neural network architecture...",
  "item_type": "note",
  "tags": ["ml", "nlp", "transformers"],
  "url": "https://example.com"  // optional
}
```

### find_similar_items
Find items similar to a given item.

```json
{
  "item_id": 42,
  "threshold": 0.15,  // optional: 0.0-1.0
  "limit": 5          // optional
}
```

### get_item_details
Get full details of a specific item.

```json
{
  "item_id": 42
}
```

### get_knowledge_context
Get relevant knowledge items for a topic.

```json
{
  "topic": "react hooks",
  "limit": 5  // optional
}
```

### update_knowledge_item
Update an existing item.

```json
{
  "item_id": 42,
  "title": "New Title",     // optional
  "content": "New content",  // optional
  "tags": ["new", "tags"]    // optional
}
```

### list_all_tags
Get all unique tags in the knowledge base.

```json
{}
```

## Available Resources

### brian://stats
Overall statistics about the knowledge base.

### brian://graph
Full connection graph with nodes and edges.

### brian://recent
10 most recently created items.

## Usage Examples

### With Goose

Once configured, you can use Brian naturally in Goose conversations:

```
You: What do I know about React?
Goose: [uses search_knowledge tool]
Goose: You have 5 items about React. Here are the key concepts...

You: Save this note about React Server Components
Goose: [uses create_knowledge_item tool]
Goose: I've saved your note and found 3 related items.

You: Find items similar to my React hooks note
Goose: [uses find_similar_items tool]
Goose: Here are 4 similar items about React...
```

### Direct Testing

You can test the MCP server directly:

```bash
# Run the server
python -m brian_mcp.server

# It will wait for JSON-RPC messages on stdin
```

## Architecture

The MCP server:
- Connects to the same SQLite database as the Brian web app
- Uses the existing repository and service layers
- Exposes tools and resources via the MCP protocol
- Runs as a subprocess managed by Goose

## Development

### Running Tests

```bash
pytest brian_mcp/
```

### Adding New Tools

1. Add tool definition in `handle_list_tools()`
2. Implement handler in `handle_call_tool()`
3. Update this README

### Adding New Resources

1. Add resource definition in `handle_list_resources()`
2. Implement handler in `handle_read_resource()`
3. Update this README

## Troubleshooting

### Server won't start
- Check that Python path is correct in config
- Verify brian package is installed: `pip install -e .`
- Check MCP is installed: `pip install mcp`

### Tools not working
- Ensure Brian backend is not running (MCP accesses DB directly)
- Check database path: `~/.brian/brian.db`
- Verify database has data: `sqlite3 ~/.brian/brian.db "SELECT COUNT(*) FROM knowledge_items;"`

### Goose can't find the server
- Check the `cwd` path in your config
- Verify the command and args are correct
- Look at Goose logs for error messages

## License

Same as Brian project.
