use tauri::State;
use std::path::PathBuf;
use std::process::Command;

// Estructura para los perfiles disponibles
#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub description: String,
    pub script: String,
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
fn apply_profile(profile_id: &str) -> Result<String, String> {
    let profiles = get_profiles();
    let profile = profiles
        .iter()
        .find(|p| p.id == profile_id)
        .ok_or_else(|| format!("Perfil '{}' no encontrado", profile_id))?;

    // Ruta al script (relativa a la carpeta de recursos)
    let script_path = format!("./scripts/profiles/{}", profile.script);

    // Ejecutar script PowerShell
    let output = Command::new("powershell")
        .arg("-NoProfile")
        .arg("-ExecutionPolicy")
        .arg("Bypass")
        .arg("-File")
        .arg(&script_path)
        .output()
        .map_err(|e| format!("Error al ejecutar script: {}", e))?;

    if output.status.success() {
        Ok(format!("Perfil '{}' aplicado correctamente", profile.name))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Error al aplicar perfil: {}", stderr))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_profiles, apply_profile])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
