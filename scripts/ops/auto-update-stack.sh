#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

APPLY="false"
SCOPE="all"
RUN_VERIFY="true"
VERIFY_PROFILE="development"
ENV_FILE=".env"
COMPOSE_PROJECT_NAME_VALUE=""

if [[ -t 1 ]]; then
  C_RESET='\033[0m'
  C_BOLD='\033[1m'
  C_BLUE='\033[34m'
  C_GREEN='\033[32m'
  C_YELLOW='\033[33m'
  C_RED='\033[31m'
else
  C_RESET=''
  C_BOLD=''
  C_BLUE=''
  C_GREEN=''
  C_YELLOW=''
  C_RED=''
fi

info() { printf "%b\n" "${C_BLUE}[INFO]${C_RESET} $1"; }
ok() { printf "%b\n" "${C_GREEN}[PASS]${C_RESET} $1"; }
warn() { printf "%b\n" "${C_YELLOW}[WARN]${C_RESET} $1"; }
fail() { printf "%b\n" "${C_RED}[FAIL]${C_RESET} $1"; }

usage() {
  cat <<'USAGE'
Usage: ./scripts/ops/auto-update-stack.sh [options]

Options:
  --apply                     Apply updates (default is dry-run preview only)
  --scope <all|node|php>      Update scope (default: all)
  --skip-verify               Skip verify-stack after apply
  --verify-profile <name>     Verify profile: development|production (default: development)
  --env-file <path>           Env file for docker compose (default: .env)
  --project-name <name>       Override COMPOSE_PROJECT_NAME for docker compose
  -h, --help                  Show help
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply)
      APPLY="true"
      shift
      ;;
    --scope)
      SCOPE="${2:-}"
      shift 2
      ;;
    --skip-verify)
      RUN_VERIFY="false"
      shift
      ;;
    --verify-profile)
      VERIFY_PROFILE="${2:-}"
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

if [[ "$SCOPE" != "all" && "$SCOPE" != "node" && "$SCOPE" != "php" ]]; then
  echo "Invalid scope: $SCOPE (allowed: all, node, php)" >&2
  exit 1
fi

if [[ "$VERIFY_PROFILE" != "development" && "$VERIFY_PROFILE" != "production" ]]; then
  echo "Invalid verify profile: $VERIFY_PROFILE (allowed: development, production)" >&2
  exit 1
fi

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    fail "Missing required command: $1"
    exit 1
  fi
}

compose() {
  local args=(docker compose --env-file "$ENV_FILE")

  if [[ -n "$COMPOSE_PROJECT_NAME_VALUE" ]]; then
    args+=(--project-name "$COMPOSE_PROJECT_NAME_VALUE")
  fi

  "${args[@]}" "$@"
}

node_container_running() {
  compose ps --services --status running 2>/dev/null | grep -qx 'node'
}

run_node_cmd() {
  local cmd="$1"

  if node_container_running; then
    compose exec -T node sh -lc "$cmd"
    return $?
  fi

  bash -lc "$cmd"
}

print_node_outdated() {
  info "Node outdated (direct dependencies)"
  run_node_cmd 'corepack pnpm outdated || true'
}

print_php_outdated() {
  info "Composer outdated (direct dependencies)"
  composer outdated --direct || true
}

apply_node_updates() {
  info "Applying Node updates to latest direct dependency versions"
  run_node_cmd 'corepack pnpm up --latest'
}

apply_php_updates() {
  info "Applying Composer updates with all dependencies"
  composer update --with-all-dependencies --no-interaction --prefer-dist
}

require_cmd docker
require_cmd composer

if [[ "$SCOPE" == "all" || "$SCOPE" == "node" ]]; then
  if ! command -v pnpm >/dev/null 2>&1 && ! node_container_running; then
    fail "pnpm not found on host and node container is not running"
    exit 1
  fi
fi

printf "%b\n" "${C_BOLD}Auto Update Stack${C_RESET}"
printf '%s\n' '----------------------------------------------------------------'
info "Mode: $( [[ "$APPLY" == "true" ]] && echo "apply" || echo "dry-run" )"
info "Scope: $SCOPE"

if [[ "$SCOPE" == "all" || "$SCOPE" == "node" ]]; then
  print_node_outdated
fi

if [[ "$SCOPE" == "all" || "$SCOPE" == "php" ]]; then
  print_php_outdated
fi

if [[ "$APPLY" != "true" ]]; then
  warn "Dry-run only. Re-run with --apply to execute updates."
  exit 0
fi

printf '%s\n' '----------------------------------------------------------------'
if [[ "$SCOPE" == "all" || "$SCOPE" == "node" ]]; then
  apply_node_updates
fi

if [[ "$SCOPE" == "all" || "$SCOPE" == "php" ]]; then
  apply_php_updates
fi

if [[ "$RUN_VERIFY" == "true" ]]; then
  printf '%s\n' '----------------------------------------------------------------'
  info "Running verification after update"
  ./scripts/ops/verify-stack.sh \
    --env-file "$ENV_FILE" \
    --project-name "$COMPOSE_PROJECT_NAME_VALUE" \
    --profile "$VERIFY_PROFILE"
fi

ok "Auto update completed"
