use std::path::PathBuf;
use std::process::Command;
use tauri::Manager;

// Estructura para los perfiles disponibles
#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub description: String,
    pub script: String,
}

#[derive(serde::Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AppStatus {
    pub platform: String,
    pub is_admin: bool,
    pub can_apply_profiles: bool,
    pub reason: Option<String>,
}

fn is_running_as_admin() -> bool {
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("powershell")
            .arg("-NoProfile")
            .arg("-Command")
            .arg("[bool](([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator))")
            .output();

        if let Ok(result) = output {
            return result.status.success()
                && String::from_utf8_lossy(&result.stdout)
                    .trim()
                    .eq_ignore_ascii_case("true");
        }

        false
    }

    #[cfg(not(target_os = "windows"))]
    {
        false
    }
}

fn resolve_script_path(app: &tauri::AppHandle, script_name: &str) -> Result<PathBuf, String> {
    let mut candidates: Vec<PathBuf> = Vec::new();

    if let Ok(resource_dir) = app.path().resource_dir() {
        candidates.push(resource_dir.join("scripts").join("profiles").join(script_name));
    }

    if let Ok(current_dir) = std::env::current_dir() {
        candidates.push(current_dir.join("scripts").join("profiles").join(script_name));
        candidates.push(
            current_dir
                .join("..")
                .join("scripts")
                .join("profiles")
                .join(script_name),
        );
    }

    for candidate in candidates {
        if candidate.is_file() {
            return Ok(candidate);
        }
    }

    Err(format!(
        "No se encontro el script '{}' en recursos de la aplicacion",
        script_name
    ))
}

fn sanitize_stderr(stderr: &[u8]) -> String {
    const MAX_LEN: usize = 320;
    let raw = String::from_utf8_lossy(stderr).replace('\n', " ").replace('\r', " ");
    let compact = raw.split_whitespace().collect::<Vec<_>>().join(" ");

    if compact.len() > MAX_LEN {
        format!("{}...", &compact[..MAX_LEN])
    } else {
        compact
    }
}

#[tauri::command]
fn get_app_status() -> AppStatus {
    let is_admin = is_running_as_admin();

    AppStatus {
        platform: std::env::consts::OS.to_string(),
        is_admin,
        can_apply_profiles: is_admin,
        reason: if is_admin {
            None
        } else {
            Some("La app requiere permisos de administrador para aplicar perfiles".to_string())
        },
    }
}

// Obtener lista de perfiles disponibles
#[tauri::command]
fn get_profiles() -> Vec<Profile> {
    vec![
        Profile {
            id: "gamer".to_string(),
            name: "Gamer".to_string(),
            description: "Optimizado para juegos".to_string(),
            script: "perfil_gamer.ps1".to_string(),
        },
        Profile {
            id: "trabajo".to_string(),
            name: "Trabajo".to_string(),
            description: "Perfil productivo estándar".to_string(),
            script: "perfil_trabajo.ps1".to_string(),
        },
        Profile {
            id: "gamer_agresivo".to_string(),
            name: "Gamer Agresivo".to_string(),
            description: "Máximo rendimiento para gaming extremo".to_string(),
            script: "perfil_gamer_agresivo.ps1".to_string(),
        },
        Profile {
            id: "trabajo_dev".to_string(),
            name: "Trabajo Dev".to_string(),
            description: "Optimizado para desarrollo".to_string(),
            script: "perfil_trabajo_dev.ps1".to_string(),
        },
    ]
}

// Aplicar un perfil ejecutando su script PowerShell
#[tauri::command]
fn apply_profile(app: tauri::AppHandle, profile_id: &str) -> Result<String, String> {
    let status = get_app_status();
    if !status.can_apply_profiles {
        return Err(status.reason.unwrap_or_else(|| {
            "No se pudo aplicar el perfil por permisos insuficientes".to_string()
        }));
    }

    let profiles = get_profiles();
    let profile = profiles
        .iter()
        .find(|p| p.id == profile_id)
        .ok_or_else(|| format!("Perfil '{}' no encontrado", profile_id))?;

    let script_path = resolve_script_path(&app, &profile.script)?;

    println!(
        "profile_apply_start profile_id={} script={} platform={}",
        profile.id,
        profile.script,
        std::env::consts::OS
    );

    // Ejecutar script PowerShell con argumentos parametrizados (sin concatenación de strings)
    let output = Command::new("powershell")
        .arg("-NoProfile")
        .arg("-ExecutionPolicy")
        .arg("Bypass")
        .arg("-File")
        .arg(&script_path)
        .output()
        .map_err(|e| format!("Error al ejecutar script: {}", e))?;

    let exit_code = output.status.code().unwrap_or(-1);

    if output.status.success() {
        println!(
            "profile_apply_success profile_id={} script={} exit_code={}",
            profile.id, profile.script, exit_code
        );
        Ok(format!("Perfil '{}' aplicado correctamente", profile.name))
    } else {
        let stderr = sanitize_stderr(&output.stderr);
        eprintln!(
            "profile_apply_error profile_id={} script={} exit_code={} stderr={}",
            profile.id, profile.script, exit_code, stderr
        );
        Err(format!(
            "Error al aplicar perfil '{}'. Codigo {}. Detalle: {}",
            profile.name, exit_code, stderr
        ))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![get_profiles, get_app_status, apply_profile])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
