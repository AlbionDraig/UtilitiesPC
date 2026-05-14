import { describe, expect, it } from 'vitest'
import { getBackendErrorCode, mapApplyErrorToMessageKey } from './profileErrorMapper'

describe('getBackendErrorCode', () => {
  it('should extract normalized backend code when error has pipe metadata', () => {
    // Arrange
    const rawError = 'PROFILE_APPLY_FAILED|gamer|12|access denied'

    // Act
    const code = getBackendErrorCode(rawError)

    // Assert
    expect(code).toBe('profile_apply_failed')
  })
})

describe('mapApplyErrorToMessageKey', () => {
  it('should map admin error to admin required message key when backend code is admin_required', () => {
    // Arrange
    const rawError = 'admin_required|permission denied'

    // Act
    const messageKey = mapApplyErrorToMessageKey(rawError)

    // Assert
    expect(messageKey).toBe('app.messages.adminRequired')
  })

  it('should map profile missing error to not found message key when backend code is profile_not_found', () => {
    // Arrange
    const rawError = 'profile_not_found|turbo'

    // Act
    const messageKey = mapApplyErrorToMessageKey(rawError)

    // Assert
    expect(messageKey).toBe('app.messages.profileNotFound')
  })

  it('should map unknown errors to generic apply error key when backend code is not recognized', () => {
    // Arrange
    const rawError = 'unexpected_failure|network down'

    // Act
    const messageKey = mapApplyErrorToMessageKey(rawError)

    // Assert
    expect(messageKey).toBe('app.messages.applyError')
  })
})
