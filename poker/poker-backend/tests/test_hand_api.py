from fastapi.testclient import TestClient
from app.main import app, get_db  # ✅ Import get_db directly
from app.repositories.hand_repository import HandRepository
import psycopg2
import os

# Setup test DB connection manually
def override_get_db():
    db = psycopg2.connect(
        dbname="pokerdb",
        user="poker_user",
        password="password",
        host=os.getenv("DB_HOST", "localhost"),
        port="5432"
    )
    return HandRepository(db)

# ✅ Override the correct dependency function
app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_create_and_get_hand():
    payload = {
        "stack_settings": {
            "Player1": 1000,
            "Player2": 1000,
            "Player3": 1000,
            "Player4": 1000,
            "Player5": 1000,
            "Player6": 1000
        },
        "player_roles": {
            "dealer": "Player1",
            "sb": "Player2",
            "bb": "Player3"
        },
        "hole_cards": {
            "Player1": ["As", "Kd"],
            "Player2": ["7h", "7d"],
            "Player3": ["9s", "9c"],
            "Player4": ["Qc", "Qh"],
            "Player5": ["2s", "2d"],
            "Player6": ["Jh", "Jd"]
        },
        "action_sequence": "r80 c c c c c / Flop: [2s,3d,5h] / b160 f f f f f"
    }

    response = client.post("/hands", json=payload)
    assert response.status_code == 201
    assert "id" in response.json()
