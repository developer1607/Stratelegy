const TOKEN_KEY = 'access_token';
const LEGACY_TOKEN_KEY = 'app_access_token';

function readStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/** One-time migration from legacy app_access_token storage. */
export function migrateLegacyToken() {
  const legacy = localStorage.getItem(LEGACY_TOKEN_KEY);
  if (legacy && !readStoredToken()) {
    localStorage.setItem(TOKEN_KEY, legacy);
  }
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function getToken() {
  migrateLegacyToken();
  return readStoredToken();
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } else {
    clearToken();
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function hasToken() {
  return Boolean(getToken());
}
