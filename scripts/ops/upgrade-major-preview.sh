#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

APPLY="false"
STRICT="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --apply)
      APPLY="true"
      shift
      ;;
    --strict)
      STRICT="true"
      shift
      ;;
    -h|--help)
      cat <<'USAGE'
Usage: ./scripts/ops/upgrade-major-preview.sh [options]

Options:
  --apply   Apply major updates if no hard blockers are detected
  --strict  Fail on any available update (not only hard blockers)
  -h,--help Show help
USAGE
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

if [[ -t 1 ]]; then
  C_RESET='\033[0m'; C_BOLD='\033[1m'; C_BLUE='\033[34m'; C_GREEN='\033[32m'; C_YELLOW='\033[33m'; C_RED='\033[31m';
else
  C_RESET=''; C_BOLD=''; C_BLUE=''; C_GREEN=''; C_YELLOW=''; C_RED='';
fi

info() { printf "%b\n" "${C_BLUE}[INFO]${C_RESET} $1"; }
ok() { printf "%b\n" "${C_GREEN}[PASS]${C_RESET} $1"; }
warn() { printf "%b\n" "${C_YELLOW}[WARN]${C_RESET} $1"; }
fail() { printf "%b\n" "${C_RED}[FAIL]${C_RESET} $1"; }

HARD_BLOCKERS=0
SOFT_UPDATES=0

echo "${C_BOLD}Major Upgrade Preview${C_RESET}"
printf '%s\n' '----------------------------------------------------------------'

info "Collecting outdated direct Node dependencies"
OUTDATED_TABLE="$(pnpm outdated 2>&1 || true)"

if grep -q "Package" <<<"$OUTDATED_TABLE"; then
  echo "$OUTDATED_TABLE"
  SOFT_UPDATES=1
else
  ok "No outdated direct Node dependencies"
fi

printf '%s\n' '----------------------------------------------------------------'
info "Checking known peer blockers"

RHOOKS_PEER="$(pnpm info eslint-plugin-react-hooks@latest peerDependencies --json 2>/dev/null || echo '{}')"
if grep -q '"eslint"' <<<"$RHOOKS_PEER" && ! grep -q '\^10\.0\.0' <<<"$RHOOKS_PEER"; then
  HARD_BLOCKERS=$((HARD_BLOCKERS + 1))
  fail "eslint 10 blocked by eslint-plugin-react-hooks peer range"
else
  ok "No hard blocker detected for eslint 10 via eslint-plugin-react-hooks"
fi

TSESLINT_PEER="$(pnpm info typescript-eslint@latest peerDependencies --json 2>/dev/null || echo '{}')"
if grep -q '"typescript"' <<<"$TSESLINT_PEER" && grep -q '<6\.0\.0' <<<"$TSESLINT_PEER"; then
  HARD_BLOCKERS=$((HARD_BLOCKERS + 1))
  fail "TypeScript 6 blocked by typescript-eslint peer range"
else
  ok "No hard blocker detected for TypeScript 6 via typescript-eslint"
fi

printf '%s\n' '----------------------------------------------------------------'
info "Checking Composer direct dependencies"
COMPOSER_OUTDATED="$(composer outdated --direct 2>&1 || true)"
if grep -qi "All your direct dependencies are up to date" <<<"$COMPOSER_OUTDATED"; then
  ok "Composer direct dependencies are up to date"
else
  SOFT_UPDATES=1
  warn "Composer direct dependencies have updates available"
  echo "$COMPOSER_OUTDATED"
fi

printf '%s\n' '----------------------------------------------------------------'
printf "Hard blockers: %d\n" "$HARD_BLOCKERS"
printf "Soft updates: %d\n" "$SOFT_UPDATES"

if [[ "$APPLY" == "true" ]]; then
  if [[ $HARD_BLOCKERS -gt 0 ]]; then
    fail "Cannot apply major update automatically due to hard blockers"
    exit 1
  fi

  info "Applying latest direct Node updates"
  pnpm up --latest

  info "Re-running frontend quality checks"
  pnpm run lint:frontend
  pnpm run test:frontend
  pnpm run build

  ok "Major update apply completed"
  exit 0
fi

if [[ "$STRICT" == "true" ]]; then
  if [[ $HARD_BLOCKERS -gt 0 || $SOFT_UPDATES -gt 0 ]]; then
    fail "Strict mode failed: updates pending or blocked"
    exit 1
  fi
fi

if [[ $HARD_BLOCKERS -gt 0 ]]; then
  warn "Major upgrades are currently constrained by upstream peer dependencies"
  warn "Run this preview again after upstream packages release updated peer ranges"
fi

ok "Preview completed"
