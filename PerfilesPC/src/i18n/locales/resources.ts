import { enTranslation } from './en/index'
import { esTranslation } from './es/index'

export const resources = {
  es: { translation: esTranslation },
  en: { translation: enTranslation },
} as const
