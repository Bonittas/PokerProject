from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models.hand import HandCreateSchema, HandResponseSchema, HandListResponseSchema
from .repositories.hand_repository import HandRepository
from .services.hand_logic import process_hand
import psycopg2
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to database and create table if not exists
    app.state.db = psycopg2.connect(
        dbname="pokerdb",
        user="postgres",
        password="postgres",
        host="postgres", 
        port="5432"
    )
    cursor = app.state.db.cursor()
    try:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS hand (
                id TEXT PRIMARY KEY,
                stack_settings JSONB,
                player_roles JSONB,
                hole_cards JSONB,
                action_sequence TEXT,
                winnings JSONB,
                created_at TIMESTAMP
            )
        """)
        app.state.db.commit()
    except Exception as e:
        print(f"Error creating table: {e}")
        app.state.db.rollback()
    finally:
        cursor.close()
    yield
    # Shutdown: Close database connection
    app.state.db.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    return HandRepository(app.state.db)

@app.post("/hands", response_model=HandResponseSchema, status_code=201)
async def create_hand(hand: HandCreateSchema, db: HandRepository = Depends(get_db)):
    processed_hand = process_hand(hand)
    created_hand = db.create_hand(
        stack_settings=processed_hand.stack_settings,
        player_roles=processed_hand.player_roles,
        hole_cards=processed_hand.hole_cards,
        action_sequence=processed_hand.action_sequence,
        winnings=processed_hand.winnings
    )
    return created_hand

@app.get("/hands", response_model=HandListResponseSchema)
async def get_all_hands(db: HandRepository = Depends(get_db)):
    hands = db.get_all_hands()
    return {"hands": hands}

@app.get("/hands/{hand_id}", response_model=HandResponseSchema)
async def get_hand(hand_id: str, db: HandRepository = Depends(get_db)):
    hand = db.get_hand(hand_id)
    if not hand:
        raise HTTPException(status_code=404, detail="Hand not found")
    return hand