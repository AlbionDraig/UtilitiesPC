Write-Host '--- Menu de Perfiles ---' -ForegroundColor Yellow
Write-Host '1) Gamer'
Write-Host '2) Trabajo'
Write-Host '3) Gamer agresivo'
Write-Host '4) Trabajo dev'
$opt = Read-Host 'Seleccione una opcion'
switch ($opt) {
    '1' { & "$PSScriptRoot\perfil_gamer.ps1" }
    '2' { & "$PSScriptRoot\perfil_trabajo.ps1" }
    '3' { & "$PSScriptRoot\perfil_gamer_agresivo.ps1" }
    '4' { & "$PSScriptRoot\perfil_trabajo_dev.ps1" }
    Default { Write-Host 'Opcion no valida' -ForegroundColor Red }
}
Pause
