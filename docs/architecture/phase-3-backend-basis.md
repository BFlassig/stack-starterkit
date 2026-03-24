# Phase 3 - Laravel Backend Baseline

## Implemented

- Laravel 13 on PHP 8.3+
- PostgreSQL as default DB connection (`DB_CONNECTION=pgsql`)
- Redis for cache, session, and queue
- Official Laravel React path via Breeze (React + Inertia) in a Laravel-13-compatible setup
- API versioning under `/api/v1` in `routes/api.php`

## Routing

- `routes/web.php`
  - Inertia pages (Welcome, Auth, Dashboard, Profile)
  - Welcome page includes runtime overview for services/modules
- `routes/api.php`
  - `GET /api/v1/health`
  - `GET /api/v1/user` with `auth:sanctum`

## CORS

- Configuration in `config/cors.php`
- Path limitation: `api/v1/*`
- Origins from `API_ALLOWED_ORIGINS` (CSV)

## Queue / Jobs / Scheduler

- Queue default in `config/queue.php`: `redis`
- Failed jobs: `database-uuids`
- Separate worker container and separate scheduler container

## Backend Testing

- Pest is configured (`tests/Pest.php`)
- Representative API tests are present:
  - `tests/Feature/Api/V1/HealthCheckTest.php`
  - `tests/Feature/Api/V1/AuthenticatedUserEndpointTest.php`

## Current-State Notes

- Local lint/test workflow uses `composer install` (with dev dependencies).
- Production deploy uses `composer install --no-dev`.
