from typing import Dict, List, Optional
from uuid import UUID, uuid4
from datetime import datetime
import json
from app.models.hand import HandData

class HandRepository:
    def __init__(self, db):
        self.db = db

    def _get_created_at(self, hand_id: UUID) -> float:
        """Retrieve the created_at timestamp for a hand by ID."""
        cursor = self.db.cursor()
        try:
            cursor.execute("SELECT created_at FROM hand WHERE id = %s", (str(hand_id),))
            result = cursor.fetchone()
            if result and result[0]:
                return result[0].timestamp()
            raise ValueError(f"No hand found with id: {hand_id}")
        except Exception as e:
            raise ValueError(f"Error retrieving created_at for hand {hand_id}: {e}") from e
        finally:
            cursor.close()

    def create_hand(self, stack_settings: Dict[str, int], player_roles: Dict[str, str], hole_cards: Dict[str, List[str]], action_sequence: str, winnings: Dict[str, int]) -> HandData:
        """Create a new hand in the database."""
        cursor = self.db.cursor()
        hand_id = uuid4()
        created_at = datetime.utcnow()

        try:
            cursor.execute("""
                INSERT INTO hand (id, stack_settings, player_roles, hole_cards, action_sequence, winnings, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING created_at
            """, (
                str(hand_id),
                json.dumps(stack_settings),  # Serialize dict to JSON
                json.dumps(player_roles),
                json.dumps(hole_cards),
                action_sequence,
                json.dumps(winnings),
                created_at
            ))
            inserted_created_at = cursor.fetchone()[0]
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise ValueError(f"Error creating hand: {e}") from e
        finally:
            cursor.close()

        return HandData(
            id=str(hand_id),  # Convert UUID to string
            created_at=inserted_created_at.isoformat(),  # Convert datetime to ISO 8601 string
            stack_settings=stack_settings,
            player_roles=player_roles,
            hole_cards=hole_cards,
            action_sequence=action_sequence,
            winnings=winnings
        )

    def get_all_hands(self) -> List[HandData]:
        """Retrieve all hands from the database."""
        cursor = self.db.cursor()
        try:
            cursor.execute("SELECT id, stack_settings, player_roles, hole_cards, action_sequence, winnings, created_at FROM hand")
            rows = cursor.fetchall()
            hands = [
                HandData(
                    id=str(row[0]),  # Ensure id is string
                    stack_settings=row[1],
                    player_roles=row[2],
                    hole_cards=row[3],
                    action_sequence=row[4],
                    winnings=row[5],
                    created_at=row[6].isoformat()  # Convert datetime to ISO 8601 string
                )
                for row in rows
            ]
            return hands
        except Exception as e:
            raise ValueError(f"Error retrieving hands: {e}") from e
        finally:
            cursor.close()

    def get_hand(self, hand_id: str) -> Optional[HandData]:
        """Retrieve a hand by ID."""
        cursor = self.db.cursor()
        try:
            cursor.execute("SELECT id, stack_settings, player_roles, hole_cards, action_sequence, winnings FROM hand WHERE hand_id = %s", (hand_id,))
            row = cursor.fetchone()
            if not row:
                return None
            return HandData(
                id=str(row[0]),  # Ensure id is string
                stack_settings=row[1],
                player_roles=row[2],
                hole_cards=row[3],
                action_sequence=row[4],
                winnings=row[5],
                created_at=row[6].isoformat()  # Convert datetime to ISO 8601 string
            )
        except Exception as e:
            raise ValueError(f"Error retrieving hand {hand_id}: {e}") from e
        finally:
            cursor.close()