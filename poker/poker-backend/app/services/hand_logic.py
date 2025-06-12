from typing import Dict, List
from pokerkit import NoLimitTexasHoldem, Automation
import re
import uuid
from datetime import datetime
from app.models.hand import HandData
from app.schemas.hand import HandCreateSchema
import logging

logger = logging.getLogger(__name__)

def validate_action_sequence(action_sequence: str) -> bool:
    try:
        if not action_sequence:
            logger.error("Empty action sequence")
            return False
        streets = action_sequence.split("/")
        for street in streets:
            street = street.strip()
            if not street:
                continue
            if "Flop" in street or "Turn" in street or "River" in street:
                match = re.search(r"\[(.+?)\]", street)
                if not match:
                    logger.error(f"Invalid card format in street: {street}")
                    return False
                cards = match.group(1).split(",")
                expected_cards = 3 if "Flop" in street else 1
                if len(cards) != expected_cards:
                    logger.error(f"Invalid number of cards: {cards}")
                    return False
                for card in cards:
                    if not re.match(r"^[2-9TJQKA][hdcs]$", card.strip()):
                        logger.error(f"Invalid card format: {card}")
                        return False
                continue
            actions = street.split()
            for action in actions:
                if action not in ["f", "x", "c", "allin"] and not (action.startswith("b") or action.startswith("r")):
                    logger.error(f"Invalid action: {action}")
                    return False
                if action.startswith("b") or action.startswith("r"):
                    try:
                        amount = int(action[1:])
                        if amount <= 0:
                            logger.error(f"Invalid amount: {amount}")
                            return False
                    except ValueError:
                        logger.error(f"Invalid amount format in action: {action}")
                        return False
        return True
    except Exception as e:
        logger.error(f"Error validating action sequence: {str(e)}")
        return False

def calculate_winnings(stack_settings: Dict[str, int], hole_cards: Dict[str, List[str]], action_sequence: str) -> Dict[str, int]:
    logger.debug("Calculating winnings")
    players = list(stack_settings.keys())
    stacks = list(stack_settings.values())
    logger.debug(f"Stack settings: {stacks}, Number of players: {len(players)}")

    if not validate_action_sequence(action_sequence):
        raise ValueError("Invalid action sequence")
    if len(stacks) != len(players):
        raise ValueError("Mismatch between stack settings and player count")
    if any(stack <= 0 for stack in stacks):
        raise ValueError("All stack sizes must be positive")

    # Handle all-fold scenario
    preflop_actions = action_sequence.split("/")[0].strip().split()
    if len(preflop_actions) >= 3 and all(action == "f" for action in preflop_actions[3:]):
        logger.info("All players folded preflop, returning blinds")
        winnings = {player: 0 for player in players}
        winnings[players[1]] = -20  # Small blind loses 20
        winnings[players[2]] = 20   # Big blind wins (SB + BB = 20 + 40, net +20)
        return winnings

    try:
        state = NoLimitTexasHoldem.create_state(
            (
                Automation.BET_COLLECTION,
                Automation.BLIND_OR_STRADDLE_POSTING,
                Automation.HOLE_CARDS_SHOWING_OR_MUCKING,
                Automation.CHIPS_PUSHING,
                Automation.CHIPS_PULLING,
            ),
            True,  # Uniform antes
            0,     # Antes
            (20, 40),  # Small blind, Big blind
            40,    # Min-bet
            tuple(stacks),  # Starting stacks as tuple
            len(players)  # Number of players
        )
    except Exception as e:
        logger.error(f"Error creating pokerkit state: {e}")
        raise

    player_map = {name: idx for idx, name in enumerate(players)}

    try:
        for player, cards in hole_cards.items():
            if player not in player_map or len(cards) != 2:
                raise ValueError(f"Invalid player or hole cards: {player}, {cards}")
            state.deal_hole("".join(cards), player_map[player])
    except Exception as e:
        logger.error(f"Error dealing hole cards: {e}")
        raise

    try:
        for street in action_sequence.strip().split("/"):
            street = street.strip()
            if not street:
                continue
            if "Flop" in street:
                cards = re.search(r"\[(.+?)\]", street).group(1).split(",")
                state.burn_card()
                for card in cards:
                    state.deal_board(card.strip())
            elif "Turn" in street or "River" in street:
                card = re.search(r"\[(.+?)\]", street).group(1).strip()
                state.burn_card()
                state.deal_board(card)
            else:
                for action in street.split():
                    if action == "f":
                        state.fold()
                    elif action in ["x", "c"]:
                        state.check_or_call()
                    elif action.startswith("b") or action.startswith("r"):
                        amt = int(action[1:])
                        state.complete_bet_or_raise_to(amt)
                    elif action == "allin":
                        state.complete_bet_or_raise_to(state.stacks[state.actor_index])
    except Exception as e:
        logger.error(f"Error processing action sequence: {e}")
        raise

    try:
        payoffs = state.payoffs
        return {players[i]: payoffs[i] for i in range(len(players))}
    except Exception as e:
        logger.error(f"Error calculating payoffs: {e}")
        raise

def process_hand(hand_input: HandCreateSchema) -> HandData:
    hand_id = uuid.uuid4()
    created_at = datetime.utcnow()

    winnings = calculate_winnings(
        stack_settings=hand_input.stack_settings,
        hole_cards=hand_input.hole_cards,
        action_sequence=hand_input.action_sequence
    )

    return HandData(
        id=hand_id,
        created_at=created_at,
        stack_settings=hand_input.stack_settings,
        player_roles=hand_input.player_roles,
        hole_cards=hand_input.hole_cards,
        action_sequence=hand_input.action_sequence,
        winnings=winnings
    )