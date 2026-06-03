import { config } from '../../config.js';
import { getSkySwitchAccessToken } from './auth.js';

/** Normalize SkySwitch object-keyed responses into arrays. */
export function toArray(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') return Object.values(data);
  return [];
}

export async function skyswitchRequest(method, path, { query, body } = {}) {
  const token = await getSkySwitchAccessToken();
  const url = new URL(path, config.skyswitch.apiBaseUrl);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value != null && value !== '') url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const upstreamMessage =
      (isJson && (data?.message || data?.error)) ||
      (typeof data === 'string' && !data.includes('<title>') ? data : null);
    const err = new Error(upstreamMessage || `Phone system request failed (${res.status})`);
    err.status = res.status >= 500 ? 502 : res.status;
    err.data = isJson && data && typeof data === 'object' ? { code: data.code } : undefined;
    err.expose = res.status < 500;
    throw err;
  }

  return data;
}

export function accountPath(suffix) {
  const accountId = config.skyswitch.accountId;
  const path = `/accounts/${accountId}${suffix.startsWith('/') ? suffix : `/${suffix}`}`;
  return path;
}
