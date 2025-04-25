import sys
import os

# Add the backend directory to the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.game import router as game_router

app = FastAPI(
    title="Balance Scale Addition Game API",
    description="Backend API for the Balance Scale Addition Game",
    version="0.1.0"
)

# Configure CORS for Vercel deployment
# We'll allow the frontend domain and localhost for testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-url-placeholder.vercel.app",  # Update this with your frontend URL
        "http://localhost:5173",  # Vue dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(game_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Balance Scale Addition Game API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# This handler is specific to Vercel
@app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def catch_all(request: Request, path_name: str):
    return {"message": f"Path not found: {path_name}", "method": request.method} 