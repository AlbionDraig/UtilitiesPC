import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { applyProfile, fetchAppStatus, fetchProfiles, isTauriRuntime } from '../api/profiles'
import { mapApplyErrorToMessageKey } from './profileErrorMapper'
import type { AppStatus, Profile } from '../types/profiles'

const fallbackProfiles: Profile[] = [
  {
    id: 'gamer',
    name: 'Gamer',
    description: 'Optimizado para juegos',
  },
  {
    id: 'trabajo',
    name: 'Trabajo',
    description: 'Perfil productivo estandar',
  },
  {
    id: 'gamer_agresivo',
    name: 'Gamer Agresivo',
    description: 'Maximo rendimiento para gaming extremo',
  },
  {
    id: 'trabajo_dev',
    name: 'Trabajo Dev',
    description: 'Optimizado para desarrollo',
  },
]

interface UseProfilesManagerResult {
  profiles: Profile[]
  appStatus: AppStatus | null
  tauriRuntime: boolean
  error: string | null
  success: string | null
  info: string | null
  warning: string | null
  loadingProfileId: string | null
  activeProfileId: string | null
  onApplyProfile: (profileId: string) => Promise<void>
}

export function useProfilesManager(): UseProfilesManagerResult {
  const { t } = useTranslation()
  const tauriRuntime = isTauriRuntime()

  const [profiles, setProfiles] = useState<Profile[]>([])
  const [appStatus, setAppStatus] = useState<AppStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [loadingProfileId, setLoadingProfileId] = useState<string | null>(null)
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null)

  const loadProfiles = useCallback(async () => {
    setWarning(null)
    setError(null)

    if (!tauriRuntime) {
      setProfiles(fallbackProfiles)
      setInfo(t('app.messages.browserInfo'))
      setAppStatus(null)
      return
    }

    try {
      const status = await fetchAppStatus()
      setAppStatus(status)
      setInfo(
        status.canApplyProfiles
          ? t('app.messages.desktopStatusReady')
          : t('app.messages.desktopStatusBlocked'),
      )

      if (!status.canApplyProfiles) {
        const reasonCode = status.reason?.toLowerCase()
        setWarning(
          reasonCode === 'admin_required'
            ? t('app.messages.adminRequired')
            : t('app.messages.desktopStatusBlocked'),
        )
      }

      const profilesList = await fetchProfiles()
      setProfiles(profilesList)
    } catch (err) {
      setError(t('app.messages.loadError', { details: String(err) }))
    }
  }, [tauriRuntime, t])

  useEffect(() => {
    void loadProfiles()
  }, [loadProfiles])

  const onApplyProfile = async (profileId: string) => {
    if (!tauriRuntime || !appStatus?.canApplyProfiles) {
      setError(t('app.messages.adminRequired'))
      return
    }

    setLoadingProfileId(profileId)
    setError(null)
    setSuccess(null)

    try {
      const appliedProfileId = await applyProfile(profileId)
      const profileName = t(`profile.names.${appliedProfileId}`, { defaultValue: profileId })
      setActiveProfileId(appliedProfileId)
      setSuccess(t('app.messages.applySuccess', { profileName }))
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      const details = String(err)
      const errorMessageKey = mapApplyErrorToMessageKey(details)
      setError(
        errorMessageKey === 'app.messages.applyError'
          ? t(errorMessageKey, { details })
          : t(errorMessageKey),
      )
    } finally {
      setLoadingProfileId(null)
    }
  }

  return {
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
  }
}
