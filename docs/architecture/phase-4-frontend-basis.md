# Phase 4 - React Frontend Baseline

## Implemented

- React 19 + TypeScript + Vite
- Inertia 2 for internal navigation and data transfer
- Tailwind CSS 4 + shadcn/ui
- Lucide React as the only icon library
- Small separate API client exclusively for external `/api/v1` calls

## Frontend Structure (Current State)

- Entry point: `resources/js/app.tsx`
- Pages: `resources/js/Pages/**`
- Layouts: `resources/js/Layouts/**`
- UI primitives: `resources/js/components/ui/**`
- Shared components: `resources/js/components/shared/**`
- External API helpers: `resources/js/lib/api/**`
- Icons: `resources/js/lib/icons/lucide.ts`
- Wayfinder output: `resources/js/lib/wayfinder/**`

## Routing and Data Flow

- Internal pages are rendered via Inertia from Laravel controllers.
- Internal flows use **no** generic REST client.
- External API communication is isolated in `resources/js/lib/api`.

## Frontend Tests

- Vitest is configured.
- Representative test exists: `resources/js/tests/components/status-chip.test.tsx`

## Welcome Page Specifics

The welcome page provides a runtime overview with status for:

- PostgreSQL
- Redis
- Queue
- Mail
- enabled modules
- grouped links to core pages/endpoints
