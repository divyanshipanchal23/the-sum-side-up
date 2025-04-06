from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

class DifficultyLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"

class TargetRange(BaseModel):
    min: int
    max: int

class ProgressionRules(BaseModel):
    required_success_rate: float = 0.8
    advancement_threshold: int = 5

class GameConfiguration(BaseModel):
    id: str
    title: str
    difficulty: DifficultyLevel
    target_range: TargetRange
    number_of_addends: int = 2
    time_limit: Optional[int] = None
    hints_enabled: bool = True
    progression_rules: ProgressionRules = Field(default_factory=ProgressionRules)
    created_by: str
    created_at: datetime = Field(default_factory=datetime.now)
    is_public: bool = False

class GameAttempt(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.now)
    target: int
    inputs: List[int]
    success: bool
    time_spent: float  # in seconds

class UserProgress(BaseModel):
    user_id: str
    activity_id: str
    attempts: int = 0
    successes: int = 0
    current_level: int = 1
    last_played: datetime = Field(default_factory=datetime.now)
    history: List[GameAttempt] = []

class GameSession(BaseModel):
    id: str
    user_id: str
    configuration_id: str
    current_target: int
    current_level: int = 1
    attempts: int = 0
    successes: int = 0
    start_time: datetime = Field(default_factory=datetime.now)
    last_activity: datetime = Field(default_factory=datetime.now)
    is_completed: bool = False 