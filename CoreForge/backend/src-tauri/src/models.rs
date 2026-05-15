#[derive(serde::Serialize, serde::Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum AppAction {
    Close,
    Open,
}

/// Rule that defines what to close or open when a profile is applied.
#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AppRule {
    pub id: String,
    pub label: String,
    pub action: AppAction,
    /// Process name to kill (Close action). May omit ".exe" — both forms are tried.
    pub process_name: Option<String>,
    /// Executable path or command to launch (Open action).
    pub executable_path: Option<String>,
    /// Optional arguments for the launched executable.
    #[serde(default)]
    pub args: Vec<String>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug, Default)]
#[serde(rename_all = "camelCase")]
pub struct ProfileRules {
    pub rules: Vec<AppRule>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct FullConfig {
    pub profiles: std::collections::HashMap<String, ProfileRules>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub description: String,
}

#[derive(serde::Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AppStatus {
    pub platform: String,
    pub is_admin: bool,
    pub can_apply_profiles: bool,
    pub reason: Option<String>,
}

struct ProfileSeed {
    id: &'static str,
    name: &'static str,
    description: &'static str,
}

const PROFILE_SEEDS: [ProfileSeed; 4] = [
    ProfileSeed {
        id: "gamer",
        name: "Gamer",
        description: "Optimizado para juegos",
    },
    ProfileSeed {
        id: "trabajo",
        name: "Trabajo",
        description: "Perfil productivo estándar",
    },
    ProfileSeed {
        id: "gamer_agresivo",
        name: "Gamer Agresivo",
        description: "Máximo rendimiento para gaming extremo",
    },
    ProfileSeed {
        id: "trabajo_dev",
        name: "Trabajo Dev",
        description: "Optimizado para desarrollo",
    },
];

pub fn available_profiles() -> Vec<Profile> {
    PROFILE_SEEDS
        .iter()
        .map(|seed| Profile {
            id: seed.id.to_string(),
            name: seed.name.to_string(),
            description: seed.description.to_string(),
        })
        .collect()
}
