param()

$ErrorActionPreference = 'Stop'

. (Join-Path $PSScriptRoot 'profile_core.ps1')

Write-Host 'Aplicando perfil TRABAJO DEV...' -ForegroundColor Cyan

try {
    Invoke-PerformanceProfile -ProfileId 'trabajo_dev'
}
catch {
    Write-Error "No se pudo aplicar el perfil trabajo dev: $($_.Exception.Message)"
    exit 1
}
