use std::process::Command;

use crate::error::AppError;
use crate::models::{available_profiles, AppAction, AppStatus, Profile, ProfileRules};
use crate::services::config_service;

fn no_window_command(program: &str) -> Command {
    let mut cmd = Command::new(program);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x0800_0000);
    }
    cmd
}

fn stop_process_safely(image_name: &str) {
    let candidates = if image_name.to_ascii_lowercase().ends_with(".exe") {
        vec![image_name.to_string()]
    } else {
        vec![image_name.to_string(), format!("{}.exe", image_name)]
    };

    for candidate in candidates {
        let _ = no_window_command("taskkill")
            .args(["/F", "/IM", candidate.as_str()])
            .output();
    }
}

fn set_power_scheme(scheme: &str) -> Result<(), AppError> {
    let output = no_window_command("powercfg")
        .args(["/setactive", scheme])
        .output()
        .map_err(|_| AppError::ScriptExecutionFailed)?;

    if output.status.success() {
        Ok(())
    } else {
        Err(AppError::ScriptExecutionFailed)
    }
}

fn shutdown_wsl_if_available() {
    if no_window_command("where")
        .arg("wsl")
        .output()
        .map(|out| out.status.success())
        .unwrap_or(false)
    {
        let _ = no_window_command("wsl").arg("--shutdown").output();
    }
}

fn apply_windows_profile(profile_id: &str) -> Result<(), AppError> {
    let config = config_service::load_config();
    let empty = ProfileRules::default();
    let rules = config.profiles.get(profile_id).unwrap_or(&empty);

    for rule in &rules.rules {
        match rule.action {
            AppAction::Close => {
                if let Some(ref name) = rule.process_name {
                    stop_process_safely(name);
                }
            }
            AppAction::Open => {
                if let Some(ref path) = rule.executable_path {
                    let args: Vec<&str> = rule.args.iter().map(String::as_str).collect();
                    let _ = no_window_command(path).args(&args).spawn();
                }
            }
        }
    }

    match profile_id {
        "gamer" => {
            shutdown_wsl_if_available();
            set_power_scheme("SCHEME_MIN")
        }
        "gamer_agresivo" => {
            shutdown_wsl_if_available();
            set_power_scheme("SCHEME_MIN")
        }
        "trabajo" | "trabajo_dev" => set_power_scheme("SCHEME_BALANCED"),
        _ => Err(AppError::ProfileNotFound {
            profile_id: profile_id.to_string(),
        }),
    }
}

fn is_running_as_admin() -> bool {
    #[cfg(target_os = "windows")]
    {
        no_window_command("net")
            .arg("session")
            .output()
            .map(|result| result.status.success())
            .unwrap_or(false)
    }

    #[cfg(not(target_os = "windows"))]
    {
        false
    }
}

pub fn get_app_status() -> AppStatus {
    let is_admin = is_running_as_admin();

    AppStatus {
        platform: std::env::consts::OS.to_string(),
        is_admin,
        can_apply_profiles: is_admin,
        reason: if is_admin {
            None
        } else {
            Some(AppError::AdminRequired.code().to_string())
        },
    }
}

pub fn get_profiles() -> Vec<Profile> {
    available_profiles()
}

pub fn apply_profile(_app: &tauri::AppHandle, profile_id: &str) -> Result<String, AppError> {
    let status = get_app_status();
    if !status.can_apply_profiles {
        return Err(AppError::AdminRequired);
    }

    let profiles = get_profiles();
    let profile = profiles
        .iter()
        .find(|p| p.id == profile_id)
        .ok_or_else(|| AppError::ProfileNotFound {
            profile_id: profile_id.to_string(),
        })?;

    println!(
        "profile_apply_start profile_id={} mode=native platform={}",
        profile.id,
        std::env::consts::OS
    );

    match apply_windows_profile(&profile.id) {
        Ok(()) => {
            println!(
                "profile_apply_success profile_id={} mode=native",
                profile.id
            );
            Ok(profile.id.clone())
        }
        Err(AppError::ScriptExecutionFailed) => Err(AppError::ProfileApplyFailed {
            profile_id: profile.id.clone(),
        }),
        Err(err) => Err(err),
    }
}

#[cfg(test)]
mod tests {
    use super::apply_windows_profile;

    #[test]
    fn should_return_profile_not_found_when_native_profile_is_unknown() {
        let result = apply_windows_profile("unknown");
        assert!(result.is_err());
    }
}
