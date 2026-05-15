export interface Profile {
  id: string
  name: string
  description: string
}

export interface AppStatus {
  platform: string
  isAdmin: boolean
  canApplyProfiles: boolean
  reason: string | null
}

export type SupportedLocale = 'es' | 'en'

export interface LocalizedProfileContent {
  description: string
  focus: string
  target: string
  indicators: string[]
}

export interface ProfileDetail {
  intensity: 'high' | 'medium'
}
