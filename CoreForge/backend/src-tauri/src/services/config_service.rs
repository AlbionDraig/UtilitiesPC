use std::collections::HashMap;
use std::path::PathBuf;

use crate::error::AppError;
use crate::models::{AppAction, AppRule, FullConfig, ProfileRules};

fn config_path() -> Option<PathBuf> {
    std::env::var("APPDATA")
        .ok()
        .map(|dir| PathBuf::from(dir).join("CoreForge").join("config.json"))
}

fn close_rule(id: &str, label: &str) -> AppRule {
    AppRule {
        id: id.to_string(),
        label: label.to_string(),
        action: AppAction::Close,
        process_name: Some(label.to_string()),
        executable_path: None,
        args: vec![],
    }
}

fn open_rule(id: &str, label: &str, path: &str, args: &[&str]) -> AppRule {
    AppRule {
        id: id.to_string(),
        label: label.to_string(),
        action: AppAction::Open,
        process_name: None,
        executable_path: Some(path.to_string()),
        args: args.iter().map(|s| s.to_string()).collect(),
    }
}

/// Returns the built-in default configuration used on first run.
pub fn default_config() -> FullConfig {
    let mut profiles: HashMap<String, ProfileRules> = HashMap::new();

    profiles.insert(
        "gamer".to_string(),
        ProfileRules {
            rules: vec![
                close_rule("g1", "Docker Desktop"),
                close_rule("g2", "com.docker.backend"),
                close_rule("g3", "Discord"),
                close_rule("g4", "Spotify"),
                close_rule("g5", "EpicGamesLauncher"),
                close_rule("g6", "Steam"),
                close_rule("g7", "Overwolf"),
                close_rule("g8", "msedge"),
                close_rule("g9", "opera"),
            ],
        },
    );

    profiles.insert(
        "gamer_agresivo".to_string(),
        ProfileRules {
            rules: vec![
                close_rule("ga1", "Docker Desktop"),
                close_rule("ga2", "com.docker.backend"),
                close_rule("ga3", "Discord"),
                close_rule("ga4", "Spotify"),
                close_rule("ga5", "EpicGamesLauncher"),
                close_rule("ga6", "Steam"),
                close_rule("ga7", "Overwolf"),
                close_rule("ga8", "msedge"),
                close_rule("ga9", "opera"),
                close_rule("ga10", "OneDrive"),
                close_rule("ga11", "Teams"),
                close_rule("ga12", "WhatsApp"),
                close_rule("ga13", "Telegram"),
                close_rule("ga14", "AdobeAcrobat"),
            ],
        },
    );

    let local_app_data = std::env::var("LOCALAPPDATA").unwrap_or_default();
    let discord_path = format!("{}\\Discord\\Update.exe", local_app_data);

    profiles.insert(
        "trabajo".to_string(),
        ProfileRules {
            rules: vec![
                open_rule(
                    "t1",
                    "Docker Desktop",
                    r"C:\Program Files\Docker\Docker\Docker Desktop.exe",
                    &[],
                ),
                open_rule(
                    "t2",
                    "Discord",
                    &discord_path,
                    &["--processStart", "Discord.exe"],
                ),
            ],
        },
    );

    let code_path = format!(
        "{}\\Programs\\Microsoft VS Code\\Code.exe",
        local_app_data
    );

    profiles.insert(
        "trabajo_dev".to_string(),
        ProfileRules {
            rules: vec![
                open_rule(
                    "td1",
                    "Docker Desktop",
                    r"C:\Program Files\Docker\Docker\Docker Desktop.exe",
                    &[],
                ),
                open_rule(
                    "td2",
                    "Discord",
                    &discord_path,
                    &["--processStart", "Discord.exe"],
                ),
                open_rule("td3", "VS Code", &code_path, &[]),
                open_rule("td4", "Windows Terminal", "wt", &[]),
            ],
        },
    );

    FullConfig { profiles }
}

/// Loads the user config from disk. Falls back to defaults if the file is
/// missing, unreadable, or malformed.
pub fn load_config() -> FullConfig {
    let Some(path) = config_path() else {
        return default_config();
    };

    if !path.exists() {
        return default_config();
    }

    let Ok(content) = std::fs::read_to_string(&path) else {
        return default_config();
    };

    serde_json::from_str(&content).unwrap_or_else(|_| default_config())
}

/// Persists the config to disk, creating the directory if necessary.
pub fn save_config(config: &FullConfig) -> Result<(), AppError> {
    let path = config_path().ok_or(AppError::ConfigSaveFailed)?;

    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|_| AppError::ConfigSaveFailed)?;
    }

    let json = serde_json::to_string_pretty(config).map_err(|_| AppError::ConfigSaveFailed)?;
    std::fs::write(&path, json).map_err(|_| AppError::ConfigSaveFailed)
}
