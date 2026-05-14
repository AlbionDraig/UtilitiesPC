#[derive(Debug, Clone)]
pub enum AppError {
    AdminRequired,
    ProfileNotFound { profile_id: String },
    ScriptResolutionFailed,
    ScriptExecutionFailed,
    ProfileApplyFailed { profile_id: String },
}

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
struct AppErrorPayload {
    code: &'static str,
    #[serde(skip_serializing_if = "Option::is_none")]
    profile_id: Option<String>,
}

impl AppError {
    pub fn code(&self) -> &'static str {
        match self {
            Self::AdminRequired => "admin_required",
            Self::ProfileNotFound { .. } => "profile_not_found",
            Self::ScriptResolutionFailed => "script_resolution_failed",
            Self::ScriptExecutionFailed => "script_execution_failed",
            Self::ProfileApplyFailed { .. } => "profile_apply_failed",
        }
    }

    fn profile_id(&self) -> Option<String> {
        match self {
            Self::ProfileNotFound { profile_id } => Some(profile_id.clone()),
            Self::ProfileApplyFailed { profile_id } => Some(profile_id.clone()),
            _ => None,
        }
    }

    pub fn to_ipc_message(&self) -> String {
        let payload = AppErrorPayload {
            code: self.code(),
            profile_id: self.profile_id(),
        };

        serde_json::to_string(&payload)
            .unwrap_or_else(|_| "{\"code\":\"unknown_error\"}".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::AppError;

    #[test]
    fn should_serialize_admin_error_when_building_ipc_message() {
        let msg = AppError::AdminRequired.to_ipc_message();
        assert!(msg.contains("admin_required"));
    }

    #[test]
    fn should_include_profile_id_when_error_has_profile_context() {
        let msg = AppError::ProfileNotFound {
            profile_id: "turbo".to_string(),
        }
        .to_ipc_message();

        assert!(msg.contains("profile_not_found"));
        assert!(msg.contains("turbo"));
    }
}
