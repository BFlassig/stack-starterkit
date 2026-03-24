#!/usr/bin/env sh
set -eu

cd /var/www/html

exec php artisan queue:work --queue=default --sleep=1 --tries=3 --timeout=90 --no-interaction
