import React, { useEffect, useState } from 'react';
import {
  fetchAuthenticatedBlob,
  isProtectedAssetUrl,
  resolveAuthenticatedAssetUrl,
} from '@/lib/authenticatedAsset';

function revokeBlobUrl(url) {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
}

/**
 * Renders images that require auth (/api/integrations/files/* or legacy /uploads/*).
 * Public and data URLs are passed through to a normal img tag.
 */
export default function AuthenticatedImage({ src, alt = '', className, ...props }) {
  const [displaySrc, setDisplaySrc] = useState(() =>
    src && !isProtectedAssetUrl(src) ? resolveAuthenticatedAssetUrl(src) : null
  );

  useEffect(() => {
    let cancelled = false;
    let activeBlobUrl = null;

    async function load() {
      if (!src) {
        setDisplaySrc((prev) => {
          revokeBlobUrl(prev);
          return null;
        });
        return;
      }

      if (!isProtectedAssetUrl(src)) {
        setDisplaySrc((prev) => {
          revokeBlobUrl(prev);
          return resolveAuthenticatedAssetUrl(src);
        });
        return;
      }

      setDisplaySrc((prev) => {
        revokeBlobUrl(prev);
        return null;
      });

      const blobUrl = await fetchAuthenticatedBlob(src);
      if (cancelled) {
        revokeBlobUrl(blobUrl);
        return;
      }

      activeBlobUrl = blobUrl;
      setDisplaySrc(blobUrl);
    }

    load();

    return () => {
      cancelled = true;
      revokeBlobUrl(activeBlobUrl);
    };
  }, [src]);

  if (!displaySrc) {
    return <div className={className} aria-hidden="true" {...props} />;
  }

  return <img src={displaySrc} alt={alt} className={className} {...props} />;
}
