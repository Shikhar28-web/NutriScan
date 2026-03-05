from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers using package-relative imports so they work when running
# `uvicorn backend.app:app` from the project root.
from .routes.analysis import router as analysis_router
from .routes.recommendation import router as recommendation_router
from .routes.scan import router as scan_router


def create_app() -> FastAPI:
    """
    Application factory for NutriScan AI backend.
    This keeps startup logic organized and makes testing easier.
    """
    app = FastAPI(
        title="NutriScan AI Backend",
        version="0.1.0",
        description="Backend + ML pipeline for NutriScan AI (packaged food health analysis).",
    )

    # CORS configuration – will allow your future frontend to call this API.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, restrict to your frontend domains.
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(scan_router, prefix="/api", tags=["scan"])
    app.include_router(analysis_router, prefix="/api", tags=["analysis"])
    app.include_router(recommendation_router, prefix="/api", tags=["recommendation"])

    @app.get("/health", tags=["system"])
    async def health_check():
        """Basic health check endpoint."""
        return {"status": "ok", "service": "nutriscan-ai-backend"}

    return app


app = create_app()

