
import psycopg2
import os

def init_db():
    db_host = os.getenv("DB_HOST", "localhost")
    try:
        conn = psycopg2.connect(
            dbname="pokerdb",
            user="poker_user",
            password="password",
            host=db_host,
            port="5432"
        )
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS hands (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            stack_settings JSONB,
            player_roles JSONB,
            hole_cards JSONB,
            action_sequence TEXT,
            winnings JSONB
        );
        """)
        conn.commit()
        cursor.close()
        conn.close()
    except psycopg2.Error as e:
        print(f"Error initializing database: {e}")
        raise
