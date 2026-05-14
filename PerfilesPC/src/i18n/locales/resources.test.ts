import { describe, expect, it } from 'vitest'
import { resources } from './resources'

function collectSchemaPaths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    const ownPath = prefix ? [prefix] : []

    if (value.length === 0) {
      return ownPath
    }

    const itemPaths = value.flatMap((item) => collectSchemaPaths(item, `${prefix}[*]`))
    return [...ownPath, ...itemPaths]
  }

  if (value !== null && typeof value === 'object') {
    const ownPath = prefix ? [prefix] : []
    const entries = Object.entries(value as Record<string, unknown>)
    const nested = entries.flatMap(([key, nestedValue]) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key
      return collectSchemaPaths(nestedValue, nextPrefix)
    })

    return [...ownPath, ...nested]
  }

  return prefix ? [prefix] : []
}

function sortedUnique(values: string[]): string[] {
  return [...new Set(values)].sort()
}

describe('resources locales', () => {
  it('should include app title in both locales when resources are initialized', () => {
    // Arrange
    const spanishTitle = resources.es.translation.app.title
    const englishTitle = resources.en.translation.app.title

    // Act
    const bothHaveTitle = spanishTitle.length > 0 && englishTitle.length > 0

    // Assert
    expect(bothHaveTitle).toBe(true)
  })

  it('should expose same profile identifiers in both locales when names dictionary is defined', () => {
    // Arrange
    const spanishProfileIds = Object.keys(resources.es.translation.profile.names).sort()
    const englishProfileIds = Object.keys(resources.en.translation.profile.names).sort()

    // Act
    const haveSameIds = JSON.stringify(spanishProfileIds) === JSON.stringify(englishProfileIds)

    // Assert
    expect(haveSameIds).toBe(true)
  })

  it('should include apply success message key in both locales when app messages are loaded', () => {
    // Arrange
    const spanishMessage = resources.es.translation.app.messages.applySuccess
    const englishMessage = resources.en.translation.app.messages.applySuccess

    // Act
    const bothIncludeMessage = spanishMessage.includes('{{profileName}}') && englishMessage.includes('{{profileName}}')

    // Assert
    expect(bothIncludeMessage).toBe(true)
  })

  it('should preserve equivalent translation schema when comparing spanish and english resources', () => {
    // Arrange
    const spanishSchema = sortedUnique(collectSchemaPaths(resources.es.translation))
    const englishSchema = sortedUnique(collectSchemaPaths(resources.en.translation))

    // Act
    const hasEquivalentSchema = JSON.stringify(spanishSchema) === JSON.stringify(englishSchema)

    // Assert
    expect(hasEquivalentSchema).toBe(true)
  })
})
