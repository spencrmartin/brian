#!/usr/bin/env python3
"""
PyInstaller entry point for brian-backend sidecar.

This wrapper exists because brian/main.py uses relative imports
(from .config import Config, etc.) which fail when PyInstaller
runs the script directly as __main__.

This file imports brian.main as a proper package module,
preserving the relative import chain.

Supports two modes:
  brian-backend          → Start the FastAPI HTTP backend (default)
  brian-backend --mcp    → Start the MCP stdio server (for AI tool integration)
"""
import sys

if __name__ == "__main__":
    if "--mcp" in sys.argv:
        # MCP stdio server mode — used by Goose, Claude Desktop, Cursor, etc.
        import asyncio
        from brian_mcp.server import main as mcp_main
        asyncio.run(mcp_main())
    else:
        # Default: HTTP backend mode
        from brian.main import main
        main()
