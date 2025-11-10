#!/bin/bash
# ===================================================================
# PostgreSQL Database Initialization Script
# ===================================================================
# Purpose: Create multiple databases and configure initial settings
# Runs once when PostgreSQL container is first created
# ===================================================================

set -e
set -u

# ===================================================================
# Configuration
# ===================================================================
DATABASES="payload_dev keycloak_dev"
POSTGRES_USER="${POSTGRES_USER:-portal_user}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ===================================================================
# Helper Functions
# ===================================================================
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ===================================================================
# Create Databases
# ===================================================================
log_info "Starting database initialization..."

for db in $DATABASES; do
    log_info "Creating database: $db"

    if psql -U "$POSTGRES_USER" -lqt | cut -d \| -f 1 | grep -qw "$db"; then
        log_warn "Database '$db' already exists, skipping..."
    else
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
            CREATE DATABASE $db
                ENCODING = 'UTF8'
                LC_COLLATE = 'C'
                LC_CTYPE = 'C'
                TEMPLATE = template0;

            GRANT ALL PRIVILEGES ON DATABASE $db TO $POSTGRES_USER;
EOSQL
        log_info "Database '$db' created successfully"
    fi
done

# ===================================================================
# Configure PayloadCMS Database
# ===================================================================
log_info "Configuring payload_dev database..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "payload_dev" <<-EOSQL
    -- Enable UUID extension (used by PayloadCMS)
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Enable pg_trgm for full-text search
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";

    -- Set timezone to UTC
    SET timezone = 'UTC';

    -- Create audit schema (for audit_logs table isolation)
    CREATE SCHEMA IF NOT EXISTS audit;
    GRANT USAGE ON SCHEMA audit TO $POSTGRES_USER;

    -- Performance settings (development)
    ALTER DATABASE payload_dev SET work_mem = '16MB';
    ALTER DATABASE payload_dev SET maintenance_work_mem = '64MB';
    ALTER DATABASE payload_dev SET effective_cache_size = '512MB';
EOSQL

log_info "payload_dev configured successfully"

# ===================================================================
# Configure Keycloak Database
# ===================================================================
log_info "Configuring keycloak_dev database..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "keycloak_dev" <<-EOSQL
    -- Set timezone to UTC
    SET timezone = 'UTC';

    -- Performance settings (development)
    ALTER DATABASE keycloak_dev SET work_mem = '16MB';
    ALTER DATABASE keycloak_dev SET maintenance_work_mem = '64MB';
EOSQL

log_info "keycloak_dev configured successfully"

# ===================================================================
# Create Initial Roles (optional - for future use)
# ===================================================================
log_info "Creating database roles..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
    -- Read-only role (for reporting/analytics)
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'portal_readonly') THEN
            CREATE ROLE portal_readonly WITH LOGIN PASSWORD 'readonly_pass';
        END IF;
    END
    \$\$;

    GRANT CONNECT ON DATABASE payload_dev TO portal_readonly;
    GRANT USAGE ON SCHEMA public TO portal_readonly;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO portal_readonly;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO portal_readonly;
EOSQL

log_info "Database roles created successfully"

# ===================================================================
# Database Statistics
# ===================================================================
log_info "Database initialization summary:"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

psql -U "$POSTGRES_USER" -d "postgres" -c "
    SELECT
        datname as \"Database\",
        pg_size_pretty(pg_database_size(datname)) as \"Size\",
        (SELECT count(*) FROM pg_stat_activity WHERE datname = d.datname) as \"Connections\"
    FROM pg_database d
    WHERE datname IN ('payload_dev', 'keycloak_dev')
    ORDER BY datname;
"

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "Database initialization completed successfully! ✓"
log_info ""
log_info "Next steps:"
log_info "  1. Verify containers: docker-compose ps"
log_info "  2. Check logs: docker-compose logs -f postgres"
log_info "  3. Connect to DB: psql -U $POSTGRES_USER -d payload_dev -h localhost"
log_info ""
