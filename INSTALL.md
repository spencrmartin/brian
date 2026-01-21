# 🚀 Brian Installation Guide

Get Brian up and running in under 5 minutes!

## Prerequisites

Before you begin, make sure you have:

- ✅ **Python 3.8 or higher** - [Download here](https://www.python.org/downloads/)
- ✅ **Node.js 16 or higher** - [Download here](https://nodejs.org/)
- ✅ **pnpm** - [Install here](https://pnpm.io/installation) or run `npm install -g pnpm`
- ✅ **Git** - [Download here](https://git-scm.com/downloads)

### Check Your Versions

```bash
python3 --version  # Should be 3.8+
node --version     # Should be 16+
pnpm --version     # Install with: npm install -g pnpm
```

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/brian.git
cd brian
```

### Step 2: Run the Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

**That's it!** The setup script will:
- Install all Python dependencies in a virtual environment
- Install all frontend dependencies
- Create the Brian data directory at `~/.brian/`
- Configure the Goose extension (if you have Goose installed)
- Create convenient `start.sh` and `stop.sh` scripts

The installation takes about 2-3 minutes depending on your internet speed.

### Step 3: Start Brian

```bash
./start.sh
```

This starts both servers:
- **Backend**: http://localhost:8080
- **Frontend**: http://localhost:5173

### Step 4: Open in Browser

Navigate to: **http://localhost:5173**

You should see the Brian interface! 🎉

## Using with Goose

If you have Goose installed, Brian is automatically configured as an extension.

### Restart Goose

After installation, restart Goose to load the Brian extension:

```bash
# If Goose is running, restart it
# The brian extension will now be available
```

### Verify in Goose

```
You: List my extensions
Goose: Available extensions:
  - brian ✓
  - ...
```

### Use Brian from Goose

```
You: Add this link to Brian: https://example.com with tags "ai, research"
Goose: ✓ Added to your knowledge base!

You: Search Brian for "machine learning"
Goose: Found 5 items related to machine learning...
```

## Stopping Brian

When you're done:

```bash
./stop.sh
```

This stops both the backend and frontend servers.

## Next Steps

- 📖 Read the [Quick Start Guide](QUICKSTART.md) to learn the basics
- 🎨 Explore the [Graph Visualization](GRAPH_VISUALIZATION_EXPLAINED.md)
- 🔍 Learn about [Theme Filtering](THEME_FILTERING.md)
- 📚 Check out [Commands Reference](COMMANDS.md)

## Troubleshooting

### "Command not found: python3"

**Solution**: Install Python 3 from [python.org](https://www.python.org/downloads/)

### "Command not found: node"

**Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)

### Port 8080 or 5173 already in use

**Solution**: Stop the process using that port:

```bash
# Find process on port 8080
lsof -i :8080

# Kill it (replace PID with actual process ID)
kill -9 PID
```

### Setup script fails

**Solution**: Try manual installation:

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -e .

# Install frontend dependencies
cd frontend
pnpm install
cd ..

# Start manually
python -m brian.main &
cd frontend && pnpm dev &
```

### Goose doesn't see Brian

**Solution**: Check your Goose config:

```bash
# View config
cat ~/.config/goose/config.yaml

# Look for the brian extension entry
# If missing, run setup.sh again
```

### Database errors

**Solution**: Reset the database:

```bash
# Backup first (if you have data)
cp ~/.brian/brian.db ~/.brian/brian.db.backup

# Remove database
rm ~/.brian/brian.db

# Restart backend - it will recreate the database
./stop.sh
./start.sh
```

## Need Help?

- 📖 Check the [README](README.md) for detailed documentation
- 🐛 [Open an issue](https://github.com/yourusername/brian/issues) on GitHub
- 💬 Join our community discussions

---

**Happy knowledge mapping! 🧠✨**
