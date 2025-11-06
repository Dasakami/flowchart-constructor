
from fastapi import  HTTPException, Depends, status, APIRouter
from typing import  List
from datetime import datetime
import uuid

from .config import database, users_table, flowcharts_table
from .security import get_current_user, hash_password, create_access_token, verify_password
from .models import FlowchartCreate, FlowchartResponse, FlowchartUpdate, Token,UserLogin,UserRegister

router = APIRouter()
@router.post("/api/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user: UserRegister):
    query = users_table.select().where(
        (users_table.c.email == user.email) | (users_table.c.username == user.username)
    )
    existing = await database.fetch_one(query)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_id = str(uuid.uuid4())
    hashed_pw = hash_password(user.password)
    query = users_table.insert().values(
        id=user_id,
        email=user.email,
        username=user.username,
        hashed_password=hashed_pw,
        created_at=datetime.utcnow()
    )
    await database.execute(query)
    
    token = create_access_token({"sub": user_id})
    return {"access_token": token, "token_type": "bearer"}

@router.post("/api/auth/login", response_model=Token)
async def login(user: UserLogin):
    query = users_table.select().where(users_table.c.username == user.username)
    db_user = await database.fetch_one(query)
    
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": db_user.id})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/api/auth/me")
async def get_me(current_user = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "created_at": current_user.created_at
    }

@router.post("/api/flowcharts", response_model=FlowchartResponse, status_code=status.HTTP_201_CREATED)
async def create_flowchart(flowchart: FlowchartCreate, current_user = Depends(get_current_user)):
    flowchart_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    query = flowcharts_table.insert().values(
        id=flowchart_id,
        user_id=current_user.id,
        title=flowchart.title,
        description=flowchart.description,
        data=flowchart.data,
        created_at=now,
        updated_at=now
    )
    await database.execute(query)
    
    return {
        "id": flowchart_id,
        "user_id": current_user.id,
        "title": flowchart.title,
        "description": flowchart.description,
        "data": flowchart.data,
        "created_at": now,
        "updated_at": now
    }

@router.get("/api/flowcharts", response_model=List[FlowchartResponse])
async def get_flowcharts(current_user = Depends(get_current_user)):
    query = flowcharts_table.select().where(
        flowcharts_table.c.user_id == current_user.id
    ).order_by(flowcharts_table.c.updated_at.desc())
    
    flowcharts = await database.fetch_all(query)
    return flowcharts

@router.get("/api/flowcharts/{flowchart_id}", response_model=FlowchartResponse)
async def get_flowchart(flowchart_id: str, current_user = Depends(get_current_user)):
    query = flowcharts_table.select().where(
        (flowcharts_table.c.id == flowchart_id) & 
        (flowcharts_table.c.user_id == current_user.id)
    )
    flowchart = await database.fetch_one(query)
    
    if not flowchart:
        raise HTTPException(status_code=404, detail="Flowchart not found")
    
    return flowchart

@router.put("/api/flowcharts/{flowchart_id}", response_model=FlowchartResponse)
async def update_flowchart(
    flowchart_id: str, 
    flowchart_update: FlowchartUpdate, 
    current_user = Depends(get_current_user)
):
    query = flowcharts_table.select().where(
        (flowcharts_table.c.id == flowchart_id) & 
        (flowcharts_table.c.user_id == current_user.id)
    )
    existing = await database.fetch_one(query)
    
    if not existing:
        raise HTTPException(status_code=404, detail="Flowchart not found")
    
    update_data = flowchart_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    query = flowcharts_table.update().where(
        flowcharts_table.c.id == flowchart_id
    ).values(**update_data)
    
    await database.execute(query)
    
    query = flowcharts_table.select().where(flowcharts_table.c.id == flowchart_id)
    updated = await database.fetch_one(query)
    
    return updated

@router.delete("/api/flowcharts/{flowchart_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flowchart(flowchart_id: str, current_user = Depends(get_current_user)):
    query = flowcharts_table.select().where(
        (flowcharts_table.c.id == flowchart_id) & 
        (flowcharts_table.c.user_id == current_user.id)
    )
    existing = await database.fetch_one(query)
    
    if not existing:
        raise HTTPException(status_code=404, detail="Flowchart not found")
    
    query = flowcharts_table.delete().where(flowcharts_table.c.id == flowchart_id)
    await database.execute(query)
    
    return None
