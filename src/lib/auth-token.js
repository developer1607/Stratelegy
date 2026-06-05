const TOKEN_KEY = 'access_token';

export function getToken(urlToken) {
  if (urlToken) return urlToken;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    clearToken();
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function hasToken(urlToken) {
  return Boolean(getToken(urlToken));
}
