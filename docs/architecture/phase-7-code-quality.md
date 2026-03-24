# Phase 7 - Linting, Standards, and Code Quality

## Implemented

### Frontend

- ESLint flat config
- Vitest as test baseline
- Type checking via `tsc`

Key commands:

```bash
pnpm run lint:frontend
pnpm run lint:frontend:fix
pnpm run test:frontend
pnpm run typecheck
```

### Backend

- Laravel Pint as format/style gate
- Pest as test baseline

Key commands:

```bash
composer run lint:backend
composer run lint:backend:fix
composer run test:backend
```

### Combined Checks

```bash
pnpm run lint
pnpm run test
./scripts/ops/verify-stack.sh
```

## Result

Quality checks are reproducible both locally and through the ops scripts.
