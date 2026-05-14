use crate::models::{AppStatus, Profile};
use crate::services::profile_service;

#[tauri::command]
pub fn get_app_status() -> AppStatus {
    profile_service::get_app_status()
}

#[tauri::command]
pub fn get_profiles() -> Vec<Profile> {
    profile_service::get_profiles()
}

#[tauri::command]
pub fn apply_profile(app: tauri::AppHandle, profile_id: &str) -> Result<String, String> {
    profile_service::apply_profile(&app, profile_id).map_err(|err| err.to_ipc_message())
}
