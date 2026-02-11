# 🧠 Brian - Your Personal Knowledge Base

> A play on "brain" - Brian is your intelligent knowledge repository with vector-based similarity search, beautiful graph visualization, and seamless Goose integration. Because I cannot spell 9/10 times and I make this mistake all the time now you can too!
<img width="1628" height="905" alt="Screenshot 2026-02-04 at 12 35 14 PM" src="https://github.com/user-attachments/assets/d6d412a5-df62-4c93-a48c-b276c6fc1e04" />

<img width="1619" height="901" alt="Screenshot 2026-02-04 at 12 35 48 PM" src="https://github.com/user-attachments/assets/6b343f5d-95ca-4216-97cc-38539a25757d" />


## ✨ Features

### Core Knowledge Management
- **📚 Knowledge Items**: Store links, notes, code snippets, and papers
- **🔍 Smart Search**: Full-text search with FTS5 + TF-IDF vector similarity
- **🏷️ Tagging System**: Organize items with tags for easy filtering
- **🔗 Link Previews**: Automatic metadata extraction from URLs
- **📄 Google Docs Support**: Seamless integration with Google Drive documents

<img width="824" height="758" alt="Screenshot 2026-02-04 at 12 32 03 PM" src="https://github.com/user-attachments/assets/780881d8-84b3-43ef-8a84-2626302d8fbf" />


### Multi-Project Knowledge Bases
- **🗂️ Multiple Projects**: Organize knowledge into separate project spaces

<img width="341" height="468" alt="Screenshot 2026-02-04 at 12 31 45 PM" src="https://github.com/user-attachments/assets/398433a8-21ed-40f9-b280-198bb0be0da7" />


### Graph Visualization
- **🕸️ Force-Directed Graph**: Interactive D3.js visualization showing connections
- **🎨 Theme Highlighting**: Hover over tags to see themed connections with colored drop shadows
- **🔍 Semantic Zoom**: Smooth transitions between project, region, and item views
- **🌌 Knowledge Universe**: Zoom out to see all projects as "galaxies" in a unified space
- **📍 Knowledge Regions**: Group related items with visual boundaries

<img width="1631" height="907" alt="Screenshot 2026-02-04 at 12 31 10 PM" src="https://github.com/user-attachments/assets/334cb713-1881-4a50-af62-28128d1dc9c8" />

### Hierarchical Zoom (Knowledge Universe)
- **🔭 Multi-Scale View**: Seamlessly zoom from individual items to entire knowledge universe
- **🪐 Project Hulls**: Visual boundaries around project clusters when zoomed out
- **✨ Semantic Rendering**: Labels, nodes, and links adapt based on zoom level
- **📊 Zoom Indicator**: Real-time display of zoom level and current semantic view


### AI Integration
- **🤖 Goose Integration**: Use Brian directly from Goose AI assistant via MCP
- **🧭 Region Profiles**: Configure AI behavior per knowledge region
- **💡 Smart Context**: Get relevant knowledge context for any topic

<img width="609" height="779" alt="Screenshot 2026-02-04 at 12 32 30 PM" src="https://github.com/user-attachments/assets/f89a48bd-c61f-4b53-bb4b-347ed6d612d3" />


## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **pnpm** - [Install](https://pnpm.io/installation) (`npm install -g pnpm`)
- **Goose** (optional) - For AI assistant integration - https://github.com/block/goose 

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

### Managing Projects

**Creating a Project:**
1. Click the Project Selector at the top center
2. Click "New Project"
3. Enter name, description, choose an icon and color
4. Click Create

**Switching Projects:**
- Click the Project Selector and choose a project
- Select "All Projects" to view everything across all knowledge bases

**Editing Projects:**
- Hover over a project in the selector and click the edit (pencil) icon
- Change the name, description, icon, or color

### Graph Visualization

The graph view shows connections between items based on content similarity:

- **Node Colors**: Blue (links), Green (notes), Amber (snippets), Purple (papers)
- **Line Thickness**: Indicates similarity strength
- **Theme Highlighting**: Hover over tags to see themed connections
- **Node Details**: Click any node to see full details in a bottom sheet
- **Zoom & Pan**: Scroll to zoom, drag to pan
- **Drag Nodes**: Reposition nodes by dragging

### Knowledge Universe (Hierarchical Zoom)

When viewing "All Projects", you can explore your entire knowledge universe:

1. **Zoom Out** (scale < 0.3): See all projects as distinct clusters with hull boundaries
2. **Mid Zoom** (scale 0.3-0.5): See knowledge regions within projects
3. **Zoom In** (scale > 0.5): See individual items with full labels

The zoom indicator in the bottom-left shows your current zoom level and semantic view.

### Knowledge Regions

Regions help organize related items within a project:

1. Click the Regions button in the toolbar
2. Create a new region with a name and color
3. Add items to regions by selecting them in the graph
4. Regions appear as visual boundaries in the graph view

### Searching

**Via Web UI:**
- Use the search bar at the top
- Results show both exact matches and similar items
- Filter by type, tags, or project

**Via Goose:**
```
You: Search Brian for "machine learning"
Goose: Found 5 items related to machine learning...
```

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

# Frontend (optional)
VITE_PORT=5173           # Frontend dev server port (auto-fallback if busy)
VITE_API_URL=http://127.0.0.1:8080  # Backend API URL for proxy
```

**Dynamic Port Configuration:**
- If `VITE_PORT` is busy, the frontend will automatically use the next available port
- Useful when running multiple instances or when ports are occupied

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
pnpm install

# Start backend
python -m brian.main

# Start frontend (in another terminal)
cd frontend
pnpm dev
```

### Project Structure

```
brian/
├── brian/                  # Backend Python package
│   ├── api/               # FastAPI routes
│   ├── database/          # SQLite database layer
│   │   ├── migrations.py  # Database migrations
│   │   ├── repository.py  # Data access layer
│   │   └── schema.py      # Database schema
│   ├── models/            # Data models
│   │   └── knowledge_item.py
│   └── services/          # Business logic
│       ├── similarity.py  # Similarity calculations
│       └── clustering.py  # Item clustering
├── brian_mcp/             # MCP server for Goose integration
├── frontend/              # React frontend
│   └── src/
│       ├── components/    # React components
│       │   ├── SimilarityGraph.jsx    # Main graph visualization
│       │   ├── ProjectSelector.jsx    # Project management UI
│       │   ├── ProjectPill.jsx        # Project indicator component
│       │   ├── Timeline.jsx           # Chronological view
│       │   ├── InfinitePinboard.jsx   # Spatial canvas
│       │   ├── RegionEditDialog.jsx   # Region management
│       │   └── Settings.jsx           # App settings
│       ├── contexts/      # React contexts
│       │   └── SettingsContext.jsx
│       ├── store/         # State management
│       │   └── useStore.js  # Zustand store
│       └── lib/           # Utilities
├── setup.sh               # One-command installation
├── start.sh               # Start both servers
└── stop.sh                # Stop both servers
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

### Project Selector
- Large pill-shaped button at top center
- Shows current project with icon, name, and item count
- "All Projects" mode shows universe icon with total counts
- Dropdown with all projects, create new, and edit options
- 25+ Lucide icons to choose from

### Timeline View
- Chronological display of all items
- Grouped by date
- Project pills showing item origin
- Theme lines connecting related items
- Smooth animations

### Graph View
- Force-directed layout with D3.js
- Real-time similarity calculations
- Interactive node selection
- Theme-based filtering with drop shadows
- Bottom sheet for detailed view with project pills
- Pulsing animation on selected nodes
- **Hierarchical zoom** with semantic rendering
- **Project hulls** when viewing all projects
- **Zoom indicator** showing current level

### Navigation
- Circular icon buttons matching modern UI patterns
- Smooth transitions between views
- Responsive design
- Keyboard shortcuts (coming soon)

## 🔌 Goose MCP Tools

When integrated with Goose, Brian provides these tools:

### Knowledge Management

#### `create_knowledge_item`
Add new items to your knowledge base.
```
Parameters:
- title: Item title
- content: Main content
- item_type: link, note, snippet, or paper
- url: Optional URL
- tags: Optional list of tags
- project_id: Optional project to add to
```

#### `search_knowledge`
Search your knowledge base with full-text and similarity search.
```
Parameters:
- query: Search query
- limit: Max results (default: 10)
- project_id: Optional project filter
```

#### `find_similar_items`
Find items similar to a given item.
```
Parameters:
- item_id: UUID of the reference item
- limit: Max results (default: 5)
```

#### `get_item_details`
Get full details of a specific item.
```
Parameters:
- item_id: UUID of the item
```

#### `update_knowledge_item`
Update an existing knowledge item's content, tags, or other properties.
```
Parameters:
- item_id: UUID of the item to update
- title: Optional new title
- content: Optional new content
- tags: Optional new tags list
- url: Optional new URL
```

#### `delete_knowledge_item`
Delete a knowledge item from the database. This action cannot be undone.
```
Parameters:
- item_id: UUID of the item to delete
```

### Project Management

#### `list_projects`
List all knowledge base projects.

#### `create_project`
Create a new knowledge base project.
```
Parameters:
- name: Project name
- description: Optional description
- icon: Optional emoji icon
- color: Optional hex color
```

#### `switch_project`
Switch the default project for new items.
```
Parameters:
- project_id: UUID of the project
```

#### `get_project_context`
Get knowledge context from a specific project.
```
Parameters:
- project_id: Optional project ID
- query: Optional query to filter items
- limit: Max items (default: 20)
```

### Region Management

#### `list_regions`
List all knowledge regions.

#### `create_region`
Create a new knowledge region.
```
Parameters:
- name: Region name
- description: Optional description
- color: Optional hex color
- item_ids: Optional items to include
```

#### `get_region_context`
Get knowledge context from a specific region.
```
Parameters:
- region_id: UUID of the region
- query: Optional query to filter items
```

### Context & Intelligence

#### `get_knowledge_context`
Get relevant knowledge items for a topic.
```
Parameters:
- topic: Topic to get context for
- limit: Max items (default: 5)
```

#### `suggest_regions`
Suggest relevant regions for a query.
```
Parameters:
- query: Query to find relevant regions
- limit: Max regions (default: 3)
```

#### `debug_item_connections`
Debug similarity connections for an item.
```
Parameters:
- item_id: UUID of the item to debug
```

### Connection Management

Explicit connections between knowledge items for the graph and relationship tracking.

#### `create_connection`
Create an explicit connection between two items.
```
Parameters:
- source_item_id: UUID of the source item
- target_item_id: UUID of the target item
- connection_type: Optional - related, references, extracted_from, inspired_by, etc.
- strength: Optional - 0.0 to 1.0 (default: 1.0)
- notes: Optional notes about the connection
```

#### `get_item_connections`
Get all explicit connections for an item.
```
Parameters:
- item_id: UUID of the item
```

#### `update_connection`
Update an existing connection.
```
Parameters:
- connection_id: ID of the connection to update
- connection_type: Optional new type
- strength: Optional new strength 0.0-1.0
- notes: Optional new notes
```

#### `delete_connection`
Delete an explicit connection between items.
```
Parameters:
- connection_id: ID of the connection to delete
```

## 📊 Similarity Algorithm

Brian uses a hybrid approach for finding connections:

1. **TF-IDF Vectorization**: Converts text to numerical vectors
2. **Cosine Similarity**: Measures angle between vectors
3. **Threshold Filtering**: Only shows connections above 0.15 similarity
4. **Global IDF Scores**: Pre-computed for all documents
5. **Project-Aware**: Can filter connections by project

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
cd frontend && pnpm install
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

### Graph not showing project hulls
- Ensure you're in "All Projects" mode (click Project Selector → All Projects)
- Zoom out significantly (scale < 0.4) to see project boundaries
- Check that you have items in multiple projects

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
- Icons from [Lucide](https://lucide.dev/)
- State management with [Zustand](https://zustand-demo.pmnd.rs/)
- Animations with [Framer Motion](https://www.framer.com/motion/)
- Goose integration via [MCP](https://modelcontextprotocol.io/)

## 📚 Documentation

- [Quick Start Guide](QUICKSTART.md)
- [Commands Reference](COMMANDS.md)
- [Google Drive Integration](GOOGLE_DRIVE_INTEGRATION.md)
- [Graph Visualization Guide](GRAPH_VISUALIZATION_EXPLAINED.md)
- [Theme Filtering](THEME_FILTERING.md)

## 🗺️ Roadmap

### Recently Completed
- ✅ Multi-project knowledge bases
- ✅ Project selector with custom icons
- ✅ Hierarchical zoom (Knowledge Universe)
- ✅ Project hulls and semantic zoom
- ✅ All Projects view
- ✅ Project pills in Timeline and Graph
- ✅ Dynamic port configuration (VITE_PORT, VITE_API_URL env vars)
- ✅ Automatic project assignment for new regions
- ✅ Fixed Universe Mode initial load issues
- ✅ Fixed region persistence across project views

### Coming Soon
- 🔜 Zoom slider control
- 🔜 Preset zoom buttons (All / Project / Items)
- 🔜 Breadcrumb navigation
- 🔜 Keyboard shortcuts for navigation
- 🔜 Image upload with LLM interpretation
- 🔜 Standardized card components

---

**Made with 🧠 and ❤️**

*A play on "brain" - because your knowledge deserves a smart home.*
