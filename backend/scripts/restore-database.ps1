# Script para restaurar la base de datos desde un backup
# Uso: .\restore-database.ps1 -BackupFilePath "C:\ruta\al\archivo.sql"

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupFilePath,
    [string]$Host = "localhost",
    [string]$Port = "5432",
    [string]$Username = "postgres",
    [string]$Password = "postgres",
    [string]$Database = "encuestas_satisfaccion"
)

# Validar que el archivo existe
if (-not (Test-Path $BackupFilePath)) {
    Write-Host "✗ Error: El archivo de backup no encontrado: $BackupFilePath" -ForegroundColor Red
    exit 1
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Iniciando restauración de la base de datos..." -ForegroundColor Cyan
Write-Host "Archivo: $(Split-Path $BackupFilePath -Leaf)" -ForegroundColor Yellow
Write-Host "Base de datos: $Database" -ForegroundColor Yellow
Write-Host "Host: $Host" -ForegroundColor Yellow
Write-Host "Puerto: $Port" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  ADVERTENCIA: Esto eliminará todos los datos actuales de '$Database'" -ForegroundColor Red
$confirmation = Read-Host "¿Deseas continuar? (escribe 'si' para confirmar)"

if ($confirmation -ne "si") {
    Write-Host "Operación cancelada." -ForegroundColor Yellow
    exit 0
}

$env:PGPASSWORD = $Password

try {
    Write-Host ""
    Write-Host "Eliminando base de datos existente..." -ForegroundColor Yellow
    & dropdb --host=$Host --port=$Port --username=$Username --no-password $Database 2>$null
    
    Write-Host "Creando base de datos vacía..." -ForegroundColor Yellow
    & createdb --host=$Host --port=$Port --username=$Username --no-password $Database
    
    Write-Host "Restaurando datos..." -ForegroundColor Yellow
    $fileContent = Get-Content -Path $BackupFilePath -Raw
    $fileContent | & psql --host=$Host --port=$Port --username=$Username --no-password $Database
    
    Write-Host ""
    Write-Host "✓ Restauración completada exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Base de datos '$Database' ha sido restaurada en $Host" -ForegroundColor Green
}
catch {
    Write-Host "✗ Error durante la restauración: $_" -ForegroundColor Red
    exit 1
}
finally {
    Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Puedes iniciar el servidor con: npm start" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
