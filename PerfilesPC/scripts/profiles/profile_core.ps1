param()

Set-StrictMode -Version Latest

$Global:BaseGamingProcesses = @(
  'Docker Desktop',
  'com.docker.backend',
  'Docker Desktop Backend',
  'Discord',
  'Spotify',
  'EpicGamesLauncher',
  'Steam',
  'Overwolf',
  'CurseForge',
  'LGHUB',
  'NVIDIA Broadcast',
  'msedge',
  'opera',
  'opera_gx'
)

$Global:AggressiveExtraProcesses = @(
  'OneDrive',
  'Teams',
  'WhatsApp',
  'Telegram',
  'AdobeAcrobat',
  'Creative Cloud'
)

function Stop-TargetProcesses {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$ProcessNames
  )

  foreach ($name in $ProcessNames) {
    $targets = Get-Process -Name $name -ErrorAction SilentlyContinue
    foreach ($target in $targets) {
      try {
        Stop-Process -Id $target.Id -Force -ErrorAction Stop
      }
      catch {
        # Keep applying profile even when a process exits during shutdown.
      }
    }
  }
}

function Start-AppIfExists {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Path,
    [string[]]$Arguments
  )

  if (-not (Test-Path $Path)) {
    return
  }

  if ($null -eq $Arguments -or $Arguments.Count -eq 0) {
    Start-Process -FilePath $Path | Out-Null
    return
  }

  Start-Process -FilePath $Path -ArgumentList $Arguments | Out-Null
}

function Set-PowerScheme {
  param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('SCHEME_MIN', 'SCHEME_BALANCED')]
    [string]$Scheme
  )

  powercfg /setactive $Scheme | Out-Null
}

function Stop-WslIfAvailable {
  if (Get-Command wsl -ErrorAction SilentlyContinue) {
    wsl --shutdown | Out-Null
  }
}

function Invoke-PerformanceProfile {
  param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('gamer', 'gamer_agresivo', 'trabajo', 'trabajo_dev')]
    [string]$ProfileId
  )

  switch ($ProfileId) {
    'gamer' {
      Stop-TargetProcesses -ProcessNames $Global:BaseGamingProcesses
      Stop-WslIfAvailable
      Set-PowerScheme -Scheme 'SCHEME_MIN'
      Write-Host 'Perfil GAMER aplicado.' -ForegroundColor Green
      Write-Host 'Consejo: abre solo el launcher/juego que vas a usar.' -ForegroundColor Yellow
      break
    }

    'gamer_agresivo' {
      Stop-TargetProcesses -ProcessNames ($Global:BaseGamingProcesses + $Global:AggressiveExtraProcesses)
      Stop-WslIfAvailable
      Set-PowerScheme -Scheme 'SCHEME_MIN'
      Write-Host 'Perfil GAMER AGRESIVO aplicado.' -ForegroundColor Green
      Write-Host 'Consejo: reserva este perfil para sesiones de juego intensas.' -ForegroundColor Yellow
      break
    }

    'trabajo' {
      Set-PowerScheme -Scheme 'SCHEME_BALANCED'

      Start-AppIfExists -Path 'C:\Program Files\Docker\Docker\Docker Desktop.exe'

      $discordUpdate = Join-Path $env:LOCALAPPDATA 'Discord\Update.exe'
      Start-AppIfExists -Path $discordUpdate -Arguments @('--processStart', 'Discord.exe')

      Write-Host 'Perfil TRABAJO aplicado.' -ForegroundColor Green
      Write-Host 'Docker/Discord se abren solo si estan instalados.' -ForegroundColor Yellow
      break
    }

    'trabajo_dev' {
      Set-PowerScheme -Scheme 'SCHEME_BALANCED'

      Start-AppIfExists -Path 'C:\Program Files\Docker\Docker\Docker Desktop.exe'

      $discordUpdate = Join-Path $env:LOCALAPPDATA 'Discord\Update.exe'
      Start-AppIfExists -Path $discordUpdate -Arguments @('--processStart', 'Discord.exe')

      $codePath = Join-Path $env:LOCALAPPDATA 'Programs\Microsoft VS Code\Code.exe'
      Start-AppIfExists -Path $codePath

      if (Get-Command wt -ErrorAction SilentlyContinue) {
        Start-Process wt | Out-Null
      }

      Write-Host 'Perfil TRABAJO DEV aplicado.' -ForegroundColor Green
      Write-Host 'Entorno de desarrollo iniciado cuando las herramientas estan disponibles.' -ForegroundColor Yellow
      break
    }

    default {
      throw "Perfil no soportado: $ProfileId"
    }
  }
}
