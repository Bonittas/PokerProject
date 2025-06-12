CREATE TABLE IF NOT EXISTS hand (
    id TEXT PRIMARY KEY,
    stack_settings JSONB,
    player_roles JSONB,
    hole_cards JSONB,
    action_sequence TEXT,
    winnings JSONB,
    created_at TIMESTAMP
);