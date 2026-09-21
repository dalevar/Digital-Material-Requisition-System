# ==========================================
# Stage 1: Frontend Asset Build (Node.js)
# ==========================================
FROM node:20-alpine AS frontend
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ==========================================
# Stage 2: PHP Vendor Dependencies (Composer)
# ==========================================
FROM composer:2 AS vendor
WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --prefer-dist --optimize-autoloader --ignore-platform-reqs

# ==========================================
# Stage 3: Production Runtime (PHP-FPM + Nginx)
# ==========================================
FROM php:8.4-fpm-alpine AS runtime

# Install system runtime dependencies and build tools for PHP extensions
RUN apk add --no-cache \
    nginx \
    gettext \
    curl \
    libpng \
    libpng-dev \
    libjpeg-turbo \
    libjpeg-turbo-dev \
    freetype \
    freetype-dev \
    libzip \
    libzip-dev \
    icu-libs \
    icu-data-full \
    icu-dev \
    libxml2-dev \
    oniguruma-dev \
    $PHPIZE_DEPS \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    mbstring \
    bcmath \
    intl \
    opcache \
    exif \
    pcntl \
    gd \
    zip \
 && apk del $PHPIZE_DEPS *-dev

# Prepare Nginx directories
RUN mkdir -p /etc/nginx/templates /etc/nginx/http.d

# Copy Nginx template & PHP Production Config
COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/php/production.ini $PHP_INI_DIR/conf.d/production.ini

WORKDIR /var/www/html

# Copy application source
COPY . /var/www/html

# Copy vendor dependencies from Composer stage
COPY --from=vendor /app/vendor /var/www/html/vendor

# Copy built frontend assets from Node stage
COPY --from=frontend /app/public/build /var/www/html/public/build

# Copy and set permissions for entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Ensure correct file permissions for web server user
RUN chown -R www-data:www-data /var/www/html \
 && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Default Render port exposure
EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
