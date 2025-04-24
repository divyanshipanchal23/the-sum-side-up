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

@router.post("/sessions/current/attempts", response_model=GameAttempt)
async def record_current_attempt(attempt: GameAttempt):
    """Record a user's attempt without requiring a specific session ID.
    This is a convenience endpoint for the frontend."""
    
    # Ensure we have both field naming styles for compatibility
    attempt.user_id = attempt.userId
    attempt.activity_id = attempt.activityId
    attempt.time_spent = attempt.timeSpent
    
    # Debug information
    print(f"Received attempt for {attempt.userId}, activity {attempt.activityId}")
    print(f"Attempt data: target={attempt.target}, inputs={attempt.inputs}, success={attempt.success}")
    
    # Find the most recent session for this user and activity or create a new one
    user_sessions = [s for s in game_sessions.values() 
                     if s.user_id == attempt.userId and s.configuration_id == attempt.activityId and not s.is_completed]
    
    # Sort by last_activity in descending order
    user_sessions.sort(key=lambda s: s.last_activity, reverse=True)
    
    session_id = None
    if user_sessions:
        # Use the most recent session
        session = user_sessions[0]
        session_id = session.id
    else:
        # Create a new session if none exists
        config_id = attempt.activityId
        try:
            # Create a session with default values if no configuration exists
            import random
            default_target = attempt.target
            
            session = GameSession(
                id=str(uuid.uuid4()),
                user_id=attempt.userId,
                configuration_id=config_id,
                current_target=default_target,
                current_level=1
            )
            game_sessions[session.id] = session
            session_id = session.id
            
            print(f"Created new session {session_id} for user {attempt.userId}, activity {attempt.activityId}")
        except Exception as e:
            # Log the error for debugging
            print(f"Error creating session: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to create game session: {str(e)}")
    
    # Now that we have a session ID, use the existing endpoint
    return await record_attempt(session_id, attempt)

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
    
    # Ensure field naming consistency
    attempt.user_id = attempt.userId
    attempt.activity_id = attempt.activityId
    attempt.time_spent = attempt.timeSpent
    
    # Print debug information
    print(f"Recording attempt for session {session_id}")
    print(f"Attempt data: target={attempt.target}, inputs={attempt.inputs}, success={attempt.success}")
    
    # Update session stats
    session.attempts += 1
    if attempt.success:
        session.successes += 1
    
    session.last_activity = datetime.now()
    
    # Update user progress
    progress_key = f"{session.user_id}_{session.configuration_id}"
    if progress_key not in user_progress:
        user_progress[progress_key] = UserProgress(
            userId=session.user_id,
            activityId=session.configuration_id
        )
    
    user_prog = user_progress[progress_key]
    user_prog.attempts += 1
    if attempt.success:
        user_prog.successes += 1
    
    user_prog.lastPlayed = datetime.now()
    user_prog.history.append(attempt)
    
    return attempt

@router.post("/progress", response_model=UserProgress)
async def update_user_progress(progress: UserProgress):
    """Update a user's progress for a specific activity."""
    # Ensure both field naming conventions are synchronized
    progress.user_id = progress.userId 
    progress.activity_id = progress.activityId
    progress.current_level = progress.currentLevel
    progress.last_played = progress.lastPlayed
    
    # Create a unique key using userId and activityId
    progress_key = f"{progress.userId}_{progress.activityId}"
    
    # Debug information
    print(f"Saving user progress for {progress.userId}, activity {progress.activityId}")
    print(f"Progress data: attempts={progress.attempts}, successes={progress.successes}, level={progress.currentLevel}")
    
    # Check if we already have progress for this user/activity
    if progress_key in user_progress:
        # Update existing progress
        existing = user_progress[progress_key]
        # Keep the history from the existing record
        progress.history = existing.history
    
    # Store or update the progress
    user_progress[progress_key] = progress
    
    return progress 