#!/bin/sh
set -e

cd /app

mkdir -p var
chmod -R 0777 var 2>/dev/null || true

echo "[entrypoint] Preparing SQLite database..."
php bin/console doctrine:database:create --if-not-exists --no-interaction 2>/dev/null || true

if ls migrations/Version*.php >/dev/null 2>&1; then
    echo "[entrypoint] Applying migrations..."
    php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration 2>/dev/null || true
fi

echo "[entrypoint] Ensuring schema is in sync..."
php bin/console doctrine:schema:update --force --no-interaction 2>/dev/null || true

echo "[entrypoint] Starting server: $*"
exec "$@"
