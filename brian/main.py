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
        try:
            schema_version = db.get_schema_version()
        except Exception:
            pass
        return {
            "status": "healthy",
            "app": config.APP_NAME,
            "version": config.APP_VERSION,
            "schema_version": schema_version,
            "port": config.API_PORT,
        }
    
    @app.get("/api/v1/config")
    async def get_config():
        """Return current configuration"""
        return config.to_dict()
    
    return app


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
