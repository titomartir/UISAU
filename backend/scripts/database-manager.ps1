# Script interactivo para gestionar backups de base de datos
# Uso: .\database-manager.ps1

Write-Host @"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      📊 GESTOR DE BASE DE DATOS - ENCUESTA UISAU      
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"@ -ForegroundColor Cyan

# Variables por defecto
$host_default = "localhost"
$port_default = "5432"
$user_default = "postgres"
$password_default = "postgres"
$database_default = "encuestas_satisfaccion"

while ($true) {
    Write-Host ""
    Write-Host "¿Qué deseas hacer?" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Crear backup de la base de datos (para USB)" -ForegroundColor Green
    Write-Host "2. Restaurar backup desde USB" -ForegroundColor Green
    Write-Host "3. Ver backups existentes" -ForegroundColor Cyan
    Write-Host "4. Configurar credenciales personalizadas" -ForegroundColor Cyan
    Write-Host "5. Salir" -ForegroundColor Gray
    Write-Host ""
    
    $choice = Read-Host "Selecciona una opción (1-5)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
            Write-Host "INICIANDO BACKUP" -ForegroundColor Green
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
            
            Write-Host "Presiona ENTER para usar valores por defecto:" -ForegroundColor Gray
            Write-Host ""
            
            $inputHost = Read-Host "Host [$host_default]"
            $host_final = if ($inputHost) { $inputHost } else { $host_default }
            
            $inputPort = Read-Host "Puerto [$port_default]"
            $port_final = if ($inputPort) { $inputPort } else { $port_default }
            
            $inputUser = Read-Host "Usuario [$user_default]"
            $user_final = if ($inputUser) { $inputUser } else { $user_default }
            
            Write-Host "Contraseña (no se muestra):"
            $secPassword = Read-Host -AsSecureString
            $password_final = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($secPassword))
            
            $inputDatabase = Read-Host "Base de datos [$database_default]"
            $database_final = if ($inputDatabase) { $inputDatabase } else { $database_default }
            
            Write-Host ""
            Write-Host "Creando backup..." -ForegroundColor Yellow
            
            $backupPath = "$PSScriptRoot\..\database-backup"
            if (-not (Test-Path $backupPath)) {
                New-Item -ItemType Directory -Path $backupPath -Force | Out-Null
            }
            
            $timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
            $backupFile = "$backupPath\$database_final-backup-$timestamp.sql"
            
            $env:PGPASSWORD = $password_final
            
            try {
                & pg_dump `
                    --host=$host_final `
                    --port=$port_final `
                    --username=$user_final `
                    --format=plain `
                    --no-password `
                    $database_final | Out-File -FilePath $backupFile -Encoding UTF8
                
                if (Test-Path $backupFile) {
                    $fileSize = (Get-Item $backupFile).Length / 1MB
                    Write-Host ""
                    Write-Host "✓ ¡BACKUP COMPLETADO EXITOSAMENTE!" -ForegroundColor Green
                    Write-Host "  Archivo: $(Split-Path $backupFile -Leaf)" -ForegroundColor White
                    Write-Host "  Tamaño: $([Math]::Round($fileSize, 2)) MB" -ForegroundColor White
                    Write-Host "  Ubicación: $backupPath" -ForegroundColor Cyan
                    Write-Host ""
                    Write-Host "📝 PRÓXIMOS PASOS:" -ForegroundColor Yellow
                    Write-Host "   1. Abre la carpeta: $backupPath" -ForegroundColor Yellow
                    Write-Host "   2. Copia el archivo .sql a tu memoria USB" -ForegroundColor Yellow
                    Write-Host "   3. Usa la opción 2 en otro equipo para restaurar" -ForegroundColor Yellow
                } else {
                    Write-Host "✗ Error: No se creó el archivo" -ForegroundColor Red
                }
            }
            catch {
                Write-Host "✗ Error: $_" -ForegroundColor Red
                Write-Host ""
                Write-Host "Verifica:" -ForegroundColor Yellow
                Write-Host "  • PostgreSQL CLI esté instalado" -ForegroundColor Yellow
                Write-Host "  • Las credenciales sean correctas" -ForegroundColor Yellow
                Write-Host "  • El host sea accesible" -ForegroundColor Yellow
            }
            finally {
                Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
            }
        }
        
        "2" {
            Write-Host ""
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
            Write-Host "RESTAURAR BACKUP" -ForegroundColor Yellow
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
            
            $backupFile = Read-Host "Ruta del archivo .sql (ej: C:\USB\backup.sql)"
            
            if (-not (Test-Path $backupFile)) {
                Write-Host "✗ Archivo no encontrado: $backupFile" -ForegroundColor Red
                continue
            }
            
            Write-Host ""
            $inputHost = Read-Host "Host [$host_default]"
            $host_final = if ($inputHost) { $inputHost } else { $host_default }
            
            $inputPort = Read-Host "Puerto [$port_default]"
            $port_final = if ($inputPort) { $inputPort } else { $port_default }
            
            $inputUser = Read-Host "Usuario [$user_default]"
            $user_final = if ($inputUser) { $inputUser } else { $user_default }
            
            Write-Host "Contraseña (no se muestra):"
            $secPassword = Read-Host -AsSecureString
            $password_final = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($secPassword))
            
            $inputDatabase = Read-Host "Base de datos [$database_default]"
            $database_final = if ($inputDatabase) { $inputDatabase } else { $database_default }
            
            Write-Host ""
            Write-Host "⚠️  ADVERTENCIA" -ForegroundColor Red
            Write-Host "Esto ELIMINARÁ todos los datos actuales de '$database_final'" -ForegroundColor Red
            $confirm = Read-Host "¿Deseas continuar? (escribe 'SI' para confirmar)"
            
            if ($confirm -ne "SI") {
                Write-Host "Operación cancelada." -ForegroundColor Yellow
                continue
            }
            
            $env:PGPASSWORD = $password_final
            
            try {
                Write-Host "Eliminando base de datos existente..." -ForegroundColor Yellow
                & dropdb --host=$host_final --port=$port_final --username=$user_final --no-password $database_final 2>$null
                
                Write-Host "Creando base de datos nueva..." -ForegroundColor Yellow
                & createdb --host=$host_final --port=$port_final --username=$user_final --no-password $database_final
                
                Write-Host "Restaurando datos..." -ForegroundColor Yellow
                $fileContent = Get-Content -Path $backupFile -Raw
                $fileContent | & psql --host=$host_final --port=$port_final --username=$user_final --no-password $database_final
                
                Write-Host ""
                Write-Host "✓ ¡RESTAURACIÓN COMPLETADA!" -ForegroundColor Green
                Write-Host "  Base de datos: $database_final" -ForegroundColor White
                Write-Host "  Host: $host_final" -ForegroundColor White
                Write-Host ""
                Write-Host "🚀 Ya puedes iniciar el servidor:" -ForegroundColor Cyan
                Write-Host "   npm start" -ForegroundColor Cyan
            }
            catch {
                Write-Host "✗ Error en la restauración: $_" -ForegroundColor Red
            }
            finally {
                Remove-Item env:PGPASSWORD -ErrorAction SilentlyContinue
            }
        }
        
        "3" {
            Write-Host ""
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
            Write-Host "BACKUPS DISPONIBLES" -ForegroundColor Cyan
            Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
            
            $backupPath = "$PSScriptRoot\..\database-backup"
            
            if (-not (Test-Path $backupPath)) {
                Write-Host "No hay backups aún. Crea uno primero." -ForegroundColor Yellow
            } else {
                $backups = Get-ChildItem -Path $backupPath -Filter "*.sql" -File | Sort-Object LastWriteTime -Descending
                
                if ($backups.Count -eq 0) {
                    Write-Host "No hay archivos .sql en $backupPath" -ForegroundColor Yellow
                } else {
                    Write-Host ""
                    foreach ($backup in $backups) {
                        $size = $backup.Length / 1MB
                        $date = $backup.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
                        Write-Host "  📄 $($backup.Name)" -ForegroundColor Green
                        Write-Host "     Tamaño: $([Math]::Round($size, 2)) MB | Fecha: $date" -ForegroundColor Gray
                        Write-Host ""
                    }
                }
            }
        }
        
        "4" {
            Write-Host ""
            Write-Host "Configuración actual:" -ForegroundColor Cyan
            Write-Host "  Host: $host_default"
            Write-Host "  Puerto: $port_default"
            Write-Host "  Usuario: $user_default"
            Write-Host "  Base de datos: $database_default"
            Write-Host ""
            Write-Host "Edita los valores en este script (líneas 7-11)" -ForegroundColor Yellow
        }
        
        "5" {
            Write-Host "¡Hasta luego!" -ForegroundColor Green
            exit 0
        }
        
        default {
            Write-Host "Opción inválida. Intenta de nuevo." -ForegroundColor Red
        }
    }
}
