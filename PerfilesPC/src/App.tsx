import { useState, useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import './App.css'

interface Profile {
  id: string
  name: string
  description: string
  script: string
}

interface ProfileDetail {
  intensity: 'alta' | 'media'
  focus: string
  target: string
  indicators: string[]
}

const fallbackProfiles: Profile[] = [
  {
    id: 'gamer',
    name: 'Gamer',
    description: 'Optimizado para juegos',
    script: 'perfil_gamer.ps1',
  },
  {
    id: 'trabajo',
    name: 'Trabajo',
    description: 'Perfil productivo estandar',
    script: 'perfil_trabajo.ps1',
  },
  {
    id: 'gamer_agresivo',
    name: 'Gamer Agresivo',
    description: 'Maximo rendimiento para gaming extremo',
    script: 'perfil_gamer_agresivo.ps1',
  },
  {
    id: 'trabajo_dev',
    name: 'Trabajo Dev',
    description: 'Optimizado para desarrollo',
    script: 'perfil_trabajo_dev.ps1',
  },
]

function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

const profileDetails: Record<string, ProfileDetail> = {
  gamer: {
    intensity: 'media',
    focus: 'Rendimiento gaming',
    target: 'FPS estables',
    indicators: [
      'Cierra procesos pesados en segundo plano',
      'Reduce consumo de RAM de apps no esenciales',
      'Libera recursos para GPU y juego activo',
    ],
  },
  trabajo: {
    intensity: 'media',
    focus: 'Productividad diaria',
    target: 'Estabilidad general',
    indicators: [
      'Mantiene apps necesarias para oficina',
      'Evita cierres agresivos de servicios utiles',
      'Prioriza estabilidad sobre maximo rendimiento',
    ],
  },
  gamer_agresivo: {
    intensity: 'alta',
    focus: 'Rendimiento maximo',
    target: 'Latencia minima',
    indicators: [
      'Cierre agresivo de procesos no criticos',
      'Prioriza recursos para juego en primer plano',
      'Disenado para sesiones de alto consumo',
    ],
  },
  trabajo_dev: {
    intensity: 'media',
    focus: 'Entorno de desarrollo',
    target: 'Flujo dev fluido',
    indicators: [
      'Conserva herramientas de desarrollo activas',
      'Equilibra rendimiento con multitarea tecnica',
      'Optimiza para IDE, terminal y navegador',
    ],
  },
}

function App() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const tauriRuntime = isTauriRuntime()

  const getDetail = (profileId: string): ProfileDetail => {
    return (
      profileDetails[profileId] ?? {
        intensity: 'media',
        focus: 'Perfil personalizado',
        target: 'Uso general',
        indicators: ['Configuracion no detallada en frontend'],
      }
    )
  }

  const loadProfiles = useCallback(async () => {
    if (!tauriRuntime) {
      setProfiles(fallbackProfiles)
      setInfo(
        'Modo navegador: la aplicacion muestra perfiles, pero solo puede aplicarlos dentro de la app de escritorio Tauri.',
      )
      return
    }

    try {
      const profilesList = await invoke<Profile[]>('get_profiles')
      setProfiles(profilesList)
    } catch (err) {
      setError(`Error al cargar perfiles: ${err}`)
    }
  }, [tauriRuntime])

  useEffect(() => {
    loadProfiles()
  }, [loadProfiles])

  const applyProfile = async (profileId: string) => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const message = await invoke<string>('apply_profile', {
        profileId,
      })
      setSuccess(message)
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError(`Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>⚙️ Gestor de Perfiles PC</h1>
        <p>Selecciona un perfil para optimizar tu sistema</p>
      </header>

      {info && <div className="alert alert-info">{info}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <main className="profiles-grid">
        {profiles.map((profile) => (
          <div key={profile.id} className={`profile-card profile-card--${profile.id}`}>
            <div className="profile-card-header">
              <h2>{profile.name}</h2>
              <span className={`intensity-pill intensity-pill--${getDetail(profile.id).intensity}`}>
                impacto {getDetail(profile.id).intensity}
              </span>
            </div>
            <p className="profile-description">{profile.description}</p>

            <div className="profile-meta">
              <span className="meta-pill">Foco: {getDetail(profile.id).focus}</span>
              <span className="meta-pill">Objetivo: {getDetail(profile.id).target}</span>
            </div>

            <ul className="profile-indicators" aria-label={`Indicadores del perfil ${profile.name}`}>
              {getDetail(profile.id).indicators.map((indicator) => (
                <li key={indicator}>{indicator}</li>
              ))}
            </ul>

            <button
              onClick={() => applyProfile(profile.id)}
              disabled={loading || !tauriRuntime}
              className="profile-button"
            >
              {loading ? 'Aplicando...' : tauriRuntime ? 'Aplicar Perfil' : 'Solo app desktop'}
            </button>
          </div>
        ))}
      </main>
    </div>
  )
}

export default App
