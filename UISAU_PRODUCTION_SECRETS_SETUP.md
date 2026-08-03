# UISAU Production Secrets Setup

## Variables requeridas

Backend productivo:

- `NODE_ENV=production`
- `HOST`
- `PORT`
- `FRONTEND_URL`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_SECRET`
- `JWT_REFRESH_EXPIRES_IN`
- `ENCRYPTION_KEY`

Bootstrap administrativo inicial:

- `ADMIN_BOOTSTRAP_ENABLED=true` solo durante inicializacion controlada.
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Frontend productivo:

- `VITE_BACKEND_URL`

Compose/PostgreSQL:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

## Generacion segura

Use el script local:

`powershell -ExecutionPolicy Bypass -File .\scripts\generate-production-secrets.ps1 -OutputPath C:\secure\uisau-prod-secrets.env`

O copie al portapapeles:

`powershell -ExecutionPolicy Bypass -File .\scripts\generate-production-secrets.ps1 -CopyToClipboard`

El script genera secretos criptograficamente seguros, no imprime valores en consola y no permite guardar dentro del repositorio.

## Dónde configurarlos

- Configure los secretos reales solo en el servidor o en el mecanismo seguro de despliegue.
- No versionar `.env.production`.
- Use `.env.production.example` solo como plantilla estructural.

## Orden recomendado de rotacion

1. `ADMIN_PASSWORD` si el bootstrap inicial sigue habilitado.
2. `DB_PASSWORD` junto con actualizacion coordinada de PostgreSQL y backend.
3. `JWT_SECRET` y `JWT_REFRESH_SECRET` en la misma ventana operativa.
4. `ENCRYPTION_KEY` solo despues de validar estrategia de migracion segura.
5. `PGADMIN_DEFAULT_PASSWORD` solo si pgAdmin existe fuera del stack publico productivo.

## Reinicios necesarios

- Cambio en secretos del backend: recrear `backend`.
- Cambio en secretos del seeder: recrear `backend-seed` solo si se usa nuevamente.
- Cambio en `VITE_BACKEND_URL`: rebuild y recreate de `frontend`.
- Cambio en credenciales de PostgreSQL: recrear `postgres` y `backend` de forma coordinada.

## Validaciones posteriores

- `docker compose --env-file .env.production -f docker-compose.prod.yml config`
- `docker compose --env-file .env.production -f docker-compose.prod.yml ps`
- Backend health `200`
- Frontend `200`
- PostgreSQL `healthy`
- Login, refresh, profile, encuesta activa, submit controlado y exportaciones CSV/XLSX

## Manejo de ENCRYPTION_KEY

- No rotarla a ciegas.
- Actualmente protege `telefono_encriptado` en `respuestas_encabezado`.
- Si existen datos cifrados, planificar una de estas estrategias antes del cambio:
  - conservar temporalmente la clave actual como secreto protegido;
  - migracion decrypt-old/encrypt-new;
  - soporte temporal dual old/new con versionado del formato.

## Archivos que nunca deben versionarse

- `.env.production`
- secretos exportados por el generador
- dumps SQL, backups `.backup` y artefactos historicos