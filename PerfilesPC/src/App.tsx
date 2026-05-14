import { useState, useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import './App.css'

interface Profile {
  id: string
  name: string
  description: string
  script: string
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

function App() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const tauriRuntime = isTauriRuntime()

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
          <div key={profile.id} className="profile-card">
            <h2>{profile.name}</h2>
            <p className="profile-description">{profile.description}</p>
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
