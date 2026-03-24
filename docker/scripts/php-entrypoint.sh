#!/usr/bin/env sh
set -eu

cd /var/www/html

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache

if [ ! -f .env ] && [ -f .env.example ]; then
    cp .env.example .env
fi

if [ ! -d vendor ] && [ -f composer.json ]; then
    composer install --no-interaction --prefer-dist
fi

exec "$@"
