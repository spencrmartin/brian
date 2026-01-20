# 🧠 Brian - Your Personal Knowledge Base

> A play on "brain" - Brian is your intelligent knowledge repository with vector-based similarity search, beautiful graph visualization, and seamless Goose integration.

![Brian Screenshot](https://via.placeholder.com/800x400?text=Brian+Knowledge+Graph)

## ✨ Features

- **📚 Knowledge Management**: Store links, notes, code snippets, and papers
- **🔍 Smart Search**: Full-text search with FTS5 + TF-IDF vector similarity
- **🕸️ Graph Visualization**: Interactive D3.js force-directed graph showing connections
- **🎨 Theme Highlighting**: Hover over tags to see themed connections with colored drop shadows
- **🤖 Goose Integration**: Use Brian directly from Goose AI assistant via MCP
- **📊 Timeline View**: Chronological view of your knowledge items
- **🔗 Link Previews**: Automatic metadata extraction from URLs
- **📄 Google Docs Support**: Seamless integration with Google Drive documents

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **Goose** (optional) - For AI assistant integration

### One-Command Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/brian.git
cd brian

# Run the setup script
./setup.sh
```

That's it! The setup script will:
- ✅ Install all Python dependencies
- ✅ Install all frontend dependencies
- ✅ Create the Brian data directory
- ✅ Configure the Goose extension automatically
- ✅ Create convenient start/stop scripts

### Start Brian

```bash
./start.sh
```

This starts both the backend (port 8080) and frontend (port 5173) servers.

Open your browser to: **http://localhost:5173**

### Stop Brian

```bash
./stop.sh
```

## 📖 Usage

### Adding Knowledge Items

**Via Web UI:**
1. Open http://localhost:5173
2. Click the "+" button
3. Choose item type (link, note, snippet, paper)
4. Fill in the details and add tags
5. Save!

**Via Goose:**
```
You: Add this link to Brian: https://example.com with tags "ai, research"
Goose: ✓ Added to your knowledge base!
```

### Searching

**Via Web UI:**
- Use the search bar at the top
- Results show both exact matches and similar items

**Via Goose:**
```
You: Search Brian for "machine learning"
Goose: Found 5 items related to machine learning...
```

### Graph Visualization

The graph view shows connections between items based on content similarity:

- **Node Colors**: Blue (links), Green (notes), Amber (snippets), Purple (papers)
- **Line Thickness**: Indicates similarity strength
- **Theme Highlighting**: Hover over tags to see themed connections
- **Node Details**: Click any node to see full details in a bottom sheet
- **Zoom & Pan**: Scroll to zoom, drag to pan
- **Drag Nodes**: Reposition nodes by dragging

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Database location
BRIAN_DB_PATH=~/.brian/brian.db

# API server
BRIAN_HOST=127.0.0.1
BRIAN_PORT=8080
BRIAN_DEBUG=false
```

### Goose Integration

The setup script automatically configures Goose. The configuration is added to `~/.config/goose/config.yaml`:

```yaml
extensions:
  brian:
    provider: mcp
    config:
      command: "/path/to/brian/venv/bin/python"
      args:
        - "-m"
        - "brian_mcp.server"
      env:
        BRIAN_DB_PATH: "~/.brian/brian.db"
```

**After setup, restart Goose to load the Brian extension.**

## 🛠️ Development

### Manual Setup

If you prefer manual installation:

```bash
# Backend setup
python3 -m venv venv
source venv/bin/activate
pip install -e .

# Frontend setup
cd frontend
npm install

# Start backend
python -m brian.main

# Start frontend (in another terminal)
cd frontend
npm run dev
```

### Project Structure

```
brian/
├── brian/              # Backend Python package
│   ├── api/           # FastAPI routes
│   ├── database/      # SQLite database layer
│   ├── models/        # Data models
│   └── services/      # Business logic (similarity, search)
├── brian_mcp/         # MCP server for Goose integration
├── frontend/          # React frontend
│   └── src/
│       ├── components/  # React components
│       └── lib/         # Utilities
├── setup.sh           # One-command installation
├── start.sh           # Start both servers
└── stop.sh            # Stop both servers
```

### Running Tests

```bash
# Activate virtual environment
source venv/bin/activate

# Run Python tests
pytest

# Test MCP server
python test_mcp_simple.py

# Test search functionality
python test_search_fix.py
```

## 🎨 UI Features

### Timeline View
- Chronological display of all items
- Grouped by date
- Theme lines connecting related items
- Smooth animations

### Graph View
- Force-directed layout
- Real-time similarity calculations
- Interactive node selection
- Theme-based filtering with drop shadows
- Bottom sheet for detailed view
- Pulsing animation on selected nodes

### Navigation
- Circular icon buttons matching modern UI patterns
- Smooth transitions between views
- Responsive design

## 🔌 Goose MCP Tools

When integrated with Goose, Brian provides these tools:

### `create_knowledge_item`
Add new items to your knowledge base.

```
Parameters:
- title: Item title
- content: Main content
- item_type: link, note, snippet, or paper
- url: Optional URL
- tags: Optional list of tags
```

### `search_knowledge`
Search your knowledge base with full-text and similarity search.

```
Parameters:
- query: Search query
- limit: Max results (default: 10)
```

### `find_similar_items`
Find items similar to a given item.

```
Parameters:
- item_id: UUID of the reference item
- limit: Max results (default: 5)
```

### `debug_item_connections`
Debug similarity connections for an item.

```
Parameters:
- item_id: UUID of the item to debug
```

## 📊 Similarity Algorithm

Brian uses a hybrid approach for finding connections:

1. **TF-IDF Vectorization**: Converts text to numerical vectors
2. **Cosine Similarity**: Measures angle between vectors
3. **Threshold Filtering**: Only shows connections above 0.15 similarity
4. **Global IDF Scores**: Pre-computed for all documents

This creates meaningful connections between related items without manual linking.

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 8080 is in use
lsof -i :8080

# Check logs
tail -f backend.log
```

### Frontend won't start
```bash
# Check if port 5173 is in use
lsof -i :5173

# Check logs
tail -f frontend.log

# Reinstall dependencies
cd frontend && npm install
```

### Goose doesn't see Brian extension
```bash
# Verify config
cat ~/.config/goose/config.yaml

# Check Python path is correct
which python  # Should be inside brian/venv/bin/

# Restart Goose
```

### Database issues
```bash
# Check database exists
ls -la ~/.brian/brian.db

# Reset database (WARNING: deletes all data)
rm ~/.brian/brian.db
# Restart backend to recreate
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Frontend powered by [React](https://react.dev/) and [Vite](https://vitejs.dev/)
- Graph visualization with [D3.js](https://d3js.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Goose integration via [MCP](https://modelcontextprotocol.io/)

## 📚 Documentation

- [Quick Start Guide](QUICKSTART.md)
- [Commands Reference](COMMANDS.md)
- [Google Drive Integration](GOOGLE_DRIVE_INTEGRATION.md)
- [Graph Visualization Guide](GRAPH_VISUALIZATION_EXPLAINED.md)
- [Theme Filtering](THEME_FILTERING.md)

---

**Made with 🧠 and ❤️**

*A play on "brain" - because your knowledge deserves a smart home.*
