#!/bin/bash

# ==============================================================================
# CONFIGURATION
# ⚠️ IMPORTANT: DO NOT PUT SPACES AROUND THE "=" SIGN!
# ==============================================================================

# 1. Path to pg_dump (Found from your previous search)
PG_DUMP_CMD="/www/server/pgsql/bin/pg_dump"

# 2. Database Credentials
DB_NAME="your_database_name"
DB_USER="your_username"
DB_PASS="your_password"
DB_HOST="127.0.0.1"
DB_PORT="5432"

# 3. Backup Settings
BACKUP_DIR="/www/backup/database/postgresql"
RETENTION_DAYS=7

# ==============================================================================
# SAFETY CHECKS (Do not edit below)
# ==============================================================================

# Check if variables are set
if [[ -z "$DB_NAME" ]] || [[ -z "$DB_USER" ]]; then
    echo "❌ ERROR: DB_NAME or DB_USER is empty."
    echo "⚠️  Make sure you did NOT put spaces around the '=' sign in the config."
    exit 1
fi

if [[ -z "$BACKUP_DIR" ]]; then
    echo "❌ ERROR: BACKUP_DIR is not set."
    exit 1
fi

# ==============================================================================
# BACKUP PROCESS
# ==============================================================================

# Create directory
mkdir -p "$BACKUP_DIR"

# Set file name
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="${DB_NAME}_${DATE}.sql.gz"

# Export password
export PGPASSWORD="$DB_PASS"

echo "➡️  Starting backup for database: $DB_NAME"

# Run Backup
"$PG_DUMP_CMD" -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_DIR/$FILENAME"

# Check result
if [ -s "$BACKUP_DIR/$FILENAME" ]; then
    echo "✅ Backup Success: $BACKUP_DIR/$FILENAME"
else
    echo "❌ Backup Failed: File is empty or missing."
    rm -f "$BACKUP_DIR/$FILENAME"
    unset PGPASSWORD
    exit 1
fi

# Cleanup
echo "🧹 Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

unset PGPASSWORD
echo "🎉 Done."