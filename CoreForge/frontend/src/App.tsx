import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './App.css'
import { AdminPanel } from './components/AdminPanel'
import { useProfilesManager } from './hooks/useProfilesManager'
import type { ProfileDetail, SupportedLocale } from './types/profiles'

const profileDetails: Record<string, ProfileDetail> = {
  gamer: {
    intensity: 'medium',
  },
  trabajo: {
    intensity: 'medium',
  },
  gamer_agresivo: {
    intensity: 'high',
  },
  trabajo_dev: {
    intensity: 'medium',
  },
}

function App() {
  const { t, i18n } = useTranslation()
  const {
    profiles,
    appStatus,
    tauriRuntime,
    error,
    success,
    info,
    warning,
    loadingProfileId,
    activeProfileId,
    onApplyProfile,
  } = useProfilesManager()

  const [showAdmin, setShowAdmin] = useState(false)

  const locale = useMemo<SupportedLocale>(() => {
    return i18n.resolvedLanguage?.startsWith('en') ? 'en' : 'es'
  }, [i18n.resolvedLanguage])

  const getLocalizedIndicators = (profileId: string): string[] => {
    const indicators = t(`profile.details.${profileId}.indicators`, {
      returnObjects: true,
      defaultValue: [t('profile.fallback.indicator')],
    })

    return Array.isArray(indicators) ? indicators.map(String) : [t('profile.fallback.indicator')]
  }

  return (
    <div className="app-container">
      {showAdmin && tauriRuntime && (
        <AdminPanel profiles={profiles} onClose={() => setShowAdmin(false)} />
      )}
      <header className="app-header">
        <div className="header-toolbar">
          <h1>⚙️ {t('app.title')}</h1>
          <div className="header-toolbar-right">
            {tauriRuntime && (
              <button
                type="button"
                className="admin-trigger-button"
                onClick={() => setShowAdmin(true)}
                title={t('admin.title')}
              >
                ☰ {t('admin.title')}
              </button>
            )}
            <div className="locale-switch" role="group" aria-label={t('app.languageSelector')}>
            <button
              type="button"
              className={`locale-button ${locale === 'es' ? 'locale-button--active' : ''}`}
              onClick={() => void i18n.changeLanguage('es')}
            >
              ES
            </button>
            <button
              type="button"
              className={`locale-button ${locale === 'en' ? 'locale-button--active' : ''}`}
              onClick={() => void i18n.changeLanguage('en')}
            >
              EN
            </button>
          </div>
          </div>
        </div>
        <p>{t('app.subtitle')}</p>
      </header>

      {info && <div className="alert alert-info">{info}</div>}
      {warning && <div className="alert alert-warning">{warning}</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {tauriRuntime && appStatus && (
        <div className="runtime-status">
          <span className="meta-pill">
            {t('app.runtime')}: {appStatus.platform}
          </span>
          <span className="meta-pill">
            {t('app.permissions')}:{' '}
            {appStatus.isAdmin ? t('app.permissionsAdmin') : t('app.permissionsUser')}
          </span>
          {activeProfileId && (
            <span className="meta-pill meta-pill--active">
              ✓ {t('app.activeProfile')}: {t(`profile.names.${activeProfileId}`, { defaultValue: activeProfileId })}
            </span>
          )}
        </div>
      )}

      {loadingProfileId !== null && (
        <div className="applying-bar" role="status" aria-live="polite">
          <div className="applying-bar-label">
            <span className="applying-bar-spinner" aria-hidden="true" />
            {t('app.applying')}: {t(`profile.names.${loadingProfileId}`, { defaultValue: loadingProfileId })}
          </div>
          <div className="applying-bar-track" aria-hidden="true">
            <div className="applying-bar-fill" />
          </div>
        </div>
      )}

      <main className="profiles-grid">
        {profiles.map((profile) => {
          const detail = profileDetails[profile.id] ?? { intensity: 'medium' }
          const description = t(`profile.details.${profile.id}.description`, {
            defaultValue: profile.description,
          })
          const focus = t(`profile.details.${profile.id}.focus`, {
            defaultValue: t('profile.fallback.focus'),
          })
          const target = t(`profile.details.${profile.id}.target`, {
            defaultValue: t('profile.fallback.target'),
          })
          const profileName = t(`profile.names.${profile.id}`, { defaultValue: profile.name })
          const indicators = getLocalizedIndicators(profile.id)

          return (
            <div key={profile.id} className={`profile-card profile-card--${profile.id}${activeProfileId === profile.id ? ' profile-card--active' : ''}`}>
              <div className="profile-card-header">
                <h2>{profileName}</h2>
                <div className="profile-card-badges">
                  {activeProfileId === profile.id && (
                    <span className="active-badge">✓ {t('app.activeBadge')}</span>
                  )}
                  <span className={`intensity-pill intensity-pill--${detail.intensity}`}>
                    {t('profile.impact')}: {t(`profile.intensity.${detail.intensity}`)}
                  </span>
                </div>
              </div>
              <p className="profile-description">{description}</p>

              <div className="profile-meta">
                <span className="meta-pill">
                  {t('profile.focus')}: {focus}
                </span>
                <span className="meta-pill">
                  {t('profile.target')}: {target}
                </span>
              </div>

              <ul className="profile-indicators" aria-label={`${t('profile.indicatorsLabel')} ${profileName}`}>
                {indicators.map((indicator) => (
                  <li key={indicator}>{indicator}</li>
                ))}
              </ul>

              <button
                onClick={() => void onApplyProfile(profile.id)}
                disabled={loadingProfileId !== null || !tauriRuntime || !appStatus?.canApplyProfiles}
                className="profile-button"
              >
                {loadingProfileId === profile.id
                  ? t('actions.applying')
                  : !tauriRuntime
                    ? t('actions.desktopOnly')
                    : appStatus?.canApplyProfiles
                      ? t('actions.apply')
                      : t('app.messages.adminRequired')}
              </button>
            </div>
          )
        })}
      </main>
    </div>
  )
}

export default App
