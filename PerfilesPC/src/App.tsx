import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import './App.css'

interface Profile {
  id: string
  name: string
  description: string
  script: string
}

function App() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      const profilesList = await invoke<Profile[]>('get_profiles')
      setProfiles(profilesList)
    } catch (err) {
      setError(`Error al cargar perfiles: ${err}`)
    }
  }

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

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <main className="profiles-grid">
        {profiles.map((profile) => (
          <div key={profile.id} className="profile-card">
            <h2>{profile.name}</h2>
            <p className="profile-description">{profile.description}</p>
            <button
              onClick={() => applyProfile(profile.id)}
              disabled={loading}
              className="profile-button"
            >
              {loading ? 'Aplicando...' : 'Aplicar Perfil'}
            </button>
          </div>
        ))}
      </main>
    </div>
  )
}

export default App
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
