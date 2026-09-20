#!/bin/sh
set -e

# Default PORT if not provided by environment
export PORT="${PORT:-8080}"

echo "==> Starting DMRS Laravel Application Container..."
echo "==> Configuring Nginx to listen on port ${PORT}..."

# Substitute ${PORT} into Nginx configuration
if command -v envsubst > /dev/null 2>&1; then
    envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
else
    sed "s/\${PORT}/${PORT}/g" /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
fi

# Environment Validation (Fail-Fast for required variables)
if [ -z "$APP_KEY" ]; then
    echo "ERROR: Required environment variable APP_KEY is missing."
    exit 1
fi

if [ -z "$DB_HOST" ]; then
    echo "WARNING: DB_HOST is not set. Database operations may fail."
fi

# Ensure storage and cache directories exist and are writable
echo "==> Preparing storage and cache directories..."
mkdir -p storage/framework/views \
         storage/framework/cache \
         storage/framework/sessions \
         storage/logs \
         bootstrap/cache

chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Ensure storage symlink exists
echo "==> Linking storage..."
php artisan storage:link --force || true

# Production Caching
echo "==> Running Laravel production optimization commands..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Start PHP-FPM in background
echo "==> Starting PHP-FPM..."
php-fpm -D

# Start Nginx in foreground (main container process)
echo "==> Starting Nginx on port ${PORT}..."
exec nginx -g 'daemon off;'
