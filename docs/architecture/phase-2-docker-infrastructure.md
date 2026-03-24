# Phase 2 - Docker and Infrastructure Baseline

## Implemented

Local infrastructure runs through `docker-compose.yml` with eight services:

- `app` (PHP-FPM/Laravel runtime)
- `nginx` (HTTP entrypoint, `APP_PORT`, default `8080`)
- `node` (Vite dev server, `VITE_PORT`, default `5173`)
- `postgres` (PostgreSQL 17)
- `redis` (Redis 7)
- `worker` (Laravel queue worker)
- `scheduler` (Laravel scheduler loop)
- `mailpit` (local SMTP + UI)

## Service Interplay

- `nginx` forwards PHP requests to `app:9000`.
- `app`, `worker`, and `scheduler` share the same Laravel codebase.
- `postgres` and `redis` are protected by health checks and wired as dependencies.
- `mailpit` is included for local mail testing.

## Queue and Scheduler Strategy

- Queue: `docker/scripts/queue-worker.sh` runs `php artisan queue:work`.
- Scheduler: `docker/scripts/scheduler.sh` runs `php artisan schedule:run` every minute.
- Deploy script sends `php artisan queue:restart` before service restarts.

## Persistence

- Volumes:
  - `pgsql-data`
  - `redis-data`
  - `pnpm-store`

## Network

- Dedicated bridge network: `appnet`
- Internal service names are used as hostnames (`postgres`, `redis`, `mailpit`).

## Development Logic

- Default startup: `docker compose up -d --build`
- Health check endpoint: `/api/v1/health`
- Check running containers: `docker compose ps`

This setup is optimized for fast local onboarding and reproducible deployment steps.
