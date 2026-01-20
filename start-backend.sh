#!/bin/bash

# Start Brian Backend
# This script activates the virtual environment and starts the backend server

cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run: python -m venv venv"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

echo ""
echo "🧠 Starting Brian Backend..."
echo ""
echo "Backend will be available at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo ""
echo "Start the frontend in another terminal:"
echo "  ./start-frontend.sh"
echo ""

python -m brian.main
