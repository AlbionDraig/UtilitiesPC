#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct Profile {
    pub id: String,
    pub name: String,
    pub description: String,
    pub script: String,
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
    script: &'static str,
}

const PROFILE_SEEDS: [ProfileSeed; 4] = [
    ProfileSeed {
        id: "gamer",
        name: "Gamer",
        description: "Optimizado para juegos",
        script: "perfil_gamer.ps1",
    },
    ProfileSeed {
        id: "trabajo",
        name: "Trabajo",
        description: "Perfil productivo estándar",
        script: "perfil_trabajo.ps1",
    },
    ProfileSeed {
        id: "gamer_agresivo",
        name: "Gamer Agresivo",
        description: "Máximo rendimiento para gaming extremo",
        script: "perfil_gamer_agresivo.ps1",
    },
    ProfileSeed {
        id: "trabajo_dev",
        name: "Trabajo Dev",
        description: "Optimizado para desarrollo",
        script: "perfil_trabajo_dev.ps1",
    },
];

pub fn available_profiles() -> Vec<Profile> {
    PROFILE_SEEDS
        .iter()
        .map(|seed| Profile {
            id: seed.id.to_string(),
            name: seed.name.to_string(),
            description: seed.description.to_string(),
            script: seed.script.to_string(),
        })
        .collect()
}
