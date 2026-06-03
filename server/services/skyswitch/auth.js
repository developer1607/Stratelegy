import { config } from '../../config.js';

/** @type {{ accessToken: string | null, refreshToken: string | null, expiresAt: number }} */
let tokenCache = {
  accessToken: null,
  refreshToken: null,
  expiresAt: 0,
};

function isConfigured() {
  const { accountId, clientId, clientSecret, username, password } = config.skyswitch;
  return Boolean(accountId && clientId && clientSecret && username && password);
}

async function requestToken(body) {
  const res = await fetch(`${config.skyswitch.apiBaseUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || data.error || 'SkySwitch authentication failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function skyswitchIsConfigured() {
  return config.skyswitch.enabled && isConfigured();
}

export async function getSkySwitchAccessToken() {
  if (!skyswitchIsConfigured()) {
    const err = new Error('SkySwitch API is not configured');
    err.status = 503;
    throw err;
  }

  const now = Date.now();
  if (tokenCache.accessToken && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.accessToken;
  }

  const { clientId, clientSecret, username, password, scope } = config.skyswitch;
  let data;

  if (tokenCache.refreshToken) {
    try {
      data = await requestToken({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: tokenCache.refreshToken,
      });
    } catch {
      tokenCache.refreshToken = null;
    }
  }

  if (!data) {
    data = await requestToken({
      grant_type: 'password',
      client_id: clientId,
      client_secret: clientSecret,
      username,
      password,
      scope,
    });
  }

  tokenCache = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || tokenCache.refreshToken,
    expiresAt: Date.now() + (Number(data.expires_in) || 21_600) * 1000,
  };

  return tokenCache.accessToken;
}

export function clearSkySwitchTokenCache() {
  tokenCache = { accessToken: null, refreshToken: null, expiresAt: 0 };
}
