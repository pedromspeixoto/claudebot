#!/bin/bash
set -e

echo "Waiting for database to be ready..."

MAX_RETRIES=30
RETRY_INTERVAL=2

for i in $(seq 1 $MAX_RETRIES); do
    if python -c "
from sqlalchemy import create_engine, text
from app.core.config import settings
engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))
with engine.connect() as conn:
    conn.execute(text('SELECT 1'))
print('Database is ready!')
" 2>/dev/null; then
        break
    fi
    echo "Database not ready yet... retry $i/$MAX_RETRIES"
    sleep $RETRY_INTERVAL
done

echo "Running Alembic migrations..."
alembic upgrade head

echo "Seeding initial data..."
python -m app.initial_data

echo "Prestart complete!"
