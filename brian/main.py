"""
Main application entry point for brian
"""
import atexit
import signal
import sys

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from .config import Config, cleanup_port_file
from .database import Database
from .api import routes


def create_app(config: Config = None) -> FastAPI:
    """Create and configure the FastAPI application"""
    
    if config is None:
        config = Config()
    
    app = FastAPI(
        title=config.APP_NAME,
        description=config.APP_DESCRIPTION,
        version=config.APP_VERSION
    )
    
    # Store config on the app for access in endpoints
    app.state.config = config
    
    # Add CORS middleware for desktop app
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # For development - restrict in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Initialize database
    db = Database(config.DB_PATH)
    db.initialize()
    
    # Set database in routes module
    routes.db = db
    
    # Include API routes
    app.include_router(routes.router, prefix="/api/v1", tags=["api"])
    
    # Mount static files
    static_path = Path(__file__).parent / "static"
    if static_path.exists():
        app.mount("/static", StaticFiles(directory=str(static_path)), name="static")
    
    # Serve index.html for root
    templates_path = Path(__file__).parent / "templates"
    
    @app.get("/")
    async def root():
        """Serve the main application page"""
        index_file = templates_path / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
        return {"message": "brian is running! API available at /api/v1"}
    
    @app.get("/health")
    async def health():
        """Health check endpoint"""
        schema_version = None
        sqlite_version = None
        fts5 = None
        try:
            schema_version = db.get_schema_version()
            sqlite_version = db.get_sqlite_version()
            fts5 = db.fts5_available()
        except Exception:
            pass
        return {
            "status": "healthy",
            "app": config.APP_NAME,
            "version": config.APP_VERSION,
            "schema_version": schema_version,
            "sqlite_version": sqlite_version,
            "fts5_available": fts5,
            "port": config.API_PORT,
        }
    
    @app.get("/api/v1/config")
    async def get_config():
        """Return current configuration"""
        return config.to_dict()
    
    return app


def _repair_mcp_configs():
    """
    Startup self-heal: verify MCP tool configs point at a working sidecar
    binary and fix them if they don't.
    
    This catches the case where a previous (broken) onboarding wrote configs
    pointing at system Python instead of the bundled sidecar.  Runs every
    time the backend starts so stale configs are always repaired.
    """
    try:
        from .api.routes import _find_sidecar_binary
        
        sidecar = _find_sidecar_binary()
        if not sidecar:
            return  # Can't find sidecar — nothing to repair with
        
        brian_db = str(Path.home() / ".brian" / "brian.db")
        repaired = []
        
        # ── Goose ────────────────────────────────────────────────────────
        try:
            import yaml
            goose_config = Path.home() / ".config" / "goose" / "config.yaml"
            if goose_config.exists():
                with open(goose_config) as f:
                    cfg = yaml.safe_load(f) or {}
                brian_ext = cfg.get("extensions", {}).get("brian", {})
                cmd = brian_ext.get("cmd", "")
                args = brian_ext.get("args", [])
                # Repair if pointing at python instead of sidecar
                if cmd and "brian-backend" not in cmd and brian_ext.get("enabled"):
                    cfg["extensions"]["brian"].update({
                        "cmd": sidecar,
                        "args": ["--mcp"],
                        "envs": {"BRIAN_DB_PATH": brian_db},
                    })
                    with open(goose_config, "w") as f:
                        yaml.dump(cfg, f, default_flow_style=False, sort_keys=False)
                    repaired.append("goose")
        except Exception:
            pass
        
        # ── Claude Desktop ───────────────────────────────────────────────
        try:
            import json
            claude_config = Path.home() / "Library" / "Application Support" / "Claude" / "claude_desktop_config.json"
            if claude_config.exists():
                with open(claude_config) as f:
                    cfg = json.load(f)
                brian_srv = cfg.get("mcpServers", {}).get("brian", {})
                cmd = brian_srv.get("command", "")
                if cmd and "brian-backend" not in cmd:
                    cfg["mcpServers"]["brian"] = {
                        "command": sidecar,
                        "args": ["--mcp"],
                        "env": {"BRIAN_DB_PATH": brian_db},
                    }
                    with open(claude_config, "w") as f:
                        json.dump(cfg, f, indent=2)
                    repaired.append("claude")
        except Exception:
            pass
        
        # ── Cursor ───────────────────────────────────────────────────────
        try:
            import json
            cursor_config = Path.home() / ".cursor" / "mcp.json"
            if cursor_config.exists():
                with open(cursor_config) as f:
                    cfg = json.load(f)
                brian_srv = cfg.get("mcpServers", {}).get("brian", {})
                cmd = brian_srv.get("command", "")
                if cmd and "brian-backend" not in cmd:
                    cfg["mcpServers"]["brian"] = {
                        "command": sidecar,
                        "args": ["--mcp"],
                        "env": {"BRIAN_DB_PATH": brian_db},
                    }
                    with open(cursor_config, "w") as f:
                        json.dump(cfg, f, indent=2)
                    repaired.append("cursor")
        except Exception:
            pass
        
        if repaired:
            print(f"  ✓ Repaired MCP configs for: {', '.join(repaired)}")
    except Exception as e:
        print(f"  ⚠ MCP config repair skipped: {e}")


def main():
    """Run the application"""
    config = Config()
    
    # Find a free port (writes ~/.brian/port)
    config.resolve_port()
    
    # Clean up port file on exit
    atexit.register(cleanup_port_file)
    
    def _signal_handler(sig, frame):
        cleanup_port_file()
        sys.exit(0)
    
    signal.signal(signal.SIGTERM, _signal_handler)
    signal.signal(signal.SIGINT, _signal_handler)
    
    # Repair any broken MCP configs from previous installs
    _repair_mcp_configs()
    
    app = create_app(config)
    
    print(f"""
    🧠 brian - Your Personal Knowledge Base
    
    Starting server at http://{config.API_HOST}:{config.API_PORT}
    
    API Documentation: http://{config.API_HOST}:{config.API_PORT}/docs
    Database: {config.DB_PATH}
    Config:   {config._config_path}
    
    Press Ctrl+C to stop
    """)
    
    uvicorn.run(
        app,
        host=config.API_HOST,
        port=config.API_PORT,
        log_level="info" if config.DEBUG else "warning"
    )


if __name__ == "__main__":
    main()
