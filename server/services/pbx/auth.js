import { config } from '../../config.js';
import { pbxRequest } from './client.js';

/** @type {{ accessToken: string | null, refreshToken: string | null, expiresAt: number, metadata: Record<string, unknown> | null }} */
let tokenCache = {
  accessToken: null,
  refreshToken: null,
  expiresAt: 0,
  metadata: null,
};

function isConfigured() {
  const { apiBaseUrl, clientId, clientSecret, username, password } = config.pbx;
  return Boolean(apiBaseUrl && clientId && clientSecret && username && password);
}

async function requestToken(form) {
  return pbxRequest('POST', 'oauth2/token/', {
    body: form,
    contentType: 'application/x-www-form-urlencoded',
    auth: false,
    parseAs: 'json',
  });
}

function normalizeTokenResponse(data) {
  return {
    accessToken: data?.access_token || null,
    refreshToken: data?.refresh_token || null,
    expiresIn: Number(data?.expires_in) || 3600,
    metadata: {
      scope: data?.scope || null,
      domain: data?.domain || null,
      apiVersion: data?.apiversion || null,
      mfa: data?.mfa || null,
      mfaVendor: data?.mfa_vendor || null,
      mfaType: data?.mfa_type || null,
    },
  };
}

export function pbxIsConfigured() {
  return config.pbx.enabled && isConfigured();
}

export async function getPbxAccessToken() {
  if (!pbxIsConfigured()) {
    const err = new Error('PBX API is not configured');
    err.status = 503;
    err.expose = true;
    throw err;
  }

  const now = Date.now();
  if (tokenCache.accessToken && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.accessToken;
  }

  const { clientId, clientSecret, username, password } = config.pbx;
  let tokenData = null;

  if (tokenCache.refreshToken) {
    try {
      tokenData = await requestToken(
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: tokenCache.refreshToken,
        })
      );
    } catch {
      tokenCache.refreshToken = null;
    }
  }

  if (!tokenData) {
    tokenData = await requestToken(
      new URLSearchParams({
        grant_type: 'password',
        client_id: clientId,
        client_secret: clientSecret,
        username,
        password,
      })
    );
  }

  const normalized = normalizeTokenResponse(tokenData);
  if (normalized.metadata.mfa === 'mfa_required') {
    const err = new Error('PBX API requires MFA for this user');
    err.status = 403;
    err.expose = true;
    err.data = {
      code: 'pbx_mfa_required',
      mfaVendor: normalized.metadata.mfaVendor,
      mfaType: normalized.metadata.mfaType,
    };
    throw err;
  }
  if (!normalized.accessToken) {
    const err = new Error('PBX authentication failed');
    err.status = 502;
    throw err;
  }

  tokenCache = {
    accessToken: normalized.accessToken,
    refreshToken: normalized.refreshToken || tokenCache.refreshToken,
    expiresAt: Date.now() + normalized.expiresIn * 1000,
    metadata: normalized.metadata,
  };

  return tokenCache.accessToken;
}

export function clearPbxTokenCache() {
  tokenCache = {
    accessToken: null,
    refreshToken: null,
    expiresAt: 0,
    metadata: null,
  };
}

export function getCachedPbxTokenMetadata() {
  return tokenCache.metadata;
}
