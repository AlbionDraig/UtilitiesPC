Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'SilentlyContinue'

function Write-Log {
    param(
        [System.Windows.Forms.TextBox]$LogBox,
        [string]$Message
    )
    $ts = (Get-Date).ToString('HH:mm:ss')
    $LogBox.AppendText("[$ts] $Message`r`n")
}

function Stop-Targets {
    param([string[]]$Names)
    $stopped = 0
    foreach ($name in $Names) {
        $procs = Get-Process -Name $name -ErrorAction SilentlyContinue
        foreach ($p in $procs) {
            try {
                Stop-Process -Id $p.Id -Force -ErrorAction Stop
                $stopped++
            }
            catch {
            }
        }
    }
    return $stopped
}

function Set-Plan {
    param([string]$Scheme)
    try {
        powercfg /setactive $Scheme | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Start-IfExists {
    param(
        [string]$Path,
        [string]$Args
    )
    if (Test-Path $Path) {
        if ([string]::IsNullOrWhiteSpace($Args)) {
            Start-Process -FilePath $Path | Out-Null
        }
        else {
            Start-Process -FilePath $Path -ArgumentList $Args | Out-Null
        }
        return $true
    }
    return $false
}

function Get-ActivePlan {
    $raw = powercfg /getactivescheme 2>$null
    if ($raw) { return ($raw | Out-String).Trim() }
    return 'No disponible'
}

function Apply-Theme {
    param(
        [System.Windows.Forms.Form]$Form,
        [System.Windows.Forms.Control[]]$Controls,
        [bool]$DarkMode
    )

    if ($DarkMode) {
        $bg = [System.Drawing.Color]::FromArgb(24, 28, 36)
        $panel = [System.Drawing.Color]::FromArgb(33, 38, 48)
        $fg = [System.Drawing.Color]::WhiteSmoke
    }
    else {
        $bg = [System.Drawing.Color]::FromArgb(240, 244, 250)
        $panel = [System.Drawing.Color]::White
        $fg = [System.Drawing.Color]::FromArgb(20, 24, 32)
    }

    $Form.BackColor = $bg
    foreach ($c in $Controls) {
        if ($c -is [System.Windows.Forms.TextBox]) {
            $c.BackColor = $panel
            $c.ForeColor = $fg
            continue
        }
        if ($c -is [System.Windows.Forms.Button]) {
            if ($c.Tag -eq 'accent-red') {
                $c.BackColor = [System.Drawing.Color]::FromArgb(194, 59, 52)
                $c.ForeColor = [System.Drawing.Color]::White
            }
            elseif ($c.Tag -eq 'accent-green') {
                $c.BackColor = [System.Drawing.Color]::FromArgb(33, 144, 109)
                $c.ForeColor = [System.Drawing.Color]::White
            }
            elseif ($c.Tag -eq 'accent-blue') {
                $c.BackColor = [System.Drawing.Color]::FromArgb(39, 97, 184)
                $c.ForeColor = [System.Drawing.Color]::White
            }
            else {
                $c.BackColor = if ($DarkMode) { [System.Drawing.Color]::FromArgb(58, 66, 82) } else { [System.Drawing.Color]::FromArgb(223, 230, 240) }
                $c.ForeColor = $fg
            }
            continue
        }
        $c.BackColor = $bg
        $c.ForeColor = $fg
    }
}

$form = New-Object System.Windows.Forms.Form
$form.Text = 'Perfiles de Rendimiento PC'
$form.Size = New-Object System.Drawing.Size(700, 520)
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.MinimizeBox = $true

$lblTitle = New-Object System.Windows.Forms.Label
$lblTitle.Text = 'Perfiles de Rendimiento PC'
$lblTitle.Font = New-Object System.Drawing.Font('Segoe UI', 16, [System.Drawing.FontStyle]::Bold)
$lblTitle.AutoSize = $true
$lblTitle.Location = New-Object System.Drawing.Point(20, 14)

$lblSub = New-Object System.Windows.Forms.Label
$lblSub.Text = 'Selecciona un perfil para aplicar optimizaciones rapidas'
$lblSub.Font = New-Object System.Drawing.Font('Segoe UI', 10)
$lblSub.AutoSize = $true
$lblSub.Location = New-Object System.Drawing.Point(22, 48)

$btnGamer = New-Object System.Windows.Forms.Button
$btnGamer.Text = 'Gamer'
$btnGamer.Size = New-Object System.Drawing.Size(150, 56)
$btnGamer.Location = New-Object System.Drawing.Point(20, 84)
$btnGamer.Font = New-Object System.Drawing.Font('Segoe UI', 10, [System.Drawing.FontStyle]::Bold)
$btnGamer.Tag = 'accent-red'

$btnTrabajo = New-Object System.Windows.Forms.Button
$btnTrabajo.Text = 'Trabajo'
$btnTrabajo.Size = New-Object System.Drawing.Size(150, 56)
$btnTrabajo.Location = New-Object System.Drawing.Point(182, 84)
$btnTrabajo.Font = New-Object System.Drawing.Font('Segoe UI', 10, [System.Drawing.FontStyle]::Bold)
$btnTrabajo.Tag = 'accent-green'

$btnGamerAgg = New-Object System.Windows.Forms.Button
$btnGamerAgg.Text = 'Gamer Agresivo'
$btnGamerAgg.Size = New-Object System.Drawing.Size(150, 56)
$btnGamerAgg.Location = New-Object System.Drawing.Point(344, 84)
$btnGamerAgg.Font = New-Object System.Drawing.Font('Segoe UI', 10, [System.Drawing.FontStyle]::Bold)
$btnGamerAgg.Tag = 'accent-red'

$btnTrabajoDev = New-Object System.Windows.Forms.Button
$btnTrabajoDev.Text = 'Trabajo Dev'
$btnTrabajoDev.Size = New-Object System.Drawing.Size(150, 56)
$btnTrabajoDev.Location = New-Object System.Drawing.Point(506, 84)
$btnTrabajoDev.Font = New-Object System.Drawing.Font('Segoe UI', 10, [System.Drawing.FontStyle]::Bold)
$btnTrabajoDev.Tag = 'accent-blue'

$btnEstado = New-Object System.Windows.Forms.Button
$btnEstado.Text = 'Ver estado rapido'
$btnEstado.Size = New-Object System.Drawing.Size(190, 38)
$btnEstado.Location = New-Object System.Drawing.Point(20, 156)
$btnEstado.Font = New-Object System.Drawing.Font('Segoe UI', 9)

$btnRestaurar = New-Object System.Windows.Forms.Button
$btnRestaurar.Text = 'Restaurar recomendado'
$btnRestaurar.Size = New-Object System.Drawing.Size(190, 38)
$btnRestaurar.Location = New-Object System.Drawing.Point(220, 156)
$btnRestaurar.Font = New-Object System.Drawing.Font('Segoe UI', 9)
$btnRestaurar.Tag = 'accent-green'

$btnTheme = New-Object System.Windows.Forms.Button
$btnTheme.Text = 'Cambiar tema'
$btnTheme.Size = New-Object System.Drawing.Size(130, 38)
$btnTheme.Location = New-Object System.Drawing.Point(420, 156)
$btnTheme.Font = New-Object System.Drawing.Font('Segoe UI', 9)

$btnExit = New-Object System.Windows.Forms.Button
$btnExit.Text = 'Salir'
$btnExit.Size = New-Object System.Drawing.Size(110, 38)
$btnExit.Location = New-Object System.Drawing.Point(556, 156)
$btnExit.Font = New-Object System.Drawing.Font('Segoe UI', 9)

$logBox = New-Object System.Windows.Forms.TextBox
$logBox.Multiline = $true
$logBox.ReadOnly = $true
$logBox.ScrollBars = 'Vertical'
$logBox.Size = New-Object System.Drawing.Size(644, 260)
$logBox.Location = New-Object System.Drawing.Point(20, 206)
$logBox.Font = New-Object System.Drawing.Font('Consolas', 9)

$controls = @($lblTitle, $lblSub, $btnGamer, $btnTrabajo, $btnGamerAgg, $btnTrabajoDev, $btnEstado, $btnRestaurar, $btnTheme, $btnExit, $logBox)
foreach ($c in $controls) { $form.Controls.Add($c) }

$darkMode = $true
Apply-Theme -Form $form -Controls $controls -DarkMode $darkMode

$gamerTargets = @('Docker Desktop','com.docker.backend','Discord','Spotify','Steam','EpicGamesLauncher','Overwolf','CurseForge','LGHUB','NVIDIA Broadcast','msedge','opera','opera_gx')
$aggressiveExtra = @('OneDrive','Teams','WhatsApp','Telegram','Acrobat','Creative Cloud')

$applyGamer = {
    $confirm = [System.Windows.Forms.MessageBox]::Show('Aplicar perfil Gamer?', 'Confirmar', 'YesNo', 'Question')
    if ($confirm -ne 'Yes') { return }
    try {
        $stopped = Stop-Targets -Names $gamerTargets
        wsl --shutdown | Out-Null
        $ok = Set-Plan -Scheme 'SCHEME_MIN'
        Write-Log -LogBox $logBox -Message ("Gamer aplicado. Procesos cerrados: $stopped. Plan: " + (if($ok){'Alto rendimiento'} else {'No se pudo cambiar'}))
    }
    catch {
        Write-Log -LogBox $logBox -Message "Error en perfil Gamer: $($_.Exception.Message)"
    }
}

$applyTrabajo = {
    $confirm = [System.Windows.Forms.MessageBox]::Show('Aplicar perfil Trabajo?', 'Confirmar', 'YesNo', 'Question')
    if ($confirm -ne 'Yes') { return }
    try {
        $ok = Set-Plan -Scheme 'SCHEME_BALANCED'
        $started = 0
        if (Start-IfExists -Path 'C:\Program Files\Docker\Docker\Docker Desktop.exe' -Args '') { $started++ }
        if (Start-IfExists -Path (Join-Path $env:LOCALAPPDATA 'Discord\Update.exe') -Args '--processStart Discord.exe') { $started++ }
        Write-Log -LogBox $logBox -Message ("Trabajo aplicado. Apps iniciadas: $started. Plan: " + (if($ok){'Equilibrado'} else {'No se pudo cambiar'}))
    }
    catch {
        Write-Log -LogBox $logBox -Message "Error en perfil Trabajo: $($_.Exception.Message)"
    }
}

$applyGamerAgg = {
    $confirm = [System.Windows.Forms.MessageBox]::Show('Aplicar perfil Gamer Agresivo?', 'Confirmar', 'YesNo', 'Warning')
    if ($confirm -ne 'Yes') { return }
    try {
        $stopped = Stop-Targets -Names ($gamerTargets + $aggressiveExtra)
        wsl --shutdown | Out-Null
        $ok = Set-Plan -Scheme 'SCHEME_MIN'
        Write-Log -LogBox $logBox -Message ("Gamer Agresivo aplicado. Procesos cerrados: $stopped. Plan: " + (if($ok){'Alto rendimiento'} else {'No se pudo cambiar'}))
    }
    catch {
        Write-Log -LogBox $logBox -Message "Error en perfil Gamer Agresivo: $($_.Exception.Message)"
    }
}

$applyTrabajoDev = {
    $confirm = [System.Windows.Forms.MessageBox]::Show('Aplicar perfil Trabajo Dev?', 'Confirmar', 'YesNo', 'Question')
    if ($confirm -ne 'Yes') { return }
    try {
        $ok = Set-Plan -Scheme 'SCHEME_BALANCED'
        $started = 0
        if (Start-IfExists -Path 'C:\Program Files\Docker\Docker\Docker Desktop.exe' -Args '') { $started++ }
        if (Start-IfExists -Path (Join-Path $env:LOCALAPPDATA 'Discord\Update.exe') -Args '--processStart Discord.exe') { $started++ }
        if (Start-IfExists -Path (Join-Path $env:LOCALAPPDATA 'Programs\Microsoft VS Code\Code.exe') -Args '') { $started++ }
        if (Get-Command wt -ErrorAction SilentlyContinue) { Start-Process wt | Out-Null; $started++ }
        Write-Log -LogBox $logBox -Message ("Trabajo Dev aplicado. Apps iniciadas: $started. Plan: " + (if($ok){'Equilibrado'} else {'No se pudo cambiar'}))
    }
    catch {
        Write-Log -LogBox $logBox -Message "Error en perfil Trabajo Dev: $($_.Exception.Message)"
    }
}

$showEstado = {
    try {
        Write-Log -LogBox $logBox -Message ("Plan activo: " + (Get-ActivePlan))
        $top = Get-Process | Sort-Object WS -Descending | Select-Object -First 6 ProcessName,@{N='RAM_MB';E={[math]::Round($_.WS/1MB,1)}}
        foreach ($t in $top) {
            Write-Log -LogBox $logBox -Message ("Top RAM -> " + $t.ProcessName + ': ' + $t.RAM_MB + ' MB')
        }
    }
    catch {
        Write-Log -LogBox $logBox -Message "No se pudo obtener estado rapido."
    }
}

$restoreRecommended = {
    $confirm = [System.Windows.Forms.MessageBox]::Show('Restaurar configuracion recomendada de uso diario?', 'Confirmar', 'YesNo', 'Question')
    if ($confirm -ne 'Yes') { return }
    try {
        $ok = Set-Plan -Scheme 'SCHEME_BALANCED'
        $stopped = Stop-Targets -Names @('Steam','EpicGamesLauncher','Overwolf','CurseForge')
        Write-Log -LogBox $logBox -Message ("Restaurado recomendado. Cerrados: $stopped launchers. Plan: " + (if($ok){'Equilibrado'} else {'No se pudo cambiar'}))
    }
    catch {
        Write-Log -LogBox $logBox -Message "Error al restaurar recomendado: $($_.Exception.Message)"
    }
}

$btnGamer.Add_Click($applyGamer)
$btnTrabajo.Add_Click($applyTrabajo)
$btnGamerAgg.Add_Click($applyGamerAgg)
$btnTrabajoDev.Add_Click($applyTrabajoDev)
$btnEstado.Add_Click($showEstado)
$btnRestaurar.Add_Click($restoreRecommended)
$btnExit.Add_Click({ $form.Close() })
$btnTheme.Add_Click({
    $darkMode = -not $darkMode
    Apply-Theme -Form $form -Controls $controls -DarkMode $darkMode
    Write-Log -LogBox $logBox -Message ("Tema cambiado a " + (if($darkMode){'Oscuro'} else {'Claro'}))
})

Write-Log -LogBox $logBox -Message 'Aplicacion iniciada. Elige un perfil.'
[void]$form.ShowDialog()
