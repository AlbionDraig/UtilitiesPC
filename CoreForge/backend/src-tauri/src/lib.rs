mod commands;
mod error;
mod models;
mod services;

use commands::config_commands::{get_profile_app_config, save_profile_app_config};
use commands::profile_commands::{apply_profile, get_app_status, get_profiles};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_profiles,
            get_app_status,
            apply_profile,
            get_profile_app_config,
            save_profile_app_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
