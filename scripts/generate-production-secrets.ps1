param(
    [string]$OutputPath,
    [switch]$CopyToClipboard
)

if (-not $OutputPath -and -not $CopyToClipboard) {
    throw "Debe indicar -OutputPath o -CopyToClipboard para exportar los secretos generados."
}

if ($OutputPath) {
    $resolvedOutput = [System.IO.Path]::GetFullPath($OutputPath)
    $repoRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
    if ($resolvedOutput.StartsWith($repoRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "El archivo de salida debe ubicarse fuera del repositorio."
    }
}

function New-RandomString {
    param(
        [int]$Length,
        [string]$Alphabet
    )

    $bytes = New-Object byte[] ($Length * 2)
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)

    $chars = New-Object System.Collections.Generic.List[char]
    foreach ($byte in $bytes) {
        if ($chars.Count -ge $Length) {
            break
        }
        $chars.Add($Alphabet[$byte % $Alphabet.Length])
    }

    -join $chars
}

$base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
$passwordAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@$%&*?'

$secrets = [ordered]@{
    JWT_SECRET               = New-RandomString -Length 64 -Alphabet $base64Alphabet
    JWT_REFRESH_SECRET       = New-RandomString -Length 64 -Alphabet $base64Alphabet
    DB_PASSWORD              = New-RandomString -Length 32 -Alphabet $passwordAlphabet
    ADMIN_PASSWORD           = New-RandomString -Length 24 -Alphabet $passwordAlphabet
    ENCRYPTION_KEY           = New-RandomString -Length 32 -Alphabet $base64Alphabet
    PGADMIN_DEFAULT_PASSWORD = New-RandomString -Length 24 -Alphabet $passwordAlphabet
}

$output = ($secrets.GetEnumerator() | ForEach-Object { "{0}={1}" -f $_.Key, $_.Value }) -join [Environment]::NewLine

if ($OutputPath) {
    $directory = Split-Path -Parent $resolvedOutput
    if ($directory -and -not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory | Out-Null
    }
    [System.IO.File]::WriteAllText($resolvedOutput, $output + [Environment]::NewLine)
}

if ($CopyToClipboard) {
    Set-Clipboard -Value $output
}

Write-Host "Secretos generados correctamente:" -ForegroundColor Green
foreach ($entry in $secrets.GetEnumerator()) {
    Write-Host (" - {0}: longitud {1}" -f $entry.Key, $entry.Value.Length)
}

if ($OutputPath) {
    Write-Host "Salida guardada fuera del repositorio." -ForegroundColor Green
}

if ($CopyToClipboard) {
    Write-Host "Secretos copiados al portapapeles." -ForegroundColor Green
}