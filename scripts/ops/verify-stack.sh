#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE=".env"
STRICT_UPDATES="false"
COMPOSE_PROJECT_NAME_VALUE=""
PROFILE="development"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --env-file)
      ENV_FILE="${2:-}"
      shift 2
      ;;
    --strict-updates)
      STRICT_UPDATES="true"
      shift
      ;;
    --project-name)
      COMPOSE_PROJECT_NAME_VALUE="${2:-}"
      shift 2
      ;;
    --profile)
      PROFILE="${2:-}"
      shift 2
      ;;
    -h|--help)
      cat <<'USAGE'
Usage: ./scripts/ops/verify-stack.sh [options]

Options:
  --env-file <path>      Use a specific env file for docker compose (default: .env)
  --strict-updates       Treat outdated dependencies as failures instead of warnings
  --project-name <name>  Override COMPOSE_PROJECT_NAME for docker compose commands
  --profile <name>       Verification profile: development|production (default: development)
  -h, --help             Show help
USAGE
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

if [[ "$PROFILE" != "development" && "$PROFILE" != "production" ]]; then
  echo "Invalid profile: $PROFILE (allowed: development, production)" >&2
  exit 1
fi

FAILURES=0
WARNINGS=0
INFOS=0
STEP=0
WARN_MESSAGES=""
FAIL_MESSAGES=""

if [[ -t 1 ]]; then
  C_RESET='\033[0m'
  C_BOLD='\033[1m'
  C_BLUE='\033[34m'
  C_GREEN='\033[32m'
  C_YELLOW='\033[33m'
  C_RED='\033[31m'
  C_CYAN='\033[36m'
else
  C_RESET=''
  C_BOLD=''
  C_BLUE=''
  C_GREEN=''
  C_YELLOW=''
  C_RED=''
  C_CYAN=''
fi

separator() {
  printf "%b\n" "${C_BLUE}----------------------------------------------------------------${C_RESET}"
}

headline() {
  separator
  printf "%b\n" "${C_BOLD}${C_CYAN}$1${C_RESET}"
  separator
}

info() {
  INFOS=$((INFOS + 1))
  printf "%b\n" "${C_CYAN}[INFO]${C_RESET} $1"
}

ok() {
  printf "%b\n" "${C_GREEN}[PASS]${C_RESET} $1"
}

warn() {
  WARNINGS=$((WARNINGS + 1))
  WARN_MESSAGES+=$'\n'"- $1"
  printf "%b\n" "${C_YELLOW}[WARN]${C_RESET} $1"
}

fail() {
  FAILURES=$((FAILURES + 1))
  FAIL_MESSAGES+=$'\n'"- $1"
  printf "%b\n" "${C_RED}[FAIL]${C_RESET} $1"
}

run_step() {
  local name="$1"
  shift
  STEP=$((STEP + 1))
  printf "\n%b\n" "${C_BOLD}${C_BLUE}[STEP ${STEP}]${C_RESET} ${name}"
  if "$@"; then
    ok "$name"
  else
    fail "$name"
  fi
}

compose() {
  local args=(docker compose --env-file "$ENV_FILE")

  if [[ -n "$COMPOSE_PROJECT_NAME_VALUE" ]]; then
    args+=(--project-name "$COMPOSE_PROJECT_NAME_VALUE")
  fi

  "${args[@]}" "$@"
}

app_container_running() {
  compose ps --services --status running 2>/dev/null | grep -qx 'app'
}

print_versions() {
  php -v | head -n 1
  composer --version
  node -v
  pnpm -v
  docker compose version
}

check_compose_services() {
  compose config --services
}

check_outdated_php() {
  local out
  if ! out="$(composer outdated --direct 2>&1)"; then
    echo "$out"
    return 1
  fi

  echo "$out"
  if grep -qi "All your direct dependencies are up to date" <<<"$out"; then
    ok "Composer direct dependencies are up to date"
    return 0
  fi

  if [[ "$STRICT_UPDATES" == "true" ]]; then
    fail "Composer direct dependencies have updates available"
    return 1
  fi

  warn "Composer direct dependencies have updates available"
  return 0
}

check_outdated_node() {
  local out
  out="$(pnpm outdated 2>&1)"
  local code=$?

  if [[ $code -eq 0 ]]; then
    echo "$out"
    ok "pnpm dependencies are up to date"
    return 0
  fi

  if [[ $code -eq 1 ]]; then
    echo "$out"
    if [[ "$STRICT_UPDATES" == "true" ]]; then
      fail "pnpm dependencies have updates available"
      return 1
    fi

    warn "pnpm dependencies have updates available"
    return 0
  fi

  echo "$out"
  return 1
}

run_backend_lint() {
  local can_run="false"

  if app_container_running; then
    if compose exec -T app sh -lc 'test -x vendor/bin/pint' >/dev/null 2>&1; then
      can_run="true"
      compose exec -T app composer run lint:backend
      return $?
    fi

    info "app container has no dev tooling (pint); falling back to host backend lint"
  fi

  if test -x vendor/bin/pint; then
    can_run="true"
  fi

  if [[ "$can_run" == "true" ]]; then
    composer run lint:backend
    return $?
  fi

  warn "Skipping backend lint: laravel/pint is not installed (run composer install with dev dependencies)"
  return 0
}

run_backend_tests() {
  local can_run="false"

  if app_container_running; then
    if compose exec -T app sh -lc 'php artisan list --raw | grep -q "^test "' >/dev/null 2>&1; then
      can_run="true"
      compose exec -T app php artisan optimize:clear >/dev/null
      compose exec -T \
        -e APP_ENV=testing \
        -e DB_CONNECTION=sqlite \
        -e DB_DATABASE=':memory:' \
        -e CACHE_STORE=array \
        -e SESSION_DRIVER=array \
        -e QUEUE_CONNECTION=sync \
        -e MAIL_MAILER=array \
        app php artisan test
      return $?
    fi

    info "app container has no test command (likely --no-dev); falling back to host backend tests"
  fi

  if php artisan list --raw | grep -q "^test " >/dev/null 2>&1; then
    can_run="true"
  fi

  if [[ "$can_run" == "true" ]]; then
    php artisan optimize:clear >/dev/null
    composer run test:backend
    return $?
  fi

  warn "Skipping backend tests: test command is unavailable (run composer install with dev dependencies)"
  return 0
}

check_app_health_if_running() {
  local app_port="${APP_PORT:-8080}"

  if ! compose ps --status running | grep -q "nginx"; then
    info "nginx container is not running; HTTP health check skipped"
    return 0
  fi

  if ! curl -fsS "http://localhost:${app_port}/api/v1/health" >/tmp/stack_health_check.json 2>/dev/null; then
    rm -f /tmp/stack_health_check.json
    return 1
  fi

  local body
  body="$(cat /tmp/stack_health_check.json)"
  rm -f /tmp/stack_health_check.json

  if grep -q '"status"[[:space:]]*:[[:space:]]*"ok"' <<<"$body" && grep -q '"version"[[:space:]]*:[[:space:]]*"v1"' <<<"$body"; then
    echo "$body"
    return 0
  fi

  echo "$body"
  return 1
}

headline "Stack Verification"
info "Active profile: ${PROFILE}"
run_step "Toolchain versions" print_versions
run_step "Compose configuration" check_compose_services
run_step "PHP dependencies up-to-date check" check_outdated_php
run_step "Node dependencies up-to-date check" check_outdated_node
run_step "Frontend lint" pnpm run lint:frontend
run_step "Frontend tests" pnpm run test:frontend

if [[ "$PROFILE" == "development" ]]; then
  run_step "Backend lint" run_backend_lint
  run_step "Backend tests" run_backend_tests
else
  info "Skipping backend lint in production profile (dev dependency: laravel/pint)"
  info "Skipping backend tests in production profile (dev dependencies: pest/phpunit tooling)"
fi

run_step "API health check (if running)" check_app_health_if_running

headline "Summary"
printf "Steps:    %d\n" "$STEP"
printf "Infos:    %d\n" "$INFOS"
printf "Warnings: %d\n" "$WARNINGS"
printf "Failures: %d\n" "$FAILURES"

if [[ -n "$WARN_MESSAGES" ]]; then
  printf "\n%b\n" "${C_YELLOW}Warning details:${C_RESET}"
  printf "%s\n" "${WARN_MESSAGES#"$'\n'"}"
fi

if [[ -n "$FAIL_MESSAGES" ]]; then
  printf "\n%b\n" "${C_RED}Failure details:${C_RESET}"
  printf "%s\n" "${FAIL_MESSAGES#"$'\n'"}"
fi

if [[ $FAILURES -gt 0 ]]; then
  printf "\n%b\n" "${C_RED}${C_BOLD}Verification finished with failures.${C_RESET}"
  exit 1
fi

printf "\n%b\n" "${C_GREEN}${C_BOLD}Verification finished successfully.${C_RESET}"
exit 0
