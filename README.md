# App Encuesta UISAU

Aplicación web para la gestión y aplicación de encuestas de satisfacción en hospitales nacionales.

Incluye:
- Backend API REST (`Node.js + Express + Sequelize + PostgreSQL`)
- Frontend SPA (`React + Vite + TailwindCSS + Zustand`)
- Panel administrativo con autenticación JWT
- Exportación de respuestas a CSV

## 1. Prerrequisitos

- Node.js `18+`
- npm `9+`
- PostgreSQL `14+`
- Windows 10/11 (probado en PowerShell)

Verificar versiones:

```powershell
node -v
npm -v
psql --version
```

## 2. Estructura del Proyecto

```text
UISAU/
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config/database.js
│       ├── controllers/
│       ├── middlewares/
│       ├── models/
│       ├── routes/
│       ├── seeders/runSeed.js
│       ├── services/exportService.js
│       └── utils/crypto.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── services/
│       ├── store/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
└── README.md
```

## 3. Configuración de Base de Datos

### 3.1 Crear base de datos

```powershell
psql -U postgres
```

```sql
CREATE DATABASE encuestas_satisfaccion;
\q
```

### 3.2 Configurar variables de entorno backend

Archivo: `backend/.env`

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=encuestas_satisfaccion
DB_USER=postgres
DB_PASSWORD=tu_password_postgres

JWT_SECRET=tu_jwt_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=tu_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

ENCRYPTION_KEY=ClaveSeguraExactaDe32Caracteres!

ADMIN_EMAIL=admin@dominio.tld
ADMIN_PASSWORD=__SET_STRONG_ADMIN_PASSWORD__
```

Notas:
- `ENCRYPTION_KEY` debe tener 32 caracteres para AES-256.
- Cambia secretos y contraseña admin en producción.

## 4. Instalación de Dependencias

### Backend

```powershell
cd c:\UISAU\backend
npm install
```

### Frontend

```powershell
cd c:\UISAU\frontend
npm install
```

## 5. Seeder Inicial (Encuesta + Admin)

Ejecutar:

```powershell
cd c:\UISAU\backend
npm run seed
```

Este comando crea/actualiza:
- Encuesta activa UISAU
- 30+ preguntas (incluyendo lógicas condicionales)
- Opciones Likert, recomendación y servicios de apoyo
- Usuario administrador inicial

Credenciales iniciales:
- Email: el valor configurado en `ADMIN_EMAIL`
- Password: el valor configurado en `ADMIN_PASSWORD`

No uses credenciales por defecto en producción.

## 6. Ejecución del Proyecto

### 6.1 Levantar backend

```powershell
cd c:\UISAU\backend
npm run dev
```

Backend disponible en: `http://localhost:3001`

Health check:
- `GET http://localhost:3001/api/health`

### 6.2 Levantar frontend

```powershell
cd c:\UISAU\frontend
npm run dev
```

Frontend disponible en: `http://localhost:5173`

## 7. Flujo de Uso

### Usuario encuesta
1. Abrir `http://localhost:5173`
2. Click en `Iniciar encuesta`
3. Completar pasos 1 a 10
4. Enviar encuesta

### Administrador
1. Abrir `http://localhost:5173/admin/login`
2. Iniciar sesión con credenciales admin
3. Revisar estadísticas y respuestas
4. Filtrar, ver detalle y exportar CSV

## 8. Endpoints Backend

### Auth
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/profile` (protegido)

### Encuesta pública
- `GET /api/encuesta/activa`
- `POST /api/encuesta/submit`

### Admin (JWT requerido)
- `GET /api/admin/stats`
- `GET /api/admin/respuestas`
- `GET /api/admin/respuestas/:id`
- `PATCH /api/admin/respuestas/:id/revisada`
- `GET /api/admin/respuestas/export`

## 9. Variables de Entorno Importantes

### Backend (`backend/.env`)
- `PORT`: puerto del backend
- `FRONTEND_URL`: origen permitido por CORS
- `DB_*`: conexión PostgreSQL
- `JWT_*`: firma y expiración de tokens
- `ENCRYPTION_KEY`: cifrado de teléfono
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`: usuario inicial del seeder

## 10. Build de Producción

### Frontend

```powershell
cd c:\UISAU\frontend
npm run build
npm run preview
```

### Backend

```powershell
cd c:\UISAU\backend
npm start
```

## 11. Troubleshooting

### Error: `password authentication failed for user "postgres"`
Causa: contraseña incorrecta en `DB_PASSWORD`.
Solución:
1. Verifica credenciales en `backend/.env`.
2. Prueba acceso manual:
   ```powershell
   psql -U postgres -h localhost -p 5432
   ```

### Error: `database "encuestas_satisfaccion" does not exist`
Causa: no se creó la base.
Solución: crearla con `CREATE DATABASE encuestas_satisfaccion;`.

### Error: `invalid key length` al enviar encuesta
Causa: `ENCRYPTION_KEY` no tiene longitud válida.
Solución: usar clave de 32 caracteres exactos.

### Error CORS en frontend
Causa: `FRONTEND_URL` no coincide.
Solución:
1. Confirmar `FRONTEND_URL=http://localhost:5173` en backend.
2. Reiniciar backend.

### Error 401 en panel admin
Causa común:
- token vencido
- backend reiniciado con secretos distintos
Solución:
1. Cerrar sesión y volver a login.
2. Verificar `JWT_SECRET` y `JWT_REFRESH_SECRET`.

### Puerto ocupado (`EADDRINUSE`)
Solución:
1. Cambiar `PORT` backend o puerto Vite.
2. O terminar proceso que usa el puerto.

### Seeder no inserta admin
Causa: usuario ya existe.
Solución:
- comportamiento esperado de `findOrCreate`.
- si deseas recrearlo, elimina el usuario manualmente en DB y corre seed otra vez.

## 12. Recomendaciones para Producción

- Cambiar todos los secretos JWT
- Cambiar password admin inicial
- Usar HTTPS y proxy reverse
- Limitar CORS a dominio real
- Habilitar backups de PostgreSQL
- Ejecutar migraciones versionadas (en vez de depender solo de `sync`)

## 13. Comandos Útiles (Resumen)

```powershell
# Backend
cd c:\UISAU\backend
npm install
npm run seed
npm run dev

# Frontend
cd c:\UISAU\frontend
npm install
npm run dev
npm run build
```
