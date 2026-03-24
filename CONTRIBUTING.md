# Contributing Guide

Thank you for your interest in this starter kit.
These guidelines keep contributions consistent, secure, and maintainable.

## Quick PR Checklist

- [ ] Scope is focused and relevant
- [ ] Linting and tests pass
- [ ] No secrets or environment-specific values were introduced
- [ ] Documentation was updated when behavior/config changed
- [ ] API/auth changes are documented and versioned correctly

## Core Principles

- Keep changes small and focused.
- Only introduce breaking changes with a clear migration description.
- Prefer existing patterns over parallel solutions.
- Never commit secrets, tokens, or production hostnames.

## Prerequisites

- Docker + Docker Compose
- Node.js 22 + pnpm
- PHP 8.3+ + Composer (only if working locally without containers)

## Local Development

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate
```

Optional local demo login:

```bash
docker compose exec app php artisan db:seed --class=DemoUserSeeder
```

## Quality Checks Before a Pull Request

```bash
./scripts/ops/verify-stack.sh --profile development
```

Or run checks separately:

```bash
pnpm run lint:frontend
pnpm run test:frontend
composer run lint:backend
composer run test:backend
```

## Architecture Rules

- Internal app flows remain Inertia-based (Controller -> Page Props).
- External REST endpoints exist exclusively under `/api/v1`.
- External API docs are maintained via OpenAPI attributes in API controllers.
- Icons are provided exclusively via `lucide-react`.
- Node packages are managed exclusively with `pnpm`.

## Branching and Commits

Recommended:

- Branch names: `feature/...`, `fix/...`, `chore/...`, `docs/...`
- Commits: clear, concise, contextual
- One PR should address one coherent topic

## Pull Request Expectations

Include the following in each PR:

- Short problem/solution summary
- Impact on API, ENV, or deployment
- Test evidence (commands run + results)
- Migration/rollback notes if needed
- Why this implementation was chosen over alternatives (if trade-offs exist)

## Keep Documentation Updated

If behavior, setup, ENV, routes, or operational workflows change, update:

- `README.md`
- `scripts/ops/README.md`
- `docs/architecture/*`

## License

By contributing, you agree that your code is published under this repository's MIT License.

## Contact

- GitHub: https://github.com/BFlassig
- LinkedIn: https://www.linkedin.com/in/benjaminflassig/
