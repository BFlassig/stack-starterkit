# Phase 6 - Swagger / OpenAPI

## Implemented

- Integration via `darkaonline/l5-swagger`
- OpenAPI definition for external API under `/api/v1`
- UI endpoint: `/docs/api`
- JSON endpoint: `/docs/api-docs`

## Technical Implementation

- Annotation scan is limited to external API areas:
  - `app/OpenApi`
  - `app/Http/Controllers/Api/V1`
- Global API metadata is defined in `app/OpenApi/OpenApiSpec.php`
- Security scheme `sanctum` is documented

## Why This Scope

- Internal Inertia pages intentionally remain outside API specification.
- External consumers get a clear, versioned contract view.

## Maintenance Workflow

Regenerate documentation:

```bash
php artisan l5-swagger:generate
```

In deploy script:

- `staging`: generation enabled
- `production`: generation intentionally skipped (dev dependency)
