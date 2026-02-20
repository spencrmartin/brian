"""
Main application entry point for brian
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from .config import Config
from .database import Database
from .api import routes


def create_app() -> FastAPI:
    """Create and configure the FastAPI application"""
    
    app = FastAPI(
        title=Config.APP_NAME,
        description=Config.APP_DESCRIPTION,
        version=Config.APP_VERSION
    )
    
    # Add CORS middleware for desktop app
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # For development - restrict in production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Initialize database
    db = Database(Config.DB_PATH)
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
            "app": Config.APP_NAME,
            "version": Config.APP_VERSION,
            "schema_version": schema_version,
        }
    
    return app


def main():
    """Run the application"""
    app = create_app()
    
    print(f"""
    🧠 brian - Your Personal Knowledge Base
    
    Starting server at http://{Config.API_HOST}:{Config.API_PORT}
    
    API Documentation: http://{Config.API_HOST}:{Config.API_PORT}/docs
    Database: {Config.DB_PATH}
    
    Press Ctrl+C to stop
    """)
    
    uvicorn.run(
        app,
        host=Config.API_HOST,
        port=Config.API_PORT,
        log_level="info" if Config.DEBUG else "warning"
    )


if __name__ == "__main__":
    main()
