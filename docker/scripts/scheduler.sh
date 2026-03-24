#!/usr/bin/env sh
set -eu

cd /var/www/html

while true; do
    php artisan schedule:run --no-interaction || true
    sleep 60
done
