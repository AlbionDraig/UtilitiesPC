param()
$ErrorActionPreference = "SilentlyContinue"

Write-Host "Aplicando perfil TRABAJO..." -ForegroundColor Cyan

# Energia equilibrada para trabajo diario
powercfg /setactive SCHEME_BALANCED | Out-Null

# Inicia Docker Desktop si existe
$dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
if (Test-Path $dockerPath) {
  Start-Process -FilePath $dockerPath | Out-Null
}

# Inicia Discord si esta instalado (opcional en trabajo)
$discordUpdate = Join-Path $env:LOCALAPPDATA 'Discord\Update.exe'
if (Test-Path $discordUpdate) {
  Start-Process -FilePath $discordUpdate -ArgumentList '--processStart Discord.exe' | Out-Null
}

Write-Host "Perfil TRABAJO aplicado." -ForegroundColor Green
Write-Host "Docker/Discord se abren solo si estan instalados." -ForegroundColor Yellow
