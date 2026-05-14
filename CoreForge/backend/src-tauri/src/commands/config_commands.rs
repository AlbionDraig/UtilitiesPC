use crate::error::AppError;
use crate::models::FullConfig;
use crate::services::config_service;

#[tauri::command]
pub fn get_profile_app_config() -> FullConfig {
    config_service::load_config()
}

#[tauri::command]
pub fn save_profile_app_config(config: FullConfig) -> Result<(), String> {
    config_service::save_config(&config).map_err(|err: AppError| err.to_ipc_message())
}
