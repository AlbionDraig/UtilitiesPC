Write-Host '--- Iniciando Perfil Trabajo Dev ---' -ForegroundColor Cyan
powercfg /setactive SCHEME_BALANCED
$apps = @(
    "C:\Program Files\Docker\Docker\Docker Desktop.exe",
    "$env:LocalAppData\Discord\Update.exe --processStart Discord.exe",
    "code"
)
foreach ($app in $apps) { Start-Process $app -ErrorAction SilentlyContinue }
if (Get-Command wt -ErrorAction SilentlyContinue) { Start-Process wt }
Write-Host '--- Perfil Trabajo Dev Activo ---' -ForegroundColor Green
