# Phase 9 - ENV Management and Operational Handover

## Implemented

- Complete `.env.example` is available
- Docker defaults align with service names (`postgres`, `redis`, `mailpit`)
- Security-relevant parameters are ENV-controlled (`API_ALLOWED_ORIGINS`, `SANCTUM_*`)

## Handover Steps After Clone

1. Create `.env`
2. Start containers
3. Generate app key
4. Run migrations

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate
```

Optional local demo login:

```bash
docker compose exec app php artisan db:seed --class=DemoUserSeeder
```

## Relevant Variables for First Startup

- App: `APP_NAME`, `APP_URL`, `APP_ENV`, `APP_DEBUG`
- Database: `DB_*`
- Redis/Queue/Session: `REDIS_*`, `QUEUE_CONNECTION`, `SESSION_DRIVER`, `CACHE_STORE`
- CORS/API: `API_ALLOWED_ORIGINS`, `SANCTUM_STATEFUL_DOMAINS`
- Mail: `MAIL_*`, `MAILPIT_*`
- Ports: `APP_PORT`, `VITE_PORT`, `FORWARD_DB_PORT`, `FORWARD_REDIS_PORT`

## Secret Handling

- `.env` remains unversioned.
- Secrets are not stored in source code or docs.
- Production environments should use external secret stores.

## Operational Check After Startup

- `docker compose ps`
- `curl http://localhost:8080/api/v1/health`
- Access `/`, `/login`, `/docs/api`
