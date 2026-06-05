const NETWORK_ERROR_CODES = new Set([
  'EAI_AGAIN',
  'ENOTFOUND',
  'ECONNREFUSED',
  'ECONNRESET',
  'ENETUNREACH',
  'EHOSTUNREACH',
]);

export function isSkySwitchNetworkError(err) {
  let current = err;
  while (current) {
    if (current.code && NETWORK_ERROR_CODES.has(current.code)) return true;
    if (current.message === 'fetch failed') return true;
    current = current.cause;
  }
  return false;
}

export function toSkySwitchNetworkError() {
  const err = new Error(
    'Unable to reach the phone system. Check your network connection or SkySwitch API settings.'
  );
  err.status = 503;
  err.expose = true;
  return err;
}
