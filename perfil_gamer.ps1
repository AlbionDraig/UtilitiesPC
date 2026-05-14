param()
$ErrorActionPreference = "SilentlyContinue"

Write-Host "Aplicando perfil GAMER..." -ForegroundColor Cyan

# Procesos pesados comunes para juegos
$procNames = @(
  "Docker Desktop",
  "com.docker.backend",
  "Docker Desktop Backend",
  "Discord",
  "Spotify",
  "EpicGamesLauncher",
  "Steam",
  "Overwolf",
  "CurseForge",
  "LGHUB",
  "NVIDIA Broadcast",
  "msedge",
  "opera",
  "opera_gx"
)

foreach ($name in $procNames) {
  Get-Process -Name $name -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

# Cierra WSL para liberar RAM si estaba activo
wsl --shutdown | Out-Null

# Energia: alto rendimiento
powercfg /setactive SCHEME_MIN | Out-Null

Write-Host "Perfil GAMER aplicado." -ForegroundColor Green
Write-Host "Consejo: abre solo el launcher/juego que vas a usar." -ForegroundColor Yellow
