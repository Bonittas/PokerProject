from pydantic import BaseModel, validator
from dataclasses import dataclass
from typing import Dict, List
import re

@dataclass
class HandData:
    id: str
    created_at: str
    stack_settings: Dict[str, int]
    player_roles: Dict[str, str]
    hole_cards: Dict[str, List[str]]
    action_sequence: str
    winnings: Dict[str, int]

class HandCreateSchema(BaseModel):
    stack_settings: Dict[str, int]
    player_roles: Dict[str, str]
    hole_cards: Dict[str, List[str]]
    action_sequence: str

    @validator("hole_cards")
    def validate_cards(cls, v):
        for cards in v.values():
            if len(cards) != 2:
                raise ValueError("Each player must have exactly 2 cards")
            for card in cards:
                if not re.match(r"^[2-9TJQKA][hdcs]$", card):
                    raise ValueError(f"Invalid card format: {card}")
        return v

    @validator("stack_settings")
    def validate_stacks(cls, v):
        for stack in v.values():
            if stack <= 0:
                raise ValueError("Stack sizes must be positive")
        return v

class HandResponseSchema(BaseModel):
    id: str
    created_at: str
    stack_settings: Dict[str, int]
    player_roles: Dict[str, str]
    hole_cards: Dict[str, List[str]]
    action_sequence: str
    winnings: Dict[str, int]

class HandListResponseSchema(BaseModel):
    hands: List[HandResponseSchema]