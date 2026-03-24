# Phase 8 - GitHub Actions / CI

## Status

This phase is **intentionally not implemented technically** in this repository.
The decision is to keep CI setup adaptable per target organization.

## Current Documented State

- No workflow files under `.github/workflows`
- Quality checks are performed locally/operationally via:
  - `./scripts/ops/verify-stack.sh`
  - `pnpm run lint` / `pnpm run test`
  - `composer run lint:backend` / `composer run test:backend`

## Consequence

The starter kit stays CI-neutral by default.
Teams can add GitHub Actions, GitLab CI, Jenkins, or other systems without conflicts.
