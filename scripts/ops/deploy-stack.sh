#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

MODE="production"
ENV_FILE=".env"
RUN_VERIFY="true"
VERIFY_PROFILE=""
COMPOSE_PROJECT_NAME_VALUE=""
DRY_RUN="false"
HEALTH_PATH="/api/v1/health"
HEALTH_TIMEOUT_SECONDS=120
HEALTH_INTERVAL_SECONDS=5

usage() {
  cat <<'USAGE'
Usage: ./scripts/ops/deploy-stack.sh [options]

Options:
  --mode <staging|production>  Deployment mode (default: production)
  --env-file <path>            Env file used by docker compose (default: .env)
  --project-name <name>        Override COMPOSE_PROJECT_NAME for docker compose
  --skip-verify                Skip pre-deploy verification script
  --dry-run                    Print all deployment commands without executing them
  --verify-profile <name>      Force verify profile: development|production
  --health-timeout <seconds>   Max seconds to wait for health endpoint (default: 120)
  --health-interval <seconds>  Retry interval for health endpoint (default: 5)
  --health-path <path>         Health path (default: /api/v1/health)
  -h, --help                   Show help
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="${2:-}"
      shift 2
      ;;
    --env-file)
      ENV_FILE="${2:-}"
      shift 2
      ;;
    --project-name)
      COMPOSE_PROJECT_NAME_VALUE="${2:-}"
      shift 2
      ;;
    --skip-verify)
      RUN_VERIFY="false"
      shift
      ;;
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    --verify-profile)
      VERIFY_PROFILE="${2:-}"
      shift 2
      ;;
    --health-timeout)
      HEALTH_TIMEOUT_SECONDS="${2:-}"
      shift 2
      ;;
    --health-interval)
      HEALTH_INTERVAL_SECONDS="${2:-}"
      shift 2
      ;;
    --health-path)
      HEALTH_PATH="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ "$MODE" != "staging" && "$MODE" != "production" ]]; then
  echo "Invalid mode: $MODE (allowed: staging, production)" >&2
  exit 1
fi

if ! [[ "$HEALTH_TIMEOUT_SECONDS" =~ ^[0-9]+$ && "$HEALTH_INTERVAL_SECONDS" =~ ^[0-9]+$ ]]; then
  echo "Health timeout/interval must be integer values" >&2
  exit 1
fi

if [[ -n "$VERIFY_PROFILE" && "$VERIFY_PROFILE" != "development" && "$VERIFY_PROFILE" != "production" ]]; then
  echo "Invalid verify profile: $VERIFY_PROFILE (allowed: development, production)" >&2
  exit 1
fi

log() { printf "\n[DEPLOY] %s\n" "$1"; }

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

compose() {
  local args=(docker compose --env-file "$ENV_FILE")

  if [[ -n "$COMPOSE_PROJECT_NAME_VALUE" ]]; then
    args+=(--project-name "$COMPOSE_PROJECT_NAME_VALUE")
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    printf "[DRY-RUN] "
    printf "%q " "${args[@]}" "$@"
    printf "\n"
    return 0
  fi

  "${args[@]}" "$@"
}

health_url_from_env() {
  local app_port
  app_port="$(grep -E '^APP_PORT=' "$ENV_FILE" 2>/dev/null | tail -n1 | cut -d '=' -f2- || true)"

  if [[ -z "$app_port" ]]; then
    app_port="${APP_PORT:-8080}"
  fi

  printf "http://localhost:%s%s" "$app_port" "$HEALTH_PATH"
}

wait_for_health() {
  local url="$1"
  local start now elapsed
  start="$(date +%s)"

  while true; do
    if curl -fsS "$url" >/tmp/stack_deploy_health.json 2>/dev/null; then
      cat /tmp/stack_deploy_health.json
      rm -f /tmp/stack_deploy_health.json
      return 0
    fi

    now="$(date +%s)"
    elapsed=$((now - start))
    if [[ "$elapsed" -ge "$HEALTH_TIMEOUT_SECONDS" ]]; then
      rm -f /tmp/stack_deploy_health.json
      return 1
    fi

    sleep "$HEALTH_INTERVAL_SECONDS"
  done
}

if [[ "$DRY_RUN" != "true" ]]; then
  require_cmd docker
  require_cmd curl
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Env file not found: $ENV_FILE" >&2
  exit 1
fi

if [[ "$RUN_VERIFY" == "true" ]]; then
  if [[ -z "$VERIFY_PROFILE" ]]; then
    if [[ "$MODE" == "production" ]]; then
      VERIFY_PROFILE="production"
    else
      VERIFY_PROFILE="development"
    fi
  fi

  log "Running pre-deploy verification"
  log "Verify profile: $VERIFY_PROFILE"
  verify_cmd=(./scripts/ops/verify-stack.sh --env-file "$ENV_FILE" --profile "$VERIFY_PROFILE")
  if [[ -n "$COMPOSE_PROJECT_NAME_VALUE" ]]; then
    verify_cmd+=(--project-name "$COMPOSE_PROJECT_NAME_VALUE")
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    printf "[DRY-RUN] "
    printf "%q " "${verify_cmd[@]}"
    printf "\n"
  else
    "${verify_cmd[@]}"
  fi
fi

log "Starting deployment in mode: $MODE"
log "Using env file: $ENV_FILE"
if [[ "$DRY_RUN" == "true" ]]; then
  log "Dry-run enabled: no command will be executed"
fi

log "Building and starting required services"
compose up -d --build app nginx postgres redis worker scheduler mailpit

if [[ "$MODE" == "production" ]]; then
  log "Installing backend dependencies (production mode, no-dev)"
  compose exec -T app composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader
else
  log "Installing backend dependencies (staging mode, with dev packages)"
  compose exec -T app composer install --no-interaction --prefer-dist
fi

log "Installing frontend dependencies and building assets"
compose run --rm --no-deps node sh -lc "corepack pnpm install --frozen-lockfile && corepack pnpm run build"

log "Running database migrations"
compose exec -T app php artisan migrate --force

if [[ "$MODE" == "staging" ]]; then
  log "Refreshing generated route bindings (staging only)"
  compose exec -T app php artisan wayfinder:generate --path=resources/js/lib/wayfinder
else
  log "Skipping wayfinder generation in production (requires dev dependency)"
fi

log "Optimizing Laravel caches"
compose exec -T app php artisan optimize:clear
compose exec -T app php artisan config:cache
compose exec -T app php artisan route:cache
compose exec -T app php artisan view:cache
compose exec -T app php artisan event:cache

if [[ "$MODE" == "staging" ]]; then
  log "Regenerating API documentation (staging only)"
  compose exec -T app php artisan l5-swagger:generate
else
  log "Skipping swagger generation in production (requires dev dependency)"
fi

log "Restarting queue workers and service containers"
compose exec -T app php artisan queue:restart || true
compose restart nginx worker scheduler

log "Service status"
compose ps

health_url="$(health_url_from_env)"
log "Waiting for health endpoint: $health_url"
if [[ "$DRY_RUN" == "true" ]]; then
  printf "[DRY-RUN] "
  printf "%q " curl -fsS "$health_url"
  printf "\n"
  log "Dry-run completed successfully"
  exit 0
elif wait_for_health "$health_url"; then
  echo
  log "Deployment completed successfully"
else
  echo
  log "Health check failed after ${HEALTH_TIMEOUT_SECONDS}s"
  exit 1
fi
