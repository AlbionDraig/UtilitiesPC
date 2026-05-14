import { invoke } from '@tauri-apps/api/core'
import type { AppStatus, Profile } from '../types/profiles'

export function isTauriRuntime(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
}

export async function fetchAppStatus(): Promise<AppStatus> {
  return invoke<AppStatus>('get_app_status')
}

export async function fetchProfiles(): Promise<Profile[]> {
  return invoke<Profile[]>('get_profiles')
}

export async function applyProfile(profileId: string): Promise<string> {
  return invoke<string>('apply_profile', { profileId })
}
