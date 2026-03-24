# Operations Scripts

These scripts cover verification, dependency maintenance, and deployment for this starter kit.

## Included Scripts

- `scripts/ops/verify-stack.sh`
- `scripts/ops/deploy-stack.sh`
- `scripts/ops/upgrade-major-preview.sh`
- `scripts/ops/auto-update-stack.sh`

## Quick Command Map

| Goal | Command |
| --- | --- |
| Full development verification | `./scripts/ops/verify-stack.sh --profile development` |
| Production-style verification | `./scripts/ops/verify-stack.sh --profile production` |
| Production deploy dry-run | `./scripts/ops/deploy-stack.sh --mode production --dry-run` |
| Apply dependency updates | `./scripts/ops/auto-update-stack.sh --apply` |
| Preview major Node upgrades | `./scripts/ops/upgrade-major-preview.sh` |

## Prerequisites

- Docker + Docker Compose
- PHP, Composer
- Node.js 22 + pnpm
- `.env` or an alternative env file (`.env.staging`, `.env.production`)

## 1) Verification Script

### Purpose

Runs all valid quality/runtime checks and prints a clear PASS/WARN/FAIL result.

### Covered Checks

- Toolchain versions (PHP/Composer/Node/pnpm/Compose)
- Compose service configuration
- Dependency update status (Composer direct + pnpm)
- Frontend lint + tests
- Backend lint + tests (in `development` profile)
- API health check (`/api/v1/health`) when HTTP service is running

### Usage

```bash
./scripts/ops/verify-stack.sh
```

With options:

```bash
./scripts/ops/verify-stack.sh --env-file .env.staging
./scripts/ops/verify-stack.sh --project-name stack_staging
./scripts/ops/verify-stack.sh --profile production
./scripts/ops/verify-stack.sh --strict-updates
```

### Profiles

- `development` (default): full pipeline including backend dev checks
- `production`: skips backend lint/tests (typical for `composer install --no-dev`)

### Exit Codes

- `0` = no failures
- `1` = at least one failure

Note: outdated dependencies are warnings by default. With `--strict-updates`, they are treated as failures.

### Stable Backend Test Run in Container

If backend feature tests run inconsistently with plain `php artisan test` inside a running container, use the explicit testing context:

```bash
docker compose exec app composer run test:backend:docker
```

This command sets relevant test variables deterministically (SQLite in-memory, test-safe session/cache/queue/mail).

## 2) Deploy Script

### Purpose

Reproducible deployment with build, migrations, cache optimization, service restarts, and health check.

### Flow

1. Optional pre-verify
2. Build + start core services
3. Composer installation (mode dependent)
4. Node install + frontend build
5. Migrations (`--force`)
6. Wayfinder regeneration (staging)
7. Laravel optimization caches
8. Swagger regeneration (staging)
9. Queue restart + service restarts
10. `docker compose ps` + health retry

### Usage

Default (production):

```bash
./scripts/ops/deploy-stack.sh
```

Staging:

```bash
./scripts/ops/deploy-stack.sh \
  --mode staging \
  --env-file .env.staging \
  --project-name stack_staging
```

Production:

```bash
./scripts/ops/deploy-stack.sh \
  --mode production \
  --env-file .env.production \
  --project-name stack_prod
```

Dry run (no changes):

```bash
./scripts/ops/deploy-stack.sh --mode production --dry-run
```

### Important Options

- `--mode <staging|production>`
- `--env-file <path>`
- `--project-name <name>`
- `--skip-verify`
- `--dry-run`
- `--verify-profile <development|production>`
- `--health-timeout <seconds>`
- `--health-interval <seconds>`
- `--health-path <path>`

### Mode Differences

- `production`: `composer install --no-dev --optimize-autoloader`
- `staging`: `composer install` with dev dependencies
- `production`: skips `wayfinder:generate` and `l5-swagger:generate`
- `staging`: runs both generation steps

## 3) Major Upgrade Preview

### Purpose

Analyzes major updates for Node dependencies and surfaces possible peer-constraint blockers before running risky upgrades.

### Usage

```bash
./scripts/ops/upgrade-major-preview.sh
./scripts/ops/upgrade-major-preview.sh --strict
./scripts/ops/upgrade-major-preview.sh --apply
```

## 4) Auto Update Script

### Purpose

Automates dependency updates for Node and/or Composer with optional verification.

### Usage

Preview:

```bash
./scripts/ops/auto-update-stack.sh
```

Apply:

```bash
./scripts/ops/auto-update-stack.sh --apply
```

Node only:

```bash
./scripts/ops/auto-update-stack.sh --apply --scope node
```

PHP only:

```bash
./scripts/ops/auto-update-stack.sh --apply --scope php
```

Skip verification:

```bash
./scripts/ops/auto-update-stack.sh --apply --skip-verify
```

## Recommended Workflow After Changes

1. `./scripts/ops/verify-stack.sh`
2. `./scripts/ops/deploy-stack.sh --mode staging --env-file .env.staging`
3. After approval: `./scripts/ops/deploy-stack.sh --mode production --env-file .env.production`

## Troubleshooting

Health check failed:

```bash
docker compose ps
docker compose logs nginx app worker scheduler --tail=200
```

Migration failed:

```bash
docker compose exec app php artisan migrate:status
```

Frontend build failed:

```bash
docker compose run --rm --no-deps node sh -lc "corepack pnpm install && corepack pnpm run build"
```
