# Phase 1 - Overall Architecture and Repository Structure

## Implemented

- Single repository with Laravel as central project root
- Frontend in the same repository under `resources/js` (Inertia 2 + React 19 + TypeScript)
- External API clearly separated in `routes/api.php` with `/api/v1` prefix
- Internal app flows via Inertia page props (no internal REST client)

## Current Architecture Principles

1. **Communication path separation**
   - Internal: Inertia (Controller -> Page Props -> React)
   - External: REST API under `/api/v1`
2. **Configuration over hardcoding**
   - Runtime values via `.env`, `.env.example`, and Laravel config
3. **Container-first local development**
   - Docker Compose is the default path for startup, operations, and verification
4. **Consistent toolchain**
   - pnpm as the single Node package manager
   - Laravel Pint + Pest in backend
   - ESLint + Vitest in frontend

## Repository Structure (Main Areas)

```text
app/                 Laravel application logic
config/              Configurations (DB, CORS, Queue, Sanctum, ...)
database/            Migrations, factories, seeders
docker/              Dockerfiles, nginx config, runtime scripts
docs/                Architecture and operations documentation
resources/js/        React/Inertia frontend
routes/              Web and API routing
scripts/ops/         Verify, deploy, and update scripts
tests/               Pest test suite
```

## Important Clarifications

- GitHub Actions are **intentionally not hardwired** (team decision per target environment).
- There is no second internal data access layer besides Inertia.
- Lucide React is the only icon library.
