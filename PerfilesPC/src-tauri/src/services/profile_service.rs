use std::path::PathBuf;
use std::process::Command;
use tauri::Manager;

use crate::error::AppError;
use crate::models::{available_profiles, AppStatus, Profile};

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

fn resolve_script_path(app: &tauri::AppHandle, script_name: &str) -> Result<PathBuf, AppError> {
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

    Err(AppError::ScriptResolutionFailed)
}

fn sanitize_stderr(stderr: &[u8]) -> String {
    const MAX_LEN: usize = 320;
    let raw = String::from_utf8_lossy(stderr)
        .replace('\n', " ")
        .replace('\r', " ");
    let compact = raw.split_whitespace().collect::<Vec<_>>().join(" ");

    if compact.len() > MAX_LEN {
        format!("{}...", &compact[..MAX_LEN])
    } else {
        compact
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

pub fn apply_profile(app: &tauri::AppHandle, profile_id: &str) -> Result<String, AppError> {
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

    let script_path = resolve_script_path(app, &profile.script)?;

    println!(
        "profile_apply_start profile_id={} script={} platform={}",
        profile.id,
        profile.script,
        std::env::consts::OS
    );

    let output = Command::new("powershell")
        .arg("-NoProfile")
        .arg("-ExecutionPolicy")
        .arg("Bypass")
        .arg("-File")
        .arg(&script_path)
        .output()
        .map_err(|_| AppError::ScriptExecutionFailed)?;

    let exit_code = output.status.code().unwrap_or(-1);

    if output.status.success() {
        println!(
            "profile_apply_success profile_id={} script={} exit_code={}",
            profile.id, profile.script, exit_code
        );
        Ok(profile.id.clone())
    } else {
        let stderr = sanitize_stderr(&output.stderr);
        eprintln!(
            "profile_apply_error profile_id={} script={} exit_code={} stderr={}",
            profile.id, profile.script, exit_code, stderr
        );

        Err(AppError::ProfileApplyFailed {
            profile_id: profile.id.clone(),
        })
    }
}

#[cfg(test)]
mod tests {
    use super::sanitize_stderr;

    #[test]
    fn should_compact_whitespace_when_sanitizing_stderr() {
        let out = sanitize_stderr(b"line one\nline\ttwo\r\nline three");
        assert_eq!(out, "line one line two line three");
    }
}
