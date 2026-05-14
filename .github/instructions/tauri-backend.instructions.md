---
description: "Use when writing Rust backend code for Tauri, including commands, system integration, process execution, and file operations. Covers architecture, error handling, and IPC patterns."
applyTo: "src-tauri/src/**/*.rs"
---

# Tauri Backend (Rust) Guidelines

## Architecture layers
- `src/main.rs` — App entry point; initialize Tauri runtime and register commands.
- `src/commands/` — Tauri command handlers; validate input, call services.
- `src/services/` — Business logic; PowerShell execution, system state management, pure functions.
- `src/models/` — Data structures shared between frontend and backend (must be serializable).
- `src/error.rs` — Custom error types; implement `Into<tauri::InvokeError>` for clean IPC responses.

## Commands (Tauri)
```rust
#[tauri::command]
async fn apply_profile(profile_name: String, app: tauri::AppHandle) -> Result<String, String> {
    // 1. Validate input
    validate_profile_name(&profile_name)?;
    
    // 2. Call service
    let result = crate::services::profiles::apply(&profile_name).await?;
    
    // 3. Emit update event (optional)
    app.emit("profile_applied", &result)?;
    
    Ok(result)
}
```

**Rules:**
- Use `#[tauri::command]` for all frontend-callable functions.
- Async when I/O bound; sync for pure logic.
- Return `Result<T, E>` where `E` implements `Into<tauri::InvokeError>`.
- Validate arguments; reject invalid types/lengths immediately.
- Emit events for long-running operations or status updates.

## Error handling
- Define custom error enum in `src/error.rs` implementing `serde::Serialize`.
- Convert to `InvokeError` via `impl From<MyError> for InvokeError`.
- Never expose stack traces; return user-friendly messages.
- Example:
```rust
#[derive(Debug, serde::Serialize)]
pub enum AppError {
    ProfileNotFound(String),
    ExecutionFailed(String),
    InvalidInput(String),
}

impl From<AppError> for tauri::InvokeError {
    fn from(err: AppError) -> Self {
        format!("{:?}", err).into()
    }
}
```

## System integration (PowerShell / processes)
- Use `std::process::Command` for executing PowerShell scripts.
- **Never** concatenate user input into command strings; use argument arrays.
- Example:
```rust
use std::process::Command;

fn execute_powershell_script(script_path: &str, profile: &str) -> Result<String> {
    let output = Command::new("powershell")
        .arg("-NoProfile")
        .arg("-ExecutionPolicy")
        .arg("Bypass")
        .arg("-File")
        .arg(script_path)
        .arg("-Profile") // Named parameter
        .arg(profile)    // Value — passed safely
        .output()?;
    
    if output.status.success() {
        Ok(String::from_utf8(output.stdout)?)
    } else {
        Err(AppError::ExecutionFailed(
            String::from_utf8_lossy(&output.stderr).to_string()
        ))?
    }
}
```

## File operations
- Validate paths; reject absolute paths outside app's allowed dirs (`%APPDATA%`, workspace root).
- Use `std::fs` for reading/writing; handle errors gracefully.
- Never log file contents or paths containing secrets.

## Data serialization
- All command arguments and return types must be serializable (`#[derive(Serialize, Deserialize)]`).
- Keep models in sync with frontend TypeScript interfaces.
- Use `serde` attributes for field mapping if names differ:
```rust
#[derive(Serialize, Deserialize)]
pub struct ProfileStatus {
    #[serde(rename = "profileName")]
    pub profile_name: String,
    pub is_active: bool,
}
```

## Logging
- Use `log::info!`, `log::warn!`, `log::error!` macros.
- Sanitize sensitive data before logging; never log passwords or command arguments containing secrets.
- Structured logging: include context (profile name, operation, result).

## Testing
- Unit tests in `src/services/*.rs` files (mock system calls where possible).
- Use `tokio::test` for async tests.
- Example:
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_apply_profile_validates_input() {
        let result = apply_profile("invalid!@#".to_string()).await;
        assert!(result.is_err());
    }
}
```

## Dependencies
- Pin to exact versions in `Cargo.toml` for reproducibility.
- Minimize transitive deps; audit with `cargo audit`.
- Key Tauri crates: `tauri`, `tauri-build`, `serde`, `serde_json`, `tokio`.
