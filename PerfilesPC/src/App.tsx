import { useState, useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import './App.css'

interface Profile {
  id: string
  name: string
  description: string
  script: string
}

type Locale = 'es' | 'en'

interface LocalizedProfileContent {
  description: string
  focus: string
  target: string
  indicators: string[]
}

interface ProfileDetail {
  intensity: 'high' | 'medium'
  content: Record<Locale, LocalizedProfileContent>
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

function detectLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'es'
  }

  return window.navigator.language.toLowerCase().startsWith('en') ? 'en' : 'es'
}

const uiText = {
  es: {
    title: 'Gestor de Perfiles PC',
    subtitle: 'Selecciona un perfil para optimizar tu sistema',
    browserInfo:
      'Modo navegador: la aplicacion muestra perfiles, pero solo puede aplicarlos dentro de la app de escritorio Tauri.',
    loadErrorPrefix: 'Error al cargar perfiles:',
    applyErrorPrefix: 'Error:',
    applyLoading: 'Aplicando...',
    applyButton: 'Aplicar perfil',
    desktopOnly: 'Solo app desktop',
    impact: 'Impacto',
    focus: 'Foco',
    target: 'Objetivo',
    intensity: {
      medium: 'medio',
      high: 'alto',
    },
    fallbackProfile: 'Perfil personalizado',
    fallbackTarget: 'Uso general',
    fallbackIndicator: 'Configuracion no detallada en frontend',
    profileIndicatorsLabel: 'Indicadores del perfil',
  },
  en: {
    title: 'PC Profile Manager',
    subtitle: 'Select a profile to optimize your system',
    browserInfo:
      'Browser mode: profiles are visible, but they can only be applied inside the Tauri desktop app.',
    loadErrorPrefix: 'Error loading profiles:',
    applyErrorPrefix: 'Error:',
    applyLoading: 'Applying...',
    applyButton: 'Apply profile',
    desktopOnly: 'Desktop app only',
    impact: 'Impact',
    focus: 'Focus',
    target: 'Target',
    intensity: {
      medium: 'medium',
      high: 'high',
    },
    fallbackProfile: 'Custom profile',
    fallbackTarget: 'General usage',
    fallbackIndicator: 'Configuration details are not available in frontend',
    profileIndicatorsLabel: 'Profile indicators',
  },
} as const

const profileDetails: Record<string, ProfileDetail> = {
  gamer: {
    intensity: 'medium',
    content: {
      es: {
        description: 'Optimizado para juegos',
        focus: 'Rendimiento gaming',
        target: 'FPS estables',
        indicators: [
          'Cierra procesos pesados en segundo plano',
          'Reduce consumo de RAM de apps no esenciales',
          'Libera recursos para GPU y juego activo',
        ],
      },
      en: {
        description: 'Optimized for gaming',
        focus: 'Gaming performance',
        target: 'Stable FPS',
        indicators: [
          'Closes heavy background processes',
          'Reduces RAM usage from non-essential apps',
          'Frees resources for GPU and active game',
        ],
      },
    },
  },
  trabajo: {
    intensity: 'medium',
    content: {
      es: {
        description: 'Perfil productivo estandar',
        focus: 'Productividad diaria',
        target: 'Estabilidad general',
        indicators: [
          'Mantiene apps necesarias para oficina',
          'Evita cierres agresivos de servicios utiles',
          'Prioriza estabilidad sobre maximo rendimiento',
        ],
      },
      en: {
        description: 'Standard productivity profile',
        focus: 'Daily productivity',
        target: 'General stability',
        indicators: [
          'Keeps office-essential apps running',
          'Avoids aggressive shutdown of useful services',
          'Prioritizes stability over maximum performance',
        ],
      },
    },
  },
  gamer_agresivo: {
    intensity: 'high',
    content: {
      es: {
        description: 'Maximo rendimiento para gaming extremo',
        focus: 'Rendimiento maximo',
        target: 'Latencia minima',
        indicators: [
          'Cierre agresivo de procesos no criticos',
          'Prioriza recursos para juego en primer plano',
          'Disenado para sesiones de alto consumo',
        ],
      },
      en: {
        description: 'Maximum performance for extreme gaming',
        focus: 'Maximum performance',
        target: 'Minimum latency',
        indicators: [
          'Aggressively closes non-critical processes',
          'Prioritizes resources for foreground game',
          'Designed for high-demand sessions',
        ],
      },
    },
  },
  trabajo_dev: {
    intensity: 'medium',
    content: {
      es: {
        description: 'Optimizado para desarrollo',
        focus: 'Entorno de desarrollo',
        target: 'Flujo dev fluido',
        indicators: [
          'Conserva herramientas de desarrollo activas',
          'Equilibra rendimiento con multitarea tecnica',
          'Optimiza para IDE, terminal y navegador',
        ],
      },
      en: {
        description: 'Optimized for development',
        focus: 'Development environment',
        target: 'Smooth dev workflow',
        indicators: [
          'Keeps development tools active',
          'Balances performance with technical multitasking',
          'Optimized for IDE, terminal, and browser',
        ],
      },
    },
  },
}

function App() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [locale, setLocale] = useState<Locale>(detectLocale())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const tauriRuntime = isTauriRuntime()
  const t = uiText[locale]

  const getDetail = (profileId: string, defaultDescription: string): ProfileDetail => {
    return (
      profileDetails[profileId] ?? {
        intensity: 'medium',
        content: {
          es: {
            description: defaultDescription,
            focus: uiText.es.fallbackProfile,
            target: uiText.es.fallbackTarget,
            indicators: [uiText.es.fallbackIndicator],
          },
          en: {
            description: defaultDescription,
            focus: uiText.en.fallbackProfile,
            target: uiText.en.fallbackTarget,
            indicators: [uiText.en.fallbackIndicator],
          },
        },
      }
    )
  }

  const loadProfiles = useCallback(async () => {
    if (!tauriRuntime) {
      setProfiles(fallbackProfiles)
      setInfo(uiText[locale].browserInfo)
      return
    }

    try {
      const profilesList = await invoke<Profile[]>('get_profiles')
      setProfiles(profilesList)
    } catch (err) {
      setError(`${uiText[locale].loadErrorPrefix} ${err}`)
    }
  }, [tauriRuntime, locale])

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
      setError(`${t.applyErrorPrefix} ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-toolbar">
          <h1>⚙️ {t.title}</h1>
          <div className="locale-switch" role="group" aria-label="Language selector">
            <button
              type="button"
              className={`locale-button ${locale === 'es' ? 'locale-button--active' : ''}`}
              onClick={() => setLocale('es')}
            >
              ES
            </button>
            <button
              type="button"
              className={`locale-button ${locale === 'en' ? 'locale-button--active' : ''}`}
              onClick={() => setLocale('en')}
            >
              EN
            </button>
          </div>
        </div>
        <p>{t.subtitle}</p>
      </header>

      {info && <div className="alert alert-info">{info}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <main className="profiles-grid">
        {profiles.map((profile) => {
          const detail = getDetail(profile.id, profile.description)
          const localized = detail.content[locale]

          return (
            <div key={profile.id} className={`profile-card profile-card--${profile.id}`}>
              <div className="profile-card-header">
                <h2>{profile.name}</h2>
                <span className={`intensity-pill intensity-pill--${detail.intensity}`}>
                  {t.impact}: {t.intensity[detail.intensity]}
                </span>
              </div>
              <p className="profile-description">{localized.description}</p>

              <div className="profile-meta">
                <span className="meta-pill">
                  {t.focus}: {localized.focus}
                </span>
                <span className="meta-pill">
                  {t.target}: {localized.target}
                </span>
              </div>

              <ul className="profile-indicators" aria-label={`${t.profileIndicatorsLabel} ${profile.name}`}>
                {localized.indicators.map((indicator) => (
                <li key={indicator}>{indicator}</li>
              ))}
              </ul>

              <button
                onClick={() => applyProfile(profile.id)}
                disabled={loading || !tauriRuntime}
                className="profile-button"
              >
                {loading ? t.applyLoading : tauriRuntime ? t.applyButton : t.desktopOnly}
              </button>
            </div>
          )
        })}
      </main>
    </div>
  )
}

export default App
