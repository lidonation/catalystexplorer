#!/bin/bash
set -e

# Load environment variables
set -a; . /app/indexer/.env.testing; set +a;

# 

# Run migrations
echo "Running database migrations..."
/app/migration up


# Check if seed data already exists
echo "Checking if Block table needs seeding..."
BLOCKS_COUNT=$(PGPASSWORD=$PGPASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $PGUSER -d $POSTGRES_DB -t -c "SELECT COUNT(*) FROM \"Block\"" 2>/dev/null || echo "0")
BLOCKS_COUNT=$(echo $BLOCKS_COUNT | tr -d '[:space:]')

# Seed initial blocks if table is empty
if [ "$BLOCKS_COUNT" = "0" ]; then
  echo "Seeding initial blocks from snapshot file..."
  echo "Using network: $NETWORK"
  if [ -z "$NETWORK" ]; then
    echo "NETWORK environment variable is not set. Exiting..."
    exit 1
  fi
  SNAPSHOT_FILE="/app/snapshots/catalyst-txn-block-${NETWORK}.sql"
  echo "Using snapshot file: $SNAPSHOT_FILE"
  PGPASSWORD=$PGPASSWORD psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $PGUSER -d $POSTGRES_DB -f "$SNAPSHOT_FILE"
  echo "Seeding completed from snapshot file!"
else
  echo "Block table already has $BLOCKS_COUNT records, skipping seed."
fi

# Start the application
echo "Starting CARP application..."
exec /app/carp --plan /app/indexer/execution_plans/default.toml --config-path /app/indexer/configs/default-$NETWORK.yml