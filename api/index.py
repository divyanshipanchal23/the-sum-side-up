import sys
import os

# Try to add the backend directory to the path
try:
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
except:
    print("Could not add parent directory to path")

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

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
        "https://the-sum-side-up.vercel.app",  # Frontend URL (removed trailing slash)
        "http://localhost:5173",  # Vue dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple test route
@app.get("/api/test")
async def test():
    return {"status": "API is working"}

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