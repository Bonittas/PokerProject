export interface GameState {
  playerCards: string[][];
  communityCards: string[];
  currentStreet: string;
  pot: number;
  playerBets: number[];
  playerStacks: number[];
  currentPlayerIndex: number;
  lastActions: string[];
  disabledActions: string[];
  bigBlindSize: number;
}

export interface HandCreateRequest {
  stack_settings: { [key: string]: number };
  player_roles: { dealer: string; sb: string; bb: string };
  hole_cards: { [key: string]: string[] };
  action_sequence: string;
}

export interface HandData {
    id: string;
    created_at: string;
    stack_settings: Record<string, number>;
    player_roles: Record<string, string>;
    hole_cards: Record<string, string[]>;
    action_sequence: string;
    winnings: Record<string, number>;
}
export interface PokerFormProps {
    onAction: (action: string, amount?: number) => void;
    onReset: (stackSize?: number) => void;
    disabledActions: string[];
    currentBet: number;
    bigBlindSize: number;
    isFirstHand: boolean;
}
export interface HandCreateRequest {
    stack_settings: Record<string, number>;
    hole_cards: Record<string, string[]>;
    action_sequence: string;
}