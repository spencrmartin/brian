#!/bin/bash

# Start Brian Frontend
# This script sets up and starts the frontend development server

cd "$(dirname "$0")/frontend"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    echo "VITE_API_BASE_URL=http://localhost:8000/api/v1" > .env
    echo "✅ .env file created"
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo ""
echo "🧠 Starting Brian Frontend..."
echo ""
echo "Make sure the backend is running in another terminal:"
echo "  cd /Users/spencermartin/brian"
echo "  source venv/bin/activate"
echo "  python -m brian.main"
echo ""
echo "Frontend will be available at: http://localhost:5173"
echo ""

npm run dev
