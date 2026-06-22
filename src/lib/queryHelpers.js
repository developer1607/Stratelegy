/** True for expected auth/permission denials — not app bugs. */
export function isForbiddenError(error) {
  const status = error?.status;
  return status === 403 || status === 401;
}

export function shouldRetryQuery(failureCount, error) {
  if (isForbiddenError(error)) return false;
  return failureCount < 1;
}
