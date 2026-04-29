# Script para hacer backup de la base de datos PostgreSQL
# Uso: .\backup-database.ps1 -BackupPath "C:\ruta\donde\guardar"

param(
    [string]$BackupPath = "$PSScriptRoot\..\database-backup",
    [string]$Host = "localhost",
    [string]$Port = "5432",
    [string]$Username = "postgres",
    [string]$Password = "postgres",
    [string]$Database = "encuestas_satisfaccion"
)

# Crear carpeta de backup si no existe
if (-not (Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
    Write-Host "✓ Carpeta creada: $BackupPath" -ForegroundColor Green
}

# Generar nombre de archivo con timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$backupFile = "$BackupPath\$Database-backup-$timestamp.sql"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Iniciando backup de la base de datos..." -ForegroundColor Cyan
Write-Host "Base de datos: $Database" -ForegroundColor Yellow
Write-Host "Host: $Host" -ForegroundColor Yellow
Write-Host "Puerto: $Port" -ForegroundColor Yellow
Write-Host "Archivo de salida: $backupFile" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Variable de entorno para la contraseña (evita ser pedida interactivamente)
$env:PGPASSWORD = $Password

try {
    # Ejecutar pg_dump
    & pg_dump `
        --host=$Host `
        --port=$Port `
        --username=$Username `
        --format=plain `
        --no-password `
        --verbose `
        $Database | Out-File -FilePath $backupFile -Encoding UTF8

    # Verificar si se creó exitosamente
    if (Test-Path $backupFile) {
        $fileSize = (Get-Item $backupFile).Length / 1MB
        Write-Host "✓ Backup completado exitosamente" -ForegroundColor Green
        Write-Host "   Archivo: $(Split-Path $backupFile -Leaf)" -ForegroundColor Green
        Write-Host "   Tamaño: $([Math]::Round($fileSize, 2)) MB" -ForegroundColor Green
    } else {
        Write-Host "✗ Error: No se creó el archivo de backup" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "✗ Error durante el backup: $_" -ForegroundColor Red
    exit 1
}
finally {
    # Limpiar variable de entorno
    Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "1. Copia el archivo a tu memoria USB:"
Write-Host "   $backupFile" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. En el servidor destino, restaura la BD con:"
Write-Host "   psql -h localhost -U postgres -d encuestas_satisfaccion < backup.sql" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. O usa el script de restauración (restore-database.ps1)" -ForegroundColor Yellow
