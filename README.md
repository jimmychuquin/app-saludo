# App-Saludo Monorepo

Monorepo con dos servicios independientes:

- backend-saludo: API Spring Boot
- frontend-saludo: SPA Angular servida por Nginx

## Estructura

- backend-saludo/
- frontend-saludo/
- .github/workflows/ (CI para build/push selectivo)
- docker-compose.local.yml (entorno local)
- scripts/clean-workspace.ps1 (limpieza de artefactos generados)

## Flujo local recomendado

1. Levantar local con Docker:

```powershell
docker compose -f docker-compose.local.yml up -d --build
```

2. Ver estado:

```powershell
docker compose -f docker-compose.local.yml ps
```

3. Limpiar artefactos generados cuando sea necesario:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\clean-workspace.ps1
```

## Notas de calidad del repo

- No versionar artefactos generados (`target`, `node_modules`, `dist`, `.angular`).
- Mantener backend y frontend desacoplados para build/deploy independiente.
- El workflow de GitHub construye solo el servicio que cambió.

## CI/CD (GitHub Actions -> Docker Hub -> VPS)

El workflow [app-saludo-dockerhub.yml](.github/workflows/app-saludo-dockerhub.yml) hace:

- Build/push solo del servicio que cambie (backend o frontend).
- Retencion de solo 3 tags SHA por imagen en Docker Hub.
- Deploy automatico por SSH al VPS del servicio que cambio.
- Si el servicio existe en compose remoto, usa docker compose.
- Si no existe en compose pero existe el contenedor (ej. backend-saludo/frontend-saludo), lo recrea con la imagen nueva manteniendo la red Docker actual.

Secrets requeridos en GitHub (Settings -> Secrets and variables -> Actions):

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_PRIVATE_KEY`
- `VPS_PORT` (ejemplo: `22`)

El deploy remoto usa este compose en VPS:

- `/srv/platform/infra/compose/docker-compose.yml`

Servicios esperados en ese compose:

- `backend-saludo`
- `frontend-saludo`
