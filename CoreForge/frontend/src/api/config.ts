import { invoke } from '@tauri-apps/api/core'
import type { FullConfig } from '../types/config'

export async function getProfileAppConfig(): Promise<FullConfig> {
  return invoke<FullConfig>('get_profile_app_config')
}

export async function saveProfileAppConfig(config: FullConfig): Promise<void> {
  return invoke<void>('save_profile_app_config', { config })
}
