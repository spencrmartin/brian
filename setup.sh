#!/bin/bash

# Brian - Complete Setup Script
# This script installs Brian and configures it as a Goose extension

set -e  # Exit on error

echo "🧠 Brian - Your Personal Knowledge Base"
echo "========================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if Python 3 is installed
echo -e "${BLUE}Checking Python installation...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    echo "Please install Python 3.8 or higher from https://www.python.org/"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo -e "${GREEN}✓ Found Python $PYTHON_VERSION${NC}"
echo ""

# Check if Node.js is installed
echo -e "${BLUE}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Found Node.js $NODE_VERSION${NC}"
echo ""

# Check if pnpm is installed
echo -e "${BLUE}Checking pnpm installation...${NC}"
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}Error: pnpm is not installed${NC}"
    echo "Please install pnpm: npm install -g pnpm"
    echo "Or visit: https://pnpm.io/installation"
    exit 1
fi

PNPM_VERSION=$(pnpm --version)
echo -e "${GREEN}✓ Found pnpm $PNPM_VERSION${NC}"
echo ""

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo -e "${BLUE}Creating Python virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${YELLOW}Virtual environment already exists${NC}"
fi
echo ""

# Activate virtual environment
echo -e "${BLUE}Activating virtual environment...${NC}"
source venv/bin/activate
echo -e "${GREEN}✓ Virtual environment activated${NC}"
echo ""

# Clear pip cache and upgrade build tools
echo -e "${BLUE}Preparing Python environment...${NC}"
python -m pip cache purge > /dev/null 2>&1 || true
python -m pip install --no-cache-dir --upgrade pip setuptools wheel --quiet
echo -e "${GREEN}✓ Python environment ready${NC}"
echo ""

# Install Python dependencies
echo -e "${BLUE}Installing Python dependencies...${NC}"
if [ -f "requirements.txt" ]; then
    pip install --no-cache-dir -r requirements.txt --quiet
    echo -e "${GREEN}✓ Python dependencies installed${NC}"
else
    echo -e "${RED}Error: requirements.txt not found${NC}"
    exit 1
fi
echo ""

# Install brian package in development mode
echo -e "${BLUE}Installing Brian package...${NC}"
pip install --no-cache-dir -e . --quiet
echo -e "${GREEN}✓ Brian package installed${NC}"
echo ""

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
echo -e "${YELLOW}  (This may take 1-2 minutes - downloading React, Vite, D3.js, etc.)${NC}"
echo ""

cd frontend
if [ -f "package.json" ]; then
    # Clean install to avoid corruption issues
    rm -rf node_modules yarn.lock package-lock.json 2>/dev/null || true
    
    echo -e "${YELLOW}  Installing with pnpm...${NC}"
    pnpm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error: Failed to install frontend dependencies${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}Error: frontend/package.json not found${NC}"
    exit 1
fi
cd ..
echo ""

# Create .brian directory if it doesn't exist
BRIAN_DIR="$HOME/.brian"
if [ ! -d "$BRIAN_DIR" ]; then
    echo -e "${BLUE}Creating Brian data directory...${NC}"
    mkdir -p "$BRIAN_DIR"
    echo -e "${GREEN}✓ Created $BRIAN_DIR${NC}"
else
    echo -e "${YELLOW}Brian data directory already exists${NC}"
fi
echo ""

# Configure Goose extension
GOOSE_CONFIG="$HOME/.config/goose/config.yaml"
GOOSE_CONFIG_DIR="$HOME/.config/goose"

echo -e "${BLUE}Configuring Goose extension...${NC}"

# Create goose config directory if it doesn't exist
if [ ! -d "$GOOSE_CONFIG_DIR" ]; then
    mkdir -p "$GOOSE_CONFIG_DIR"
fi

# Check if brian extension already exists in config
if [ -f "$GOOSE_CONFIG" ] && grep -q "^  brian:" "$GOOSE_CONFIG"; then
    echo -e "${YELLOW}Brian extension already exists in Goose config${NC}"
    echo -e "${YELLOW}Updating configuration...${NC}"
    # Remove existing brian config (from "  brian:" to next extension or end of extensions block)
    sed -i.tmp '/^  brian:/,/^  [a-z]/{ /^  brian:/d; /^    /d; }' "$GOOSE_CONFIG"
    rm -f "$GOOSE_CONFIG.tmp"
fi

# Add brian extension to Goose config
if [ -f "$GOOSE_CONFIG" ] && grep -q "^extensions:" "$GOOSE_CONFIG"; then
    # Insert brian after "extensions:" line
    sed -i.tmp '/^extensions:/a\
  brian:\
    enabled: true\
    type: stdio\
    name: Brian\
    description: Personal knowledge base with semantic search\
    cmd: '"$SCRIPT_DIR"'/venv/bin/python\
    args:\
      - -m\
      - brian_mcp.server\
    envs:\
      BRIAN_DB_PATH: '"$BRIAN_DIR"'/brian.db\
    env_keys: []\
    timeout: 300\
    bundled: null\
    available_tools: []
' "$GOOSE_CONFIG"
    rm -f "$GOOSE_CONFIG.tmp"
    echo -e "${GREEN}✓ Brian extension added to Goose config${NC}"
else
    # Create new config file with brian extension
    cat > "$GOOSE_CONFIG" << EOF
extensions:
  brian:
    enabled: true
    type: stdio
    name: Brian
    description: Personal knowledge base with semantic search
    cmd: $SCRIPT_DIR/venv/bin/python
    args:
      - -m
      - brian_mcp.server
    envs:
      BRIAN_DB_PATH: $BRIAN_DIR/brian.db
    env_keys: []
    timeout: 300
    bundled: null
    available_tools: []
EOF
    echo -e "${GREEN}✓ Created Goose config with Brian extension${NC}"
fi
echo ""

# Create a startup script
echo -e "${BLUE}Creating startup script...${NC}"
cat > start.sh << 'EOF'
#!/bin/bash

# Brian - Startup Script
# Starts both backend and frontend servers

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🧠 Starting Brian...${NC}"
echo ""

# Find pnpm (check common locations)
PNPM_CMD=$(command -v pnpm 2>/dev/null || echo "/opt/homebrew/bin/pnpm")
if [ ! -x "$PNPM_CMD" ] && [ ! -f "$PNPM_CMD" ]; then
    # Try to find it in other common locations
    for path in /usr/local/bin/pnpm ~/.npm-global/bin/pnpm; do
        if [ -x "$path" ]; then
            PNPM_CMD="$path"
            break
        fi
    done
fi

if [ ! -x "$PNPM_CMD" ] && [ ! -f "$PNPM_CMD" ]; then
    echo -e "${RED}Error: pnpm not found${NC}"
    echo "Please install pnpm: npm install -g pnpm"
    exit 1
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ] || [ ! -f "frontend/node_modules/.bin/vite" ]; then
    echo -e "${YELLOW}Frontend dependencies missing or corrupted. Installing...${NC}"
    cd frontend
    rm -rf node_modules pnpm-lock.yaml 2>/dev/null
    
    "$PNPM_CMD" install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install frontend dependencies${NC}"
        exit 1
    fi
    cd ..
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    echo ""
fi

# Activate virtual environment
source venv/bin/activate

# Start backend in background
echo -e "${BLUE}Starting backend server...${NC}"
python -m brian.main > backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Wait a moment for backend to start
sleep 2

# Start frontend in background
echo -e "${BLUE}Starting frontend server...${NC}"
cd frontend
"$PNPM_CMD" run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

# Wait for frontend to start and detect the actual port
echo -e "${BLUE}Detecting frontend port...${NC}"
FRONTEND_PORT=""
for i in {1..15}; do
    sleep 1
    # Try multiple methods to detect the port
    if [ -f "frontend.log" ]; then
        # Method 1: Look for "Local: http://localhost:PORT" in log
        FRONTEND_PORT=$(grep -oE "Local:.*http://localhost:[0-9]+" frontend.log 2>/dev/null | tail -1 | grep -oE "[0-9]+$")
        
        # Method 2: Look for just "http://localhost:PORT" if method 1 fails
        if [ -z "$FRONTEND_PORT" ]; then
            FRONTEND_PORT=$(grep -oE "http://localhost:[0-9]+" frontend.log 2>/dev/null | tail -1 | grep -oE "[0-9]+$")
        fi
        
        if [ -n "$FRONTEND_PORT" ]; then
            break
        fi
    fi
    
    # Method 3: Check what port the process is actually listening on
    if [ -z "$FRONTEND_PORT" ]; then
        FRONTEND_PORT=$(lsof -Pan -p "$FRONTEND_PID" -i 2>/dev/null | grep LISTEN | grep -oE ":[0-9]+" | head -1 | tr -d ':')
    fi
    
    if [ -n "$FRONTEND_PORT" ]; then
        break
    fi
done

echo ""
echo -e "${GREEN}✨ Brian is running!${NC}"
echo ""
echo "  Backend:  http://localhost:8080"
if [ -n "$FRONTEND_PORT" ]; then
    echo -e "  Frontend: ${GREEN}http://localhost:$FRONTEND_PORT${NC}"
else
    echo "  Frontend: http://localhost:5173 (detecting...)"
    echo -e "            ${YELLOW}Check 'tail -f frontend.log' for actual port${NC}"
fi
echo ""
echo "  Backend logs:  tail -f backend.log"
echo "  Frontend logs: tail -f frontend.log"
echo ""
echo "To stop Brian, run: ./stop.sh"
echo ""

# Save PIDs for stop script
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid
EOF

chmod +x start.sh
echo -e "${GREEN}✓ Created start.sh${NC}"
echo ""

# Create a stop script
echo -e "${BLUE}Creating stop script...${NC}"
cat > stop.sh << 'EOF'
#!/bin/bash

# Brian - Stop Script
# Stops both backend and frontend servers (including all child processes)

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Kill a process and all its descendants (process tree).
# Needed because pnpm run dev spawns child processes (node/vite, esbuild)
# that survive when only the pnpm parent is killed.
kill_tree() {
    local pid=$1
    [ -z "$pid" ] && return
    # Kill children first (recursive)
    for child in $(ps -o pid= --ppid "$pid" 2>/dev/null); do
        [ -n "$child" ] && kill_tree "$child"
    done
    # Kill the process itself
    kill "$pid" 2>/dev/null
}

echo -e "${BLUE}Stopping Brian...${NC}"
echo ""

# Stop backend
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${BLUE}Stopping backend (PID: $BACKEND_PID)...${NC}"
        kill_tree $BACKEND_PID
        echo -e "${GREEN}✓ Backend stopped${NC}"
    else
        echo -e "${RED}Backend process not found${NC}"
    fi
    rm .backend.pid
else
    echo -e "${RED}No backend PID file found${NC}"
fi

# Stop frontend
if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${BLUE}Stopping frontend (PID: $FRONTEND_PID)...${NC}"
        kill_tree $FRONTEND_PID
        echo -e "${GREEN}✓ Frontend stopped${NC}"
    else
        echo -e "${RED}Frontend process not found${NC}"
    fi
    rm .frontend.pid
else
    echo -e "${RED}No frontend PID file found${NC}"
fi

echo ""
echo -e "${GREEN}Brian stopped${NC}"
EOF

chmod +x stop.sh
echo -e "${GREEN}✓ Created stop.sh${NC}"
echo ""

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}What was installed:${NC}"
echo "  ✓ Python dependencies (FastAPI, uvicorn, etc.)"
echo "  ✓ Frontend dependencies (React, Vite, etc.)"
echo "  ✓ Brian data directory: $BRIAN_DIR"
echo "  ✓ Goose extension configured"
echo ""
echo -e "${BLUE}Quick Start:${NC}"
echo ""
echo -e "  ${YELLOW}1. Start Brian:${NC}"
echo "     ./start.sh"
echo ""
echo -e "  ${YELLOW}2. Open in browser:${NC}"
echo "     http://localhost:5173"
echo ""
echo -e "  ${YELLOW}3. Use with Goose:${NC}"
echo "     Restart Goose Desktop to load the Brian extension."
echo ""
echo -e "  ${YELLOW}4. Stop Brian:${NC}"
echo "     ./stop.sh"
echo ""
echo -e "${BLUE}Data:${NC}"
echo "  Database: $BRIAN_DIR/brian.db"
echo ""
echo -e "${GREEN}Happy knowledge mapping! 🧠✨${NC}"
echo ""
