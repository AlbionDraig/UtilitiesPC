Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$sourceSvg = Join-Path $root 'public/coreforge-icon.svg'
$tauriDir = (Resolve-Path (Join-Path $root '../backend/src-tauri')).Path
$iconsDir = Join-Path $tauriDir 'icons'
$tauriCli = Join-Path $root 'node_modules/.bin/tauri'

if (-not (Test-Path $sourceSvg)) {
  throw "Source icon not found: $sourceSvg"
}

if (-not (Test-Path $tauriCli)) {
  throw "Tauri CLI not found: $tauriCli"
}

Push-Location $tauriDir
try {
  & $tauriCli icon $sourceSvg

  # Keep only Windows-relevant icon assets.
  $pathsToRemove = @(
    (Join-Path $iconsDir 'android'),
    (Join-Path $iconsDir 'ios'),
    (Join-Path $iconsDir 'icon.icns'),
    (Join-Path $iconsDir 'icon.png')
  )

  foreach ($path in $pathsToRemove) {
    if (Test-Path $path) {
      Remove-Item -Path $path -Recurse -Force
    }
  }
}
finally {
  Pop-Location
}

Write-Host 'Windows icon set generated and cleaned successfully.'
