# Phase 5 - Authentication

## Implemented

### Internal Authentication

- Session-based auth via Laravel `web` guard
- Login/Register/Forgot Password via Breeze + Inertia setup
- `auth.user` is provided as an Inertia page prop
- Internal pages do not communicate through a separate API client

### External API Authentication

- `/api/v1/user` is protected with `auth:sanctum`
- `User` model uses Sanctum API tokens
- Token behavior is ENV-controlled (`SANCTUM_*`)

## Why Sanctum Was Chosen

- External consumers (mobile/integrations) require token-based auth.
- Internal app flows remain session-based and unchanged.
- Sanctum integrates natively with Laravel 13 and complements Inertia without conflict.

## Security Aspects

- No secrets in source code
- CORS limited to `api/v1/*`
- `SANCTUM_STATEFUL_DOMAINS` and token options documented in `.env.example`

## Result

Authentication is split into two clear paths:

- internal: session + Inertia
- external: token + REST (`/api/v1`)
