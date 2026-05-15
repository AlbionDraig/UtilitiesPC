import { useCallback, useEffect, useState } from 'react'
import { getProfileAppConfig, saveProfileAppConfig } from '../api/config'
import { isTauriRuntime } from '../api/profiles'
import { DEFAULT_CONFIG } from '../constants/defaultConfig'
import type { AppRule, FullConfig } from '../types/config'

export function useAdminPanel() {
  const tauriRuntime = isTauriRuntime()
  const [config, setConfig] = useState<FullConfig | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!tauriRuntime) {
      setConfig(DEFAULT_CONFIG)
      return
    }
    getProfileAppConfig()
      .then(setConfig)
      .catch(() => setConfig(DEFAULT_CONFIG))
  }, [tauriRuntime])

  const addRule = useCallback((profileId: string, rule: AppRule) => {
    setConfig((prev) => {
      if (!prev) return prev
      const existing = prev.profiles[profileId]?.rules ?? []
      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [profileId]: { rules: [...existing, rule] },
        },
      }
    })
    setDirty(true)
  }, [])

  const removeRule = useCallback((profileId: string, ruleId: string) => {
    setConfig((prev) => {
      if (!prev) return prev
      const existing = prev.profiles[profileId]?.rules ?? []
      return {
        ...prev,
        profiles: {
          ...prev.profiles,
          [profileId]: { rules: existing.filter((r) => r.id !== ruleId) },
        },
      }
    })
    setDirty(true)
  }, [])

  const save = useCallback(async () => {
    if (!config) return
    if (!tauriRuntime) {
      setSaveError('El guardado solo está disponible en la app de escritorio.')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      await saveProfileAppConfig(config)
      setDirty(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(typeof err === 'string' ? err : 'Error al guardar la configuracion')
    } finally {
      setSaving(false)
    }
  }, [config])

  return { config, saving, saveError, saved, dirty, addRule, removeRule, save }
}
