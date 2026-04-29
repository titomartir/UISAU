# Guía: Copiar Base de Datos a Memoria USB

## 📋 Requisitos Previos

- **PostgreSQL** instalado en ambos equipos (cliente y servidor)
- Las ferramentas de CLI: `pg_dump`, `createdb`, `dropdb`, `psql`
- Acceso a la base de datos (usuario y contraseña)

Para verificar que PostgreSQL CLI está disponible:
```powershell
pg_dump --version
psql --version
createdb --version
dropdb --version
```

---

## 🔄 PASO 1: Hacer Backup en Tu Equipo (Actual)

### Opción A: Usando el Script automatizado (recomendado)

```powershell
cd c:\UISAU\backend\scripts
.\backup-database.ps1
```

El script creará un archivo SQL con la fecha actual en la carpeta `database-backup`

### Opción B: Comando manual

Si prefieres más control, ejecuta en PowerShell:

```powershell
# Asegúrate de estar en cualquier carpeta
$env:PGPASSWORD = "postgres"
pg_dump -h localhost -U postgres -p 5432 encuestas_satisfaccion > "C:\backup-database.sql"
Remove-Item env:PGPASSWORD
```

**Resultado esperado:** Archivo `encuestas_satisfaccion-backup-YYYY-MM-DD-HHMMSS.sql`

---

## 💾 PASO 2: Copiar a Memoria USB

1. Busca el archivo de backup (por defecto en `c:\UISAU\database-backup\`)
2. Copia el archivo `.sql` a tu memoria USB
3. También copia el script `restore-database.ps1` si quieres facilitar la restauración

---

## 🖥️ PASO 3: Restaurar en el Servidor

En el equipo servidor:

### Opción A: Con el script

```powershell
# Copia los archivos de USB a una carpeta (ej: C:\temp\)
cd c:\UISAU\backend\scripts

# O si estás en otra ubicación:
.\restore-database.ps1 -BackupFilePath "C:\ruta\al\backup.sql"
```

### Opción B: Comando manual

```powershell
# Establece la contraseña
$env:PGPASSWORD = "postgres"

# Elimina la base de datos antigua (opcional, si existe)
dropdb -h localhost -U postgres encuestas_satisfaccion

# Crea la base de datos vacía
createdb -h localhost -U postgres encuestas_satisfaccion

# Restaura los datos desde el archivo
psql -h localhost -U postgres encuestas_satisfaccion < "C:\ruta\al\backup.sql"

# Limpia la variable
Remove-Item env:PGPASSWORD
```

---

## ⚙️ Personalizar Credenciales

Si tus credenciales son diferentes a las predeterminadas, edita el script:

**En `backup-database.ps1`:**
```powershell
.\backup-database.ps1 `
    -Host "192.168.1.100" `
    -Port "5432" `
    -Username "tu_usuario" `
    -Password "tu_contraseña" `
    -Database "tu_base_datos"
```

**En `restore-database.ps1`:**
```powershell
.\restore-database.ps1 `
    -BackupFilePath "C:\ruta\backup.sql" `
    -Host "servidor.com" `
    -Port "5432" `
    -Username "tu_usuario" `
    -Password "tu_contraseña" `
    -Database "encuestas_satisfaccion"
```

---

## ✅ Verificar que la Restauración Fue Exitosa

```powershell
$env:PGPASSWORD = "postgres"
psql -h localhost -U postgres -d encuestas_satisfaccion -c "\dt"
Remove-Item env:PGPASSWORD
```

Deberías ver las tablas:
- `Usuario`
- `Encuesta`
- `Pregunta`
- `OpcionRespuesta`
- `RespuestaEncabezado`
- `RespuestaDetalle`

---

## 🔍 Solución de Problemas

### "pg_dump: command not found"
PostgreSQL CLI no está en el PATH. Opción:
1. Instala PostgreSQL (incluye las CLI tools)
2. O ubica `pg_dump.exe` (típicamente en `C:\Program Files\PostgreSQL\15\bin\`)

### "Fatal: password authentication failed"
Credenciales incorrectas. Verifica en tu `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_contraseña_real
DB_NAME=encuestas_satisfaccion
```

### "Database doesn't exist"
Crea la base de datos primero:
```powershell
$env:PGPASSWORD = "postgres"
createdb -h localhost -U postgres encuestas_satisfaccion
Remove-Item env:PGPASSWORD
```

### El archivo SQL es muy grande
Si el archivo .sql excede la capacidad de USB:
- Usa un USB de mayor capacidad
- O comprime con: `Compress-Archive -Path backup.sql -DestinationPath backup.zip`

---

## 📦 Contenido de la Carpeta de Backup

```
database-backup/
├── encuestas_satisfaccion-backup-2024-01-15-143022.sql
├── restore-database.ps1
└── README.md (este archivo)
```

---

## 🚀 Resumido en 5 Pasos

| Paso | Comando | Equipo |
|------|---------|--------|
| 1 | `.\backup-database.ps1` | Equipo Actual |
| 2 | Copiar `.sql` a USB | USB |
| 3 | Copiar USB a `C:\temp\` | Servidor |
| 4 | `.\restore-database.ps1 -BackupFilePath...` | Servidor |
| 5 | `npm start` | Servidor |

