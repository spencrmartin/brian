# 🧠 Brian - Your Personal Knowledge Base

> *A play on "brain" - because your knowledge deserves a smart home. And yes, I can't spell it right either.*

**Brian** is an intelligent knowledge repository that combines vector-based similarity search, beautiful graph visualization, and seamless AI assistant integration. Organize your links, notes, code snippets, and research papers into a connected knowledge graph that evolves with you.

---

## ✨ **What Makes Brian Special**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   📚 Knowledge Items          🔗 Smart Connections          🎨 Visual Graph │
│   ─────────────────          ───────────────────          ───────────────   │
│   • Links                    • TF-IDF Similarity          • D3.js Powered  │
│   • Notes                    • Cosine Similarity          • Force-Directed │
│   • Code Snippets            • Automatic Linking          • Theme Filtering│
│   • Research Papers          • Project-Aware              • Hierarchical  │
│   • Google Docs              • Threshold-Based            • Zoom Levels   │
│                              • Global IDF Scores                        │
│                                                                             │
│   🗂️ Multi-Project           🤖 AI Integration            🌌 Knowledge     │
│   ─────────────────          ───────────────────          Universe        │
│   • Separate Spaces          • Goose MCP Server           • All Projects   │
│   • Custom Icons             • Natural Language           View            │
│   • Color Coding             • Context-Aware              • Project Hulls  │
│   • Easy Switching           • Region Profiles            • Semantic Zoom │
│                              • Smart Context                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 **Core Features**

### 📊 **Knowledge Graph Visualization**

```
                    ┌─────────────────────────────────────────────────────┐
                    │                    GRAPH VIEW                        │
                    │  ┌─────────┐    ┌─────────┐    ┌─────────┐          │
                    │  │  📄 Note │───▶│ 🔗 Link  │───▶│ 📝 Paper │          │
                    │  └─────────┘    └─────────┘    └─────────┘          │
                    │       ▲                  │               ▲            │
                    │       │                  ▼               │            │
                    │  ┌─────────┐    ┌─────────┐    ┌─────────┐          │
                    │  │ 💻 Code  │◀───│ 🏷️  Tag  │◀───│ 📊 Data  │          │
                    │  └─────────┘    └─────────┘    └─────────┘          │
                    │                                                     │
                    │  • Node Colors: Type-based (Blue=Links, Green=Notes)│
                    │  • Line Thickness: Similarity strength              │
                    │  • Hover Effects: Theme highlighting                │
                    │  • Click: Open detailed bottom sheet               │
                    └─────────────────────────────────────────────────────┘
```

**Hierarchical Zoom Levels:**
```
Universe View (Zoom < 0.3)       Project View (0.3 - 0.5)       Item View (> 0.5)
───────────────────────          ───────────────────────        ─────────────────
   [Project A]  [Project B]          ┌─────────────────┐          • Item 1
   •••••••••    •••••••••            │   Region 1     │          • Item 2
   ┌─────────┐  ┌─────────┐         │  ••  ••  ••    │          • Item 3
   │  Hull   │  │  Hull   │         └─────────────────┘    ┌─────────────┐
   └─────────┘  └─────────┘                              │  Connections │
                                                        └─────────────┘
```

### 🔍 **Smart Search System**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        SEARCH PIPELINE                                      │
│                                                                             │
│  Query Input     ┌─────────────┐    ┌─────────────┐    ┌─────────────┐   │
│  ─────────────▶  │ Full-Text   │───▶│ TF-IDF      │───▶│ Cosine      │   │
│                  │ Search (FTS5)│    │ Vectorization│    │ Similarity  │   │
│                  └─────────────┘    └─────────────┘    └─────────────┘   │
│                          │                  │                  │            │
│                          ▼                  ▼                  ▼            │
│                  ┌─────────────────────────────────────────────┐          │
│                  │           HYBRID RESULTS                     │          │
│                  │  ┌─────────────┐  ┌─────────────┐            │          │
│                  │  │ Exact Matches│  │ Similar Items│            │          │
│                  │  └─────────────┘  └─────────────┘            │          │
│                  │  ┌─────────────────────────────────────┐   │          │
│                  │  │         FILTERED BY:                 │   │          │
│                  │  │  • Type (link/note/snippet/paper)    │   │          │
│                  │  │  • Tags                               │   │          │
│                  │  │  • Project                            │   │          │
│                  │  └─────────────────────────────────────┘   │          │
│                  └─────────────────────────────────────────────┘          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 🗂️ **Multi-Project Architecture**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROJECT STRUCTURE                                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        ALL PROJECTS (Universe)                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │  🎨 Design  │  │  💻 Coding  │  │  📚 Research │  │  🏢 Work   │ │   │
│  │  │  Project    │  │  Project    │  │  Project    │  │  Project    │ │   │
│  │  │  (12 items) │  │  (45 items) │  │  (23 items) │  │  (8 items)  │ │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                          ▲          ▲          ▲          ▲                │
│                          │          │          │          │                │
│  ┌───────────────────────┴──────────┴──────────┴──────────┴────────────┐  │
│  │                                                                       │  │
│  │                    PROJECT SELECTOR (Top Center)                      │  │
│  │  ┌─────────────────────────────────────────────────────────────┐   │  │
│  │  │  🎨 Design  │  💻 Coding  │  📚 Research  │  🏢 Work  │  🌌 All    │   │  │
│  │  └─────────────────────────────────────────────────────────────┘   │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  Each Project Contains:                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • Knowledge Items (links, notes, snippets, papers)                  │   │
│  │  • Regions (visual groupings)                                          │   │
│  │  • Tags (for filtering)                                               │   │
│  │  • Custom icon and color                                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 🤖 **Goose AI Integration**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    GOOSE + BRIAN WORKFLOW                                   │
│                                                                             │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐          │
│  │   You       │         │   Goose     │         │   Brian     │          │
│  │             │         │             │         │             │          │
│  │ "Add this   │────────▶│ MCP Server  │────────▶│ create_     │          │
│  │ link to     │         │ (brian_mcp) │         │ knowledge_  │          │
│  │ Brian:      │         │             │         │ item()      │          │
│  │ https://... │         │             │         │             │          │
│  │ with tags   │         │             │         │ ✓ Added     │          │
│  │ ai, ml"     │         │             │         │             │          │
│  └─────────────┘         └─────────────┘         └─────────────┘          │
│                          │                                             │
│                          ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  Available MCP Tools:                                                │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │ Knowledge Mgmt  │  │   Search        │  │  Projects       │     │   │
│  │  │ • create_item   │  │ • search        │  │ • list          │     │   │
│  │  │ • update_item   │  │ • find_similar  │  │ • create        │     │   │
│  │  │ • delete_item   │  │ • get_details   │  │ • switch        │     │   │
│  │  │ • get_details   │  │                 │  │ • get_context   │     │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘     │   │
│  │                                                                       │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │   │
│  │  │ Regions         │  │  Connections    │  │  Context        │     │   │
│  │  │ • create        │  │ • create        │  │ • get_context   │     │   │
│  │  │ • list          │  │ • get           │  │ • suggest       │     │   │
│  │  │ • get_context   │  │ • update        │  │ • debug         │     │   │
│  │  └─────────────────┘  │ • delete        │  └─────────────────┘     │   │
│  │                        └─────────────────┘                          │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Quick Start**

### **Prerequisites**

| Requirement | Version | Download |
|-------------|---------|----------|
| Python | 3.8+ | [python.org](https://www.python.org/downloads/) |
| Node.js | 16+ | [nodejs.org](https://nodejs.org/) |
| pnpm | latest | `npm install -g pnpm` |
| Git | latest | [git-scm.com](https://git-scm.com/downloads) |
| Goose (optional) | latest | [github.com/block/goose](https://github.com/block/goose) |

### **One-Command Installation**

```bash
# Clone the repository
git clone https://github.com/spencrmartin/brian.git
cd brian

# Make setup script executable and run it
chmod +x setup.sh
./setup.sh
```

**What the setup script does:**
- ✅ Creates Python virtual environment
- ✅ Installs all Python dependencies
- ✅ Installs all frontend dependencies (pnpm)
- ✅ Creates `~/.brian/` data directory
- ✅ Configures Goose extension (if installed)
- ✅ Creates `start.sh` and `stop.sh` convenience scripts

### **Start Brian**

```bash
# Start both backend and frontend
./start.sh
```

**Servers:**
- Backend API: `http://localhost:8080`
- Frontend UI: `http://localhost:5173`

Open your browser to: **[http://localhost:5173](http://localhost:5173)**

### **Stop Brian**

```bash
./stop.sh
```

---

## 📖 **Usage Guide**

### **🎯 Adding Knowledge Items**

#### Via Web UI:
1. Open [http://localhost:5173](http://localhost:5173)
2. Click the **"+"** button in the top-right
3. Select item type: **Link, Note, Snippet, or Paper**
4. Fill in details:
   - **Title** (required)
   - **Content/URL** (depending on type)
   - **Tags** (comma-separated, e.g., `ai, research, important`)
   - **Project** (optional, defaults to current project)
5. Click **Save**

#### Via Goose:
```
You: Add this link to Brian: https://arxiv.org/abs/2405.12345 with tags "ai, research, paper"
Goose: ✓ Added "New AI Research Paper" to your knowledge base!

You: Create a note in Brian titled "My Ideas" with content "Explore transformer architectures" and tags "thoughts, architecture"
Goose: ✓ Created note "My Ideas" in project "Default"
```

### **🗂️ Managing Projects**

#### Create a Project:
1. Click the **Project Selector** (large pill at top center)
2. Click **"New Project"**
3. Enter:
   - **Name** (e.g., "Machine Learning")
   - **Description** (optional)
   - **Icon** (choose from 25+ Lucide icons)
   - **Color** (hex color picker)
4. Click **Create**

#### Switch Projects:
- Click the Project Selector
- Select a project from the dropdown
- Or select **"All Projects"** to see everything

#### Edit/Delete Projects:
- Hover over a project in the selector
- Click the **pencil icon** to edit
- Click the **trash icon** to delete (confirms before deleting)

### **🕸️ Exploring the Graph**

#### Navigation:
| Action | How To |
|--------|--------|
| Zoom In | Scroll up / Pinch in |
| Zoom Out | Scroll down / Pinch out |
| Pan | Click and drag |
| Select Node | Click on any node |
| View Details | Click on a node to open bottom sheet |
| Filter by Tag | Hover over a tag pill |

#### Understanding the Graph:
- **Nodes**: Represent knowledge items
  - 🔵 Blue = Link
  - 🟢 Green = Note
  - 🟡 Amber = Code Snippet
  - 🟣 Purple = Paper
- **Edges**: Connections between items
  - Thickness = Similarity strength (thicker = more similar)
  - Only shown for similarity > 0.15
- **Regions**: Visual boundaries around related items
  - Colored outlines grouping items
  - Created manually via Regions button

#### Hierarchical Zoom (Knowledge Universe):
| Zoom Level | Scale | What You See |
|------------|-------|--------------|
| Universe | < 0.3 | All projects as "galaxies" with hull boundaries |
| Projects | 0.3 - 0.5 | Knowledge regions within current project |
| Items | > 0.5 | Individual items with full labels and connections |

**Tip:** The zoom indicator in the bottom-left shows your current scale and semantic view.

### **🔍 Searching Your Knowledge**

#### Basic Search:
1. Type in the **search bar** at the top
2. Results appear instantly as you type
3. Shows both **exact matches** and **similar items**

#### Advanced Filters:
- **By Type**: Click type filters (Link, Note, Snippet, Paper)
- **By Tag**: Click on tag pills or use `tag:` prefix
- **By Project**: Use the Project Selector

#### Search Examples:
| Query | Result |
|-------|--------|
| `machine learning` | Items containing "machine learning" or similar concepts |
| `tag:ai` | All items with the "ai" tag |
| `type:paper` | Only research papers |
| `project:"ML Research"` | Only items in the "ML Research" project |

#### Via Goose:
```
You: Search Brian for "transformer attention"
Goose: Found 8 items:
  1. "Attention Is All You Need" (Paper) - 95% match
  2. "Transformer Architecture Notes" (Note) - 88% match
  ...

You: Find items similar to that paper about LLMs
Goose: Found 5 similar items...
```

### **🎨 Regions**

Regions help you organize related items visually in the graph.

#### Create a Region:
1. Click the **Regions** button in the toolbar
2. Click **"New Region"**
3. Enter:
   - **Name** (e.g., "Deep Learning")
   - **Description** (optional)
   - **Color** (hex color for the boundary)
4. Click **Create**

#### Add Items to a Region:
1. Select items in the graph (click to select, shift+click for multiple)
2. Click the **Regions** button
3. Select the region you want to add them to

#### Region Features:
- Visual boundaries appear in the graph
- Hover over region to see its name
- Items can belong to multiple regions
- Regions persist across project views

### **🔗 Explicit Connections**

While Brian automatically creates connections based on similarity, you can also create explicit connections between items.

#### Create a Connection:
1. Select two items in the graph
2. Right-click and select **"Connect Items"**
3. Or use the **Connections** button in the toolbar
4. Specify:
   - **Connection Type**: related, references, extracted_from, inspired_by, etc.
   - **Strength**: 0.0 to 1.0 (default: 1.0)
   - **Notes**: Optional description

#### Connection Types:
- `related` - General relationship
- `references` - One item references another
- `extracted_from` - Derived from source
- `inspired_by` - Creative influence
- `part_of` - Component relationship
- `requires` - Dependency
- `conflicts_with` - Opposing ideas

---

## 🔧 **Configuration**

### **Environment Variables**

Create a `.env` file in the project root:

```bash
# Database Configuration
BRIAN_DB_PATH=~/.brian/brian.db

# Backend API Server
BRIAN_HOST=127.0.0.1
BRIAN_PORT=8080
BRIAN_DEBUG=false

# Frontend Configuration
VITE_PORT=5173                    # Dev server port (auto-fallback if busy)
VITE_API_URL=http://127.0.0.1:8080 # Backend API URL for proxy
```

**Dynamic Port Configuration:**
- If `VITE_PORT` is already in use, the frontend will automatically try the next available port
- Useful when running multiple Brian instances

### **Goose Integration Configuration**

The setup script automatically configures Goose. Configuration is added to `~/.config/goose/config.yaml`:

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

---

## 🛠️ **Development**

### **Project Structure**

```
brian/
├── brian/                          # Backend Python Package
│   ├── __init__.py
│   ├── api/                        # FastAPI Routes
│   │   ├── __init__.py
│   │   ├── knowledge_items.py       # Knowledge item endpoints
│   │   ├── projects.py             # Project management endpoints
│   │   ├── regions.py              # Region endpoints
│   │   ├── connections.py          # Connection endpoints
│   │   ├── search.py               # Search endpoints
│   │   └── context.py              # Context endpoints
│   │
│   ├── database/                   # Database Layer
│   │   ├── __init__.py
│   │   ├── migrations.py           # Database migrations
│   │   ├── repository.py           # Data access layer
│   │   └── schema.py               # Database schema (SQLAlchemy)
│   │
│   ├── models/                     # Data Models
│   │   ├── __init__.py
│   │   ├── knowledge_item.py
│   │   ├── project.py
│   │   ├── region.py
│   │   └── connection.py
│   │
│   ├── services/                   # Business Logic
│   │   ├── __init__.py
│   │   ├── similarity.py           # TF-IDF & similarity calculations
│   │   ├── clustering.py           # Item clustering for regions
│   │   └── graph_builder.py        # Graph data construction
│   │
│   ├── skills/                     # AI Skills/Tools
│   │   └── knowledge_skills.py
│   │
│   ├── static/                     # Static files
│   ├── templates/                  # HTML templates
│   ├── config.py                   # Configuration management
│   └── main.py                     # Application entry point
│
├── brian_mcp/                      # MCP Server for Goose Integration
│   ├── __init__.py
│   ├── server.py                  # MCP server implementation
│   └── tools/                     # MCP tool definitions
│       ├── knowledge_tools.py
│       ├── project_tools.py
│       ├── region_tools.py
│       └── connection_tools.py
│
├── frontend/                       # React Frontend
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── components/            # React Components
│   │   │   ├── SimilarityGraph.jsx    # Main D3.js graph visualization
│   │   │   ├── ProjectSelector.jsx    # Project management UI
│   │   │   ├── ProjectPill.jsx        # Project indicator
│   │   │   ├── Timeline.jsx           # Chronological view
│   │   │   ├── InfinitePinboard.jsx   # Spatial canvas
│   │   │   ├── RegionEditDialog.jsx   # Region management
│   │   │   ├── Settings.jsx           # App settings
│   │   │   ├── KnowledgeItemForm.jsx  # Item creation/editing
│   │   │   └── ...
│   │   │
│   │   ├── contexts/              # React Contexts
│   │   │   └── SettingsContext.jsx
│   │   │
│   │   ├── store/                 # State Management (Zustand)
│   │   │   └── useStore.js
│   │   │
│   │   ├── lib/                   # Utilities
│   │   │   ├── api.js              # API client
│   │   │   ├── constants.js        # App constants
│   │   │   └── utils.js            # Helper functions
│   │   │
│   │   ├── hooks/                 # Custom Hooks
│   │   ├── styles/                # CSS/Styling
│   │   ├── App.jsx                # Main App Component
│   │   └── main.jsx               # Entry point
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── scripts/                       # Utility Scripts
│   ├── setup_goose.py
│   └── ...
│
├── .github/                       # GitHub Configuration
│   └── workflows/
│       └── ...
│
├── setup.sh                       # One-command installation
├── start.sh                       # Start both servers
├── stop.sh                        # Stop both servers
├── brian-backend-entry.py         # Backend entry for packaging
├── brian-backend.spec             # PyInstaller spec
├── pyproject.toml
├── requirements.txt
└── README.md
```

### **Manual Setup**

If you prefer manual installation:

```bash
# Backend setup
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -e .

# Frontend setup
cd frontend
pnpm install
cd ..

# Start backend (in one terminal)
python -m brian.main

# Start frontend (in another terminal)
cd frontend
pnpm dev
```

### **Running Tests**

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

---

## 🎨 **UI Features Deep Dive**

### **📱 Interface Overview**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  🔍 Search Bar          [Project Selector: 💻 Coding (45)]    🔧 Settings │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   📊        │  │   🕒        │  │   🗺️        │  │   📝        │        │
│  │  Graph      │  │  Timeline    │  │  Regions    │  │  Pinboard   │        │
│  │   View      │  │   View      │  │   View      │  │   View      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │                    MAIN CONTENT AREA                                 │   │
│  │                                                                     │   │
│  │  [Interactive Graph / Timeline / Pinboard content]                   │   │
│  │                                                                     │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Zoom: 1.0x  |  Semantic View: Items  |  🎨 Theme: Default    +  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### **🎯 View Modes**

| View | Description | Best For |
|------|-------------|----------|
| **Graph** | Force-directed network of connected items | Exploring relationships, finding connections |
| **Timeline** | Chronological display of all items | Seeing temporal patterns, recent additions |
| **Regions** | Items grouped by their regions | Focused exploration of specific topics |
| **Pinboard** | Free-form spatial canvas | Manual arrangement, presentations |

### **🎨 Visual Design**

- **Color Scheme**: Dark theme with accent colors
- **Typography**: Modern, readable fonts
- **Animations**: Smooth transitions (Framer Motion)
- **Icons**: Lucide icon set
- **Components**: shadcn/ui for consistent styling

---

## 📊 **Similarity Algorithm**

Brian uses a sophisticated hybrid approach to find connections between knowledge items:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SIMILARITY PIPELINE                                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 1: TEXT PREPROCESSING                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  • Tokenization (split into words)                            │   │   │
│  │  │  • Lowercasing                                                   │   │   │
│  │  │  • Stop word removal (optional)                                 │   │   │
│  │  │  • Stemming/Lemmatization (optional)                           │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 2: TF-IDF VECTORIZATION                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  For each document:                                              │   │   │
│  │  │    TF (Term Frequency) = count(word) / total_words            │   │   │
│  │  │    IDF (Inverse Document Frequency) = log(total_docs / count(doc with word)) │   │   │
│  │  │    TF-IDF = TF * IDF                                            │   │   │
│  │  │                                                                  │   │   │
│  │  │  Result: Each document → vector of TF-IDF scores               │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  Global IDF Scores: Pre-computed for all documents in the database │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 3: COSINE SIMILARITY                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  For each pair of documents:                                     │   │   │
│  │  │    similarity = (A · B) / (||A|| * ||B||)                       │   │   │
│  │  │    where A, B are TF-IDF vectors                                 │   │   │
│  │  │    Result: Value between 0 (no similarity) and 1 (identical)  │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 4: THRESHOLD FILTERING                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  • Default threshold: 0.15                                      │   │   │
│  │  │  • Only connections with similarity ≥ threshold are shown      │   │   │
│  │  │  • Configurable per project or globally                         │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                               │
│                              ▼                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  STEP 5: PROJECT-AWARE FILTERING (optional)                         │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │  • Filter connections by current project                       │   │   │
│  │  │  • Or show all connections across all projects                 │   │   │
│  │  │  • "All Projects" view shows cross-project connections         │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Performance Optimizations:**
- Global IDF scores cached and updated incrementally
- Similarity calculations lazy-loaded on demand
- Graph updates debounced for smooth interactions
- Web Workers for heavy computations in the frontend

---

## 🐛 **Troubleshooting**

### **Common Issues & Solutions**

| Issue | Cause | Solution |
|-------|-------|----------|
| Backend won't start | Port 8080 in use | `lsof -i :8080` then `kill -9 PID` |
| Frontend won't start | Port 5173 in use | `lsof -i :5173` then `kill -9 PID` |
| Goose doesn't see Brian | Config not loaded | Restart Goose, check `~/.config/goose/config.yaml` |
| Database errors | Corrupted DB | Backup then `rm ~/.brian/brian.db`, restart |
| Graph not loading | Similarity calculation stuck | Restart backend, check logs |
| No connections shown | Threshold too high | Lower threshold in settings or add more items |

### **Debug Commands**

```bash
# Check backend logs
tail -f backend.log

# Check frontend logs
tail -f frontend.log

# Verify database exists
ls -la ~/.brian/brian.db

# Check Goose config
cat ~/.config/goose/config.yaml

# Check Python environment
which python
python --version

# Check Node.js environment
node --version
pnpm --version

# Test API endpoints
curl http://localhost:8080/api/knowledge-items
curl http://localhost:8080/api/projects
```

### **Reset Everything**

```bash
# Stop Brian
./stop.sh

# Remove database (WARNING: deletes all data)
rm -rf ~/.brian/

# Remove virtual environment
rm -rf venv/

# Remove frontend dependencies
rm -rf frontend/node_modules/

# Reinstall from scratch
./setup.sh
```

---

## 🤝 **Contributing**

We welcome contributions! Here's how to help:

### **Getting Started**

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Commit** your changes: `git commit -m 'Add amazing feature'`
5. **Push** to the branch: `git push origin feature/amazing-feature`
6. **Open** a Pull Request

### **Contribution Guidelines**

- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation as needed
- Keep commits atomic and well-described
- Reference any related issues in PR description

### **Good First Issues**

Check the [GitHub Issues](https://github.com/spencrmartin/brian/issues) for:
- `good first issue` - Beginner-friendly tasks
- `help wanted` - Tasks needing community help
- `enhancement` - Feature requests
- `bug` - Bug reports

---

## 📚 **Documentation**

| Guide | Description |
|-------|-------------|
| [INSTALL.md](INSTALL.md) | Detailed installation guide |
| [QUICKSTART.md](QUICKSTART.md) | Quick start tutorial |
| [COMMANDS.md](COMMANDS.md) | CLI and Goose commands reference |
| [GOOGLE_DRIVE_INTEGRATION.md](GOOGLE_DRIVE_INTEGRATION.md) | Google Docs integration |
| [GRAPH_VISUALIZATION_EXPLAINED.md](GRAPH_VISUALIZATION_EXPLAINED.md) | Deep dive into graph features |
| [THEME_FILTERING.md](THEME_FILTERING.md) | How theme filtering works |

---

## 🗺️ **Roadmap**

### **✅ Recently Completed**

- Multi-project knowledge bases with custom icons and colors
- Project selector with visual indicators
- Hierarchical zoom (Knowledge Universe) with semantic rendering
- Project hulls and boundaries in All Projects view
- Dynamic port configuration for frontend and backend
- Automatic project assignment for new regions
- Fixed Universe Mode initial load issues
- Fixed region persistence across project views
- Improved graph performance with lazy loading

### **🔜 Coming Soon**

| Feature | Status | ETA |
|---------|--------|-----|
| Zoom slider control | In Progress | Q2 2025 |
| Preset zoom buttons (All/Project/Items) | Planned | Q2 2025 |
| Breadcrumb navigation | Planned | Q2 2025 |
| Keyboard shortcuts for navigation | Planned | Q2 2025 |
| Image upload with LLM interpretation | Planned | Q3 2025 |
| Standardized card components | Planned | Q2 2025 |
| Mobile-responsive design | Planned | Q3 2025 |
| Collaborative knowledge bases | Research | Q4 2025 |
| Plugin system for custom item types | Research | Q4 2025 |

### **💡 Future Ideas**

- Markdown support for notes
- LaTeX rendering for papers
- Code syntax highlighting for snippets
- Export/import knowledge bases
- Backup and restore functionality
- OCR for image-based knowledge items
- Audio/video note support
- Version history for items
- Collaborative editing
- Public sharing of knowledge bases
- API for third-party integrations

---

## 📜 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

Brian is built with these amazing technologies:

### **Backend**
- [FastAPI](https://fastapi.tiangolo.com/) - Modern, fast web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) - Database ORM
- [SQLite](https://www.sqlite.org/) - Embedded database
- [scikit-learn](https://scikit-learn.org/) - TF-IDF and similarity calculations
- [numpy](https://numpy.org/) - Numerical computations

### **Frontend**
- [React](https://react.dev/) - UI library
- [Vite](https://vitejs.dev/) - Build tool and dev server
- [D3.js](https://d3js.org/) - Graph visualization
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Lucide](https://lucide.dev/) - Icons
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Tailwind CSS](https://tailwindcss.com/) - Styling

### **AI Integration**
- [Goose](https://github.com/block/goose) - AI assistant
- [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) - Standard for AI tool integration

### **Development**
- [pnpm](https://pnpm.io/) - Fast package manager
- [PyInstaller](https://www.pyinstaller.org/) - Python packaging
- [pytest](https://docs.pytest.org/) - Testing framework

---

## 💬 **Community**

- **GitHub**: [spencrmartin/brian](https://github.com/spencrmartin/brian)
- **Issues**: [Report a bug](https://github.com/spencrmartin/brian/issues)
- **Discussions**: [Join the conversation](https://github.com/spencrmartin/brian/discussions)

---

**Made with 🧠 and ❤️**

*Because your knowledge deserves a smart home. And yes, it's "Brian" not "Brain" - deal with it.* 😉
