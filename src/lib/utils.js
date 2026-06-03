import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
} 


export const isIframe = window.self !== window.top;

/** Safe in-app path for react-router navigate() from a return URL or path. */
export function resolveAppPath(raw, fallback = '/') {
  if (!raw || typeof raw !== 'string') return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;

  try {
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
      return trimmed.startsWith('/login') ? fallback : trimmed;
    }

    const url = new URL(trimmed, window.location.origin);
    if (url.origin !== window.location.origin) return fallback;

    const path = `${url.pathname}${url.search}${url.hash}` || fallback;
    return path.startsWith('/login') ? fallback : path;
  } catch {
    return fallback;
  }
}
