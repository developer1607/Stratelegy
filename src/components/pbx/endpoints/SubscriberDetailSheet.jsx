import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { pbxApi } from '@/api/pbx';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { usePermissions } from '@/hooks/usePermissions';
import { canAccessPbxDataScope } from '@/lib/permissions';
import { formatPbxCell } from '@/lib/pbxTable';
import { endpointStatusBadge } from '@/lib/pbxEndpointUtils';

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-100 last:border-0 text-sm">
      <dt className="text-gray-500 font-medium">{label}</dt>
      <dd className="col-span-2 text-gray-900 break-words">{formatPbxCell(value)}</dd>
    </div>
  );
}

export default function SubscriberDetailSheet({ domain, subscriber, open, onOpenChange }) {
  const { permissions } = usePermissions();
  const ext = subscriber?.user;
  const canUc = canAccessPbxDataScope(permissions, 'extensions');
  const canE911 = canAccessPbxDataScope(permissions, 'e911Review');

  const ucQ = useQuery({
    queryKey: ['pbx-uc-config', domain, ext],
    queryFn: () => pbxApi.ucConfig(domain, ext, { include_entitlement: 1 }),
    enabled: open && !!domain && !!ext && canUc,
  });

  const e911Q = useQuery({
    queryKey: ['pbx-e911-detail', subscriber?.caller_id],
    queryFn: () => pbxApi.e911Detail(String(subscriber.caller_id).replace(/\D/g, '').slice(-11)),
    enabled: open && !!subscriber?.caller_id && canE911 && /\d{10,}/.test(String(subscriber.caller_id)),
    retry: false,
  });

  if (!subscriber) return null;

  const status = endpointStatusBadge(subscriber.online_status);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 flex-wrap">
            <span>
              {subscriber.user} — {subscriber.name || 'Extension'}
            </span>
            <Badge className={status.className}>{status.label}</Badge>
          </SheetTitle>
          <SheetDescription>
            {domain ? `Domain ${domain}` : 'Extension details'}
          </SheetDescription>
        </SheetHeader>

        <dl className="mt-4">
          <DetailRow label="Extension" value={subscriber.user} />
          <DetailRow label="Name" value={subscriber.name} />
          <DetailRow label="Login" value={subscriber.subscriber_login} />
          <DetailRow label="Email" value={subscriber.email_address} />
          <DetailRow label="Caller ID" value={subscriber.caller_id} />
          <DetailRow label="Scope" value={subscriber.scope} />
          <DetailRow label="Site" value={subscriber.site} />
          <DetailRow label="Department" value={subscriber.department} />
          <DetailRow label="Transport" value={subscriber.transport} />
          <DetailRow label="Geo node" value={subscriber.geo_node} />
          <DetailRow label="WAN IP" value={subscriber.wan_ip} />
          <DetailRow label="MAC" value={subscriber.mac_address} />
          <DetailRow label="Model" value={subscriber.model} />
          <DetailRow label="Service" value={subscriber.srv_code} />
          <DetailRow
            label="Features"
            value={(subscriber.features || []).length ? subscriber.features.join(', ') : null}
          />
          <DetailRow label="Notes" value={subscriber.notes} />
        </dl>

        {canUc && (
          <section className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">UC config</h3>
            {ucQ.isLoading ? (
              <div className="flex items-center text-gray-500 text-sm py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading UC config…
              </div>
            ) : ucQ.error ? (
              <p className="text-sm text-gray-500">UC config unavailable for this extension.</p>
            ) : (
              <ul className="text-sm space-y-1 max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                {(Array.isArray(ucQ.data) ? ucQ.data : ucQ.data ? Object.values(ucQ.data) : [])
                  .slice(0, 12)
                  .map((item, idx) => (
                    <li key={item.id ?? idx} className="flex justify-between gap-2">
                      <span className="text-gray-600 truncate">
                        {item.setting?.display_name || item.setting_name || 'Setting'}
                      </span>
                      <span className="text-gray-900 shrink-0">{formatPbxCell(item.setting_value)}</span>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        )}

        {canE911 && subscriber.caller_id && (
          <section className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">E911</h3>
            {e911Q.isLoading ? (
              <div className="flex items-center text-gray-500 text-sm py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading E911…
              </div>
            ) : e911Q.error || !e911Q.data ? (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                No E911 record for this caller ID.
              </p>
            ) : (
              <div className="text-sm border rounded-lg p-3 bg-gray-50 space-y-1">
                <p>
                  <span className="text-gray-500">Phone:</span> {e911Q.data.phone_number}
                </p>
                <p>
                  <span className="text-gray-500">Routing:</span>{' '}
                  {e911Q.data.location?.level_of_service?.routing_status || '—'}
                </p>
                <p>
                  <span className="text-gray-500">City:</span>{' '}
                  {e911Q.data.location?.address?.civic_address?.city || '—'}
                </p>
              </div>
            )}
          </section>
        )}
      </SheetContent>
    </Sheet>
  );
}
