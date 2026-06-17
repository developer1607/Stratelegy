import { appParams } from '@/lib/app-params';
import { getToken } from '@/lib/auth-token';

/** Map legacy /uploads paths to the authenticated file API. */
export function resolveAuthenticatedAssetUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/api/integrations/files/')) return url;
  if (url.startsWith('/uploads/')) {
    const name = url.slice('/uploads/'.length);
    return `/api/integrations/files/${encodeURIComponent(name)}`;
  }
  return url;
}

export function isProtectedAssetUrl(url) {
  const resolved = resolveAuthenticatedAssetUrl(url);
  return resolved?.startsWith('/api/integrations/files/');
}

export async function fetchAuthenticatedBlob(url) {
  const resolved = resolveAuthenticatedAssetUrl(url);
  if (!resolved || !isProtectedAssetUrl(resolved)) return null;

  const headers = {
    'X-App-Id': appParams.appId || import.meta.env.VITE_APP_ID || 'stratelegy-insight',
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(resolved, { headers, credentials: 'include' });
  if (!res.ok) return null;
  return URL.createObjectURL(await res.blob());
}
