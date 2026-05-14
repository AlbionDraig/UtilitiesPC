import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { applyProfile, fetchAppStatus, fetchProfiles, isTauriRuntime } from '../api/profiles'
import type { AppStatus, Profile } from '../types/profiles'

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

interface UseProfilesManagerResult {
  profiles: Profile[]
  appStatus: AppStatus | null
  tauriRuntime: boolean
  error: string | null
  success: string | null
  info: string | null
  warning: string | null
  loadingProfileId: string | null
  onApplyProfile: (profileId: string) => Promise<void>
}

function getBackendErrorCode(rawError: string): string {
  return rawError.split('|')[0]?.trim().toLowerCase() ?? 'unknown'
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
      setSuccess(t('app.messages.applySuccess', { profileName }))
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      const details = String(err)
      const backendCode = getBackendErrorCode(details)

      if (backendCode === 'admin_required') {
        setError(t('app.messages.adminRequired'))
        return
      }

      if (backendCode === 'profile_not_found') {
        setError(t('app.messages.profileNotFound'))
        return
      }

      if (backendCode === 'script_execution_failed') {
        setError(t('app.messages.scriptExecutionFailed'))
        return
      }

      if (backendCode === 'profile_apply_failed') {
        setError(t('app.messages.profileApplyFailed'))
        return
      }

      setError(t('app.messages.applyError', { details }))
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
    onApplyProfile,
  }
}
