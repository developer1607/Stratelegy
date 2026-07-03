import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/**
 * Legacy Telco overview — all stats came from SkySwitch APIs.
 * Redirect to Endpoint Control (PBX hybrid operational view).
 */
export default function PBXDashboard() {
  const [searchParams] = useSearchParams();
  const domain = searchParams.get('domain');
  const target = domain
    ? `${createPageUrl('EndpointControl')}?domain=${encodeURIComponent(domain)}`
    : createPageUrl('EndpointControl');
  return <Navigate to={target} replace />;
}
