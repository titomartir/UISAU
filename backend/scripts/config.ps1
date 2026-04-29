# Archivo de configuración compartida para scripts de backup/restauración
# Edita estos valores si tus credenciales de BD son diferentes

# CONFIGURACIÓN DE LA BASE DE DATOS
$DB_CONFIG = @{
    Host     = "localhost"      # Dirección del servidor PostgreSQL
    Port     = "5432"           # Puerto (default: 5432)
    Username = "postgres"       # Usuario de PostgreSQL
    Password = "postgres"       # Contraseña (IMPORTANTE: cambiar en producción)
    Database = "encuestas_satisfaccion"  # Nombre de la BD
}

# CONFIGURACIÓN DE RUTAS
$BACKUP_CONFIG = @{
    BackupPath = "$PSScriptRoot\..\database-backup"  # Donde guardar backups
    KeepBackups = 5  # Número de backups antiguos a mantener (0 = todos)
}

# CONFIGURACIÓN AVANZADA
$ADVANCED_CONFIG = @{
    CompressionEnabled = $false  # Comprimir backups de grandes BD (requiere zip)
    IncludeOwnerInfo = $false    # Incluir información de propietarios en dump
    VerboseLogging = $true       # Mostrar detalles durante operaciones
}

# NO EDITAR ABAJO (se usa en scripts)
$SCRIPT_CONFIG = @{
    Version = "1.0"
    CreatedDate = "2024-01-15"
    LastModified = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
}

Write-Host "📁 Configuración cargada desde config.ps1" -ForegroundColor Gray
