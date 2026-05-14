use std::process::Command;

use crate::error::AppError;
use crate::models::{available_profiles, AppStatus, Profile};

fn no_window_command(program: &str) -> Command {
    let mut cmd = Command::new(program);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x0800_0000);
    }
    cmd
}

const BASE_GAMING_PROCESSES: [&str; 14] = [
    "Docker Desktop",
    "com.docker.backend",
    "Docker Desktop Backend",
    "Discord",
    "Spotify",
    "EpicGamesLauncher",
    "Steam",
    "Overwolf",
    "CurseForge",
    "LGHUB",
    "NVIDIA Broadcast",
    "msedge",
    "opera",
    "opera_gx",
];

const AGGRESSIVE_EXTRA_PROCESSES: [&str; 6] = [
    "OneDrive",
    "Teams",
    "WhatsApp",
    "Telegram",
    "AdobeAcrobat",
    "Creative Cloud",
];

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

fn stop_targets(process_names: &[&str]) {
    for process_name in process_names {
        stop_process_safely(process_name);
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

fn launch_app_if_exists(path: &str, args: &[&str]) {
    if !std::path::Path::new(path).is_file() {
        return;
    }

    let mut command = no_window_command(path);
    if !args.is_empty() {
        command.args(args);
    }

    let _ = command.spawn();
}

fn launch_windows_terminal_if_available() {
    if no_window_command("where")
        .arg("wt")
        .output()
        .map(|out| out.status.success())
        .unwrap_or(false)
    {
        let _ = no_window_command("wt").spawn();
    }
}

fn apply_windows_profile(profile_id: &str) -> Result<(), AppError> {
    match profile_id {
        "gamer" => {
            stop_targets(&BASE_GAMING_PROCESSES);
            shutdown_wsl_if_available();
            set_power_scheme("SCHEME_MIN")
        }
        "gamer_agresivo" => {
            stop_targets(&BASE_GAMING_PROCESSES);
            stop_targets(&AGGRESSIVE_EXTRA_PROCESSES);
            shutdown_wsl_if_available();
            set_power_scheme("SCHEME_MIN")
        }
        "trabajo" => {
            set_power_scheme("SCHEME_BALANCED")?;

            launch_app_if_exists("C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe", &[]);

            if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
                let discord_update = format!("{}\\Discord\\Update.exe", local_app_data);
                launch_app_if_exists(&discord_update, &["--processStart", "Discord.exe"]);
            }

            Ok(())
        }
        "trabajo_dev" => {
            set_power_scheme("SCHEME_BALANCED")?;

            launch_app_if_exists("C:\\Program Files\\Docker\\Docker\\Docker Desktop.exe", &[]);

            if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
                let discord_update = format!("{}\\Discord\\Update.exe", local_app_data);
                launch_app_if_exists(&discord_update, &["--processStart", "Discord.exe"]);

                let code_exe = format!("{}\\Programs\\Microsoft VS Code\\Code.exe", local_app_data);
                launch_app_if_exists(&code_exe, &[]);
            }

            launch_windows_terminal_if_available();
            Ok(())
        }
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
