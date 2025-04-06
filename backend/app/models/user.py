from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    is_educator: bool = False

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str
    created_at: datetime = Field(default_factory=datetime.now)
    linked_educators: Optional[List[str]] = None
    linked_students: Optional[List[str]] = None

class User(UserBase):
    id: str
    created_at: datetime 