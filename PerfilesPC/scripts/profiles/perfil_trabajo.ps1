param()

$ErrorActionPreference = 'Stop'

. (Join-Path $PSScriptRoot 'profile_core.ps1')

Write-Host 'Aplicando perfil TRABAJO...' -ForegroundColor Cyan

try {
  Invoke-PerformanceProfile -ProfileId 'trabajo'
}
catch {
  Write-Error "No se pudo aplicar el perfil trabajo: $($_.Exception.Message)"
  exit 1
}
