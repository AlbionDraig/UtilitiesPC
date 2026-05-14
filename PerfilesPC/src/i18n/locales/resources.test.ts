import { describe, expect, it } from 'vitest'
import { resources } from './resources'

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
})
