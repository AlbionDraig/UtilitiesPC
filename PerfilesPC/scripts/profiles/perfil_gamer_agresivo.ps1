param()

$ErrorActionPreference = 'Stop'

. (Join-Path $PSScriptRoot 'profile_core.ps1')

Write-Host 'Aplicando perfil GAMER AGRESIVO...' -ForegroundColor Cyan

try {
	Invoke-PerformanceProfile -ProfileId 'gamer_agresivo'
}
catch {
	Write-Error "No se pudo aplicar el perfil gamer agresivo: $($_.Exception.Message)"
	exit 1
}
