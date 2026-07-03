import React, { useState } from 'react';
import { Pencil } from 'lucide-react';
import PermissionGate from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import E911DomainDefaultsSheet from '@/components/pbx/e911/E911DomainDefaultsSheet';

export default function E911DomainDefaultsCard({ domain, defaults, capabilities, onSuccess }) {
  const [open, setOpen] = useState(false);

  if (!defaults) return null;

  const fields = [
    { label: 'Domain caller ID', value: defaults.caller_id },
    { label: 'Caller ID name', value: defaults.caller_id_name },
    { label: 'Domain 911 CID', value: defaults.e911_caller_id },
  ];

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Domain caller ID defaults
            </p>
            <p className="text-sm text-gray-600 mt-1">
              PBX domain-level defaults from <code className="text-xs">callid_emgr</code> /{' '}
              <code className="text-xs">callid_nmbr</code>. Use the emergency pool tab to manage
              routable 911 numbers when extensions use <code className="text-xs">[*]</code>.
            </p>
          </div>
          <PermissionGate pbxAction="manageE911">
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit defaults
            </Button>
          </PermissionGate>
        </div>
        <dl className="grid gap-3 sm:grid-cols-3 text-sm">
          {fields.map((field) => (
            <div key={field.label}>
              <dt className="text-gray-500">{field.label}</dt>
              <dd className="font-medium text-gray-900 mt-0.5">{field.value || '—'}</dd>
            </div>
          ))}
        </dl>
        {!capabilities?.domainDefaultsWrite ? (
          <p className="text-xs text-amber-700">
            This portal may not accept domain default updates via API. Emergency pool management
            remains available.
          </p>
        ) : null}
      </div>

      <E911DomainDefaultsSheet
        domain={domain}
        defaults={defaults}
        open={open}
        onOpenChange={setOpen}
        onSuccess={onSuccess}
      />
    </>
  );
}
