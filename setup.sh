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
echo -e "${YELLOW}  (This may take 2-3 minutes - downloading React, Vite, D3.js, etc.)${NC}"
cd frontend
if [ -f "package.json" ]; then
    # Clean install to avoid corruption issues
    rm -rf node_modules package-lock.json 2>/dev/null || true
    npm install
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
    echo -e "${YELLOW}Creating Goose config directory...${NC}"
    mkdir -p "$GOOSE_CONFIG_DIR"
fi

# Backup existing config if it exists
if [ -f "$GOOSE_CONFIG" ]; then
    BACKUP_FILE="$GOOSE_CONFIG.backup-$(date +%Y%m%d-%H%M%S)"
    echo -e "${YELLOW}Backing up existing Goose config to:${NC}"
    echo "  $BACKUP_FILE"
    cp "$GOOSE_CONFIG" "$BACKUP_FILE"
fi

# Check if brian extension already exists in config
if [ -f "$GOOSE_CONFIG" ] && grep -q "brian:" "$GOOSE_CONFIG"; then
    echo -e "${YELLOW}Brian extension already configured in Goose${NC}"
else
    # Add brian extension to Goose config
    echo -e "${BLUE}Adding Brian to Goose extensions...${NC}"
    
    # Create or append to config
    if [ ! -f "$GOOSE_CONFIG" ]; then
        # Create new config with brian extension
        cat > "$GOOSE_CONFIG" << EOF
extensions:
  brian:
    provider: mcp
    config:
      command: "$SCRIPT_DIR/venv/bin/python"
      args:
        - "-m"
        - "brian_mcp.server"
      env:
        BRIAN_DB_PATH: "$BRIAN_DIR/brian.db"
EOF
    else
        # Append brian extension to existing config
        # Check if extensions section exists
        if grep -q "^extensions:" "$GOOSE_CONFIG"; then
            # Add brian under existing extensions
            sed -i.tmp '/^extensions:/a\
  brian:\
    provider: mcp\
    config:\
      command: "'$SCRIPT_DIR'/venv/bin/python"\
      args:\
        - "-m"\
        - "brian_mcp.server"\
      env:\
        BRIAN_DB_PATH: "'$BRIAN_DIR'/brian.db"
' "$GOOSE_CONFIG"
            rm -f "$GOOSE_CONFIG.tmp"
        else
            # Add extensions section with brian
            cat >> "$GOOSE_CONFIG" << EOF

extensions:
  brian:
    provider: mcp
    config:
      command: "$SCRIPT_DIR/venv/bin/python"
      args:
        - "-m"
        - "brian_mcp.server"
      env:
        BRIAN_DB_PATH: "$BRIAN_DIR/brian.db"
EOF
        fi
    fi
    
    echo -e "${GREEN}✓ Brian extension added to Goose config${NC}"
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

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ] || [ ! -f "frontend/node_modules/.bin/vite" ]; then
    echo -e "${YELLOW}Frontend dependencies missing or corrupted. Installing...${NC}"
    cd frontend
    rm -rf node_modules package-lock.json 2>/dev/null
    npm install
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
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}✨ Brian is running!${NC}"
echo ""
echo "  Backend:  http://localhost:8080"
echo "  Frontend: http://localhost:5173"
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
# Stops both backend and frontend servers

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}Stopping Brian...${NC}"
echo ""

# Stop backend
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${BLUE}Stopping backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID
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
        kill $FRONTEND_PID
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
echo "     The 'brian' extension is now available in Goose!"
echo "     Restart Goose to load the extension."
echo ""
echo -e "  ${YELLOW}4. Stop Brian:${NC}"
echo "     ./stop.sh"
echo ""
echo -e "${BLUE}Configuration:${NC}"
echo "  Goose config: $GOOSE_CONFIG"
echo "  Database:     $BRIAN_DIR/brian.db"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "  README.md           - Project overview"
echo "  QUICKSTART.md       - Quick start guide"
echo "  COMMANDS.md         - Available commands"
echo ""
echo -e "${GREEN}Happy knowledge mapping! 🧠✨${NC}"
echo ""
