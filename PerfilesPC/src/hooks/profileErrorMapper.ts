export function getBackendErrorCode(rawError: string): string {
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
