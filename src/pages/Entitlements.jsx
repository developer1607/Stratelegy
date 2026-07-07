import React, { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import DeleteEntitlementAction from '@/components/pbx/extensions/DeleteEntitlementAction';
import EntitlementFormDialog from '@/components/pbx/extensions/EntitlementFormDialog';
import PermissionGate from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';

export default function Entitlements() {
  return (
    <PbxShell
      title="Entitlements"
      description="UC offerings and subscriber entitlements for the selected domain"
    >
      {({ domain }) => <EntitlementsContent domain={domain} />}
    </PbxShell>
  );
}

function EntitlementsContent({ domain }) {
  const queryClient = useQueryClient();

  const refreshEntitlements = () => {
    queryClient.invalidateQueries({ queryKey: ['pbx-entitlements', domain] });
  };

  const entitlementsQ = useQuery({
    queryKey: ['pbx-entitlements', domain],
    queryFn: () => pbxApi.entitlements({ domain }),
    enabled: !!domain,
  });

  const entitlementRows = useMemo(() => {
    const list = Array.isArray(entitlementsQ.data)
      ? entitlementsQ.data
      : entitlementsQ.data
        ? Object.values(entitlementsQ.data)
        : [];
    return list.map((item, idx) => ({
      ...item,
      id: item.id ?? idx,
      subscriber: item.subscriber || '—',
      offering: item.offering?.name || item.offering_name || '—',
      offer_option: item.offer_option?.name || '—',
    }));
  }, [entitlementsQ.data]);

  if (!domain) return <PbxLoading />;
  if (entitlementsQ.isLoading) return <PbxLoading />;
  if (entitlementsQ.error) return <PbxError error={entitlementsQ.error} />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <PermissionGate pbxAction="manageRouting" fallback={null}>
          <EntitlementFormDialog domain={domain} onSuccess={refreshEntitlements} />
        </PermissionGate>
      </div>
      <PbxDataTable
        columns={[
          { key: 'subscriber', label: 'Subscriber' },
          { key: 'offering', label: 'Offering' },
          { key: 'offer_option', label: 'Option' },
          {
            key: 'actions',
            label: '',
            render: (row) => (
              <div className="flex flex-wrap gap-2 justify-end">
                <PermissionGate pbxAction="manageRouting" fallback={null}>
                  <EntitlementFormDialog
                    domain={domain}
                    entitlement={row}
                    onSuccess={refreshEntitlements}
                    trigger={
                      <Button type="button" variant="outline" size="sm">
                        Edit
                      </Button>
                    }
                  />
                  <DeleteEntitlementAction entitlement={row} onSuccess={refreshEntitlements} />
                </PermissionGate>
              </div>
            ),
          },
        ]}
        rows={entitlementRows}
        emptyMessage="No entitlements for this domain."
      />
    </div>
  );
}
