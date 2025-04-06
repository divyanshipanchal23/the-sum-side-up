from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.game import router as game_router

app = FastAPI(
    title="Balance Scale Addition Game API",
    description="Backend API for the Balance Scale Addition Game",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vue dev server
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