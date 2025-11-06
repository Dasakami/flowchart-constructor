from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class FlowchartCreate(BaseModel):
    title: str
    description: Optional[str] = None
    data: dict

class FlowchartUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    data: Optional[dict] = None

class FlowchartResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    data: dict
    created_at: datetime
    updated_at: datetime
