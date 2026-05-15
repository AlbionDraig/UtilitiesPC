interface BackendErrorPayload {
  code: string
  profileId?: string
}

function parseJsonErrorPayload(rawError: string): BackendErrorPayload | null {
  try {
    const parsed = JSON.parse(rawError) as Partial<BackendErrorPayload>
    if (!parsed || typeof parsed.code !== 'string') {
      return null
    }

    return {
      code: parsed.code,
      profileId: parsed.profileId,
    }
  } catch {
    return null
  }
}

export function getBackendErrorCode(rawError: string): string {
  const payload = parseJsonErrorPayload(rawError)
  if (payload) {
    return payload.code.trim().toLowerCase()
  }

  return rawError.split('|')[0]?.trim().toLowerCase() ?? 'unknown'
}

export function mapApplyErrorToMessageKey(rawError: string): string {
  const backendCode = getBackendErrorCode(rawError)

  if (backendCode === 'admin_required') {
    return 'app.messages.adminRequired'
  }

  if (backendCode === 'profile_not_found') {
    return 'app.messages.profileNotFound'
  }

  if (backendCode === 'script_execution_failed') {
    return 'app.messages.scriptExecutionFailed'
  }

  if (backendCode === 'profile_apply_failed') {
    return 'app.messages.profileApplyFailed'
  }

  return 'app.messages.applyError'
}
