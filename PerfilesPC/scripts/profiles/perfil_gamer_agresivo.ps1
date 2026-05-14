Write-Host '--- Iniciando Perfil Gamer Agresivo ---' -ForegroundColor Cyan
$procesos = @('Docker Desktop', 'com.docker.backend', 'Docker Desktop Backend', 'Discord', 'Spotify', 'Steam', 'EpicGamesLauncher', 'Overwolf', 'CurseForge', 'LGHUB', 'NVIDIA Broadcast', 'msedge', 'opera', 'opera_gx', 'OneDrive', 'Teams', 'WhatsApp', 'Telegram', 'AdobeAcrobat', 'Creative Cloud')
foreach ($p in $procesos) { Stop-Process -Name $p -Force -ErrorAction SilentlyContinue }
wsl --shutdown
powercfg /setactive SCHEME_MIN
Write-Host '--- Perfil Gamer Agresivo Activo ---' -ForegroundColor Green
