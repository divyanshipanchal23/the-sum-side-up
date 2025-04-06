from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
import uuid
from datetime import datetime

from ..models.game import (
    GameConfiguration,
    TargetRange,
    DifficultyLevel,
    ProgressionRules,
    UserProgress,
    GameSession,
    GameAttempt
)

router = APIRouter(prefix="/api/game", tags=["game"])

# Mock database for demonstration
game_configs = {}
user_progress = {}
game_sessions = {}

@router.post("/configurations", response_model=GameConfiguration)
async def create_game_configuration(config: GameConfiguration):
    """Create a new game configuration."""
    if not config.id:
        config.id = str(uuid.uuid4())
    
    config.created_at = datetime.now()
    game_configs[config.id] = config
    return config

@router.get("/configurations", response_model=List[GameConfiguration])
async def get_game_configurations(
    user_id: Optional[str] = None,
    difficulty: Optional[DifficultyLevel] = None,
    limit: int = Query(10, ge=1, le=100)
):
    """Get available game configurations, with optional filtering."""
    filtered_configs = list(game_configs.values())
    
    if user_id:
        filtered_configs = [c for c in filtered_configs if c.created_by == user_id or c.is_public]
    
    if difficulty:
        filtered_configs = [c for c in filtered_configs if c.difficulty == difficulty]
    
    return filtered_configs[:limit]

@router.get("/configurations/{config_id}", response_model=GameConfiguration)
async def get_game_configuration(config_id: str):
    """Get a specific game configuration by ID."""
    if config_id not in game_configs:
        raise HTTPException(status_code=404, detail="Game configuration not found")
    
    return game_configs[config_id]

@router.post("/sessions", response_model=GameSession)
async def create_game_session(user_id: str, config_id: str):
    """Start a new game session with the specified configuration."""
    if config_id not in game_configs:
        raise HTTPException(status_code=404, detail="Game configuration not found")
    
    config = game_configs[config_id]
    
    # Generate a target number within the configuration's range
    import random
    target = random.randint(config.target_range.min, config.target_range.max)
    
    session = GameSession(
        id=str(uuid.uuid4()),
        user_id=user_id,
        configuration_id=config_id,
        current_target=target
    )
    
    game_sessions[session.id] = session
    return session

@router.post("/sessions/{session_id}/attempts", response_model=GameAttempt)
async def record_attempt(
    session_id: str,
    attempt: GameAttempt
):
    """Record a user's attempt in a game session."""
    if session_id not in game_sessions:
        raise HTTPException(status_code=404, detail="Game session not found")
    
    session = game_sessions[session_id]
    
    if session.is_completed:
        raise HTTPException(status_code=400, detail="Game session is already completed")
    
    # Update session stats
    session.attempts += 1
    if attempt.success:
        session.successes += 1
    
    session.last_activity = datetime.now()
    
    # Update user progress
    progress_key = f"{session.user_id}_{session.configuration_id}"
    if progress_key not in user_progress:
        user_progress[progress_key] = UserProgress(
            user_id=session.user_id,
            activity_id=session.configuration_id
        )
    
    user_prog = user_progress[progress_key]
    user_prog.attempts += 1
    if attempt.success:
        user_prog.successes += 1
    
    user_prog.last_played = datetime.now()
    user_prog.history.append(attempt)
    
    return attempt 