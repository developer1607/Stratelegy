const TOKEN_KEY = 'access_token';
const LEGACY_TOKEN_KEYS = ['base44_access_token', 'token', 'app_access_token'];

let migrated = false;

function migrateLegacyTokens() {
  if (migrated || typeof window === 'undefined') return;
  migrated = true;

  const current = localStorage.getItem(TOKEN_KEY);
  if (current) {
    LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
    return;
  }

  for (const key of LEGACY_TOKEN_KEYS) {
    const value = localStorage.getItem(key);
    if (value) {
      localStorage.setItem(TOKEN_KEY, value);
      LEGACY_TOKEN_KEYS.forEach((legacyKey) => localStorage.removeItem(legacyKey));
      return;
    }
  }
}

export function getToken(urlToken) {
  migrateLegacyTokens();
  if (urlToken) return urlToken;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  migrateLegacyTokens();
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  } else {
    clearToken();
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function hasToken(urlToken) {
  return Boolean(getToken(urlToken));
}
