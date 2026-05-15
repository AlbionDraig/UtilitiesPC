export type AppAction = 'close' | 'open'

export interface AppRule {
  id: string
  label: string
  action: AppAction
  processName?: string
  executablePath?: string
  args?: string[]
}

export interface ProfileRules {
  rules: AppRule[]
}

export interface FullConfig {
  profiles: Record<string, ProfileRules>
}
