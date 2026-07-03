import React from 'react';
import { endpointStatusBadge } from '@/lib/pbxEndpointUtils';

export function EndpointStatusCell({ row }) {
  const { label, className } = endpointStatusBadge(row.online_status);
  return (
    <div className="space-y-0.5">
      <span
        className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full text-white ${className}`}
      >
        {label}
      </span>
      {row.online_status === 'offline' && row.downtime ? (
        <p className="text-xs text-red-600">{row.downtime}</p>
      ) : null}
    </div>
  );
}

export function FeatureBadges({ features = [] }) {
  if (!features?.length) return '—';
  return (
    <div className="flex flex-wrap gap-1">
      {features.map((f) => (
        <span
          key={f}
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800"
        >
          {f}
        </span>
      ))}
    </div>
  );
}

export function PhoneStatusCell({ row }) {
  const isOnline = row?.online_status === 'online';
  const label = isOnline ? 'Registered' : 'Unregistered';
  const className = isOnline ? 'bg-green-600' : 'bg-red-600';
  return (
    <div className="space-y-0.5">
      <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full text-white ${className}`}>
        {label}
      </span>
      {row?.registration_time ? (
        <p className="text-xs text-gray-500">{row.registration_time}</p>
      ) : null}
    </div>
  );
}
