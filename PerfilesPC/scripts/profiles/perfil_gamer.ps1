param()

$ErrorActionPreference = 'Stop'

. (Join-Path $PSScriptRoot 'profile_core.ps1')

Write-Host 'Aplicando perfil GAMER...' -ForegroundColor Cyan

try {
  Invoke-PerformanceProfile -ProfileId 'gamer'
}
catch {
  Write-Error "No se pudo aplicar el perfil gamer: $($_.Exception.Message)"
  exit 1
}
