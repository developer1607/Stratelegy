import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import CreateEndpointDialog from '@/components/pbx/endpoints/CreateEndpointDialog';
import { EndpointStatusCell } from '@/components/pbx/endpoints/EndpointCells';
import SubscriberDetailSheet from '@/components/pbx/endpoints/SubscriberDetailSheet';
import DeleteEntitlementAction from '@/components/pbx/extensions/DeleteEntitlementAction';
import EntitlementFormDialog from '@/components/pbx/extensions/EntitlementFormDialog';
import PermissionGate from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { matchSearch, matchSelect, uniqueFieldValues } from '@/lib/listFilters';

export default function Extensions() {
  return (
    <PbxShell title="Extensions" description="PBX extensions and subscribers">
      {({ domain }) => <ExtensionsContent domain={domain} />}
    </PbxShell>
  );
}

function ExtensionsContent({ domain }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [detailSub, setDetailSub] = useState(null);

  const refreshExtensions = () => {
    queryClient.invalidateQueries({ queryKey: ['pbx-extensions', domain] });
    queryClient.invalidateQueries({ queryKey: ['pbx-endpoint-control', domain] });
  };

  const refreshEntitlements = () => {
    queryClient.invalidateQueries({ queryKey: ['pbx-entitlements', domain] });
  };

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['pbx-extensions', domain],
    queryFn: () => pbxApi.extensions(domain),
    enabled: !!domain,
  });

  const entitlementsQ = useQuery({
    queryKey: ['pbx-entitlements', domain],
    queryFn: () => pbxApi.entitlements({ domain }),
    enabled: !!domain,
  });

  const groupOptions = useMemo(() => uniqueFieldValues(data, 'group'), [data]);

  const rows = useMemo(() => {
    return data.filter((row) => {
      if (
        !matchSearch(row, search, [
          'user',
          'name',
          'subscriber_login',
          'email_address',
          'caller_id',
        ])
      ) {
        return false;
      }
      return matchSelect(row.group, groupFilter);
    });
  }, [data, search, groupFilter]);

  const extensionColumns = useMemo(
    () => [
      {
        key: 'actions',
        label: '',
        render: (row) => (
          <Button type="button" variant="outline" size="sm" onClick={() => setDetailSub(row)}>
            Detail
          </Button>
        ),
      },
      { key: 'user', label: 'Extension' },
      { key: 'name', label: 'Name' },
      {
        key: 'online_status',
        label: 'Status',
        render: (row) => <EndpointStatusCell row={row} />,
      },
      { key: 'subscriber_login', label: 'Login' },
      { key: 'caller_id', label: 'Caller ID' },
      { key: 'email_address', label: 'Email' },
      { key: 'group', label: 'Group' },
      { key: 'scope', label: 'Scope' },
    ],
    []
  );

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
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="extensions">
        <TabsList>
          <TabsTrigger value="extensions">Extensions</TabsTrigger>
          <TabsTrigger value="entitlements">Entitlements</TabsTrigger>
        </TabsList>

        <TabsContent value="extensions" className="space-y-4 mt-4">
          <PbxListToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search extension, name, email…"
          >
            <PbxFilterSelect
              label="Group"
              value={groupFilter}
              onValueChange={setGroupFilter}
              options={groupOptions}
              allLabel="All groups"
            />
            <PermissionGate pbxAction="manageEndpoints" fallback={null}>
              <CreateEndpointDialog
                domain={domain}
                variant="extension"
                trigger="toolbar"
                onSuccess={refreshExtensions}
              />
            </PermissionGate>
          </PbxListToolbar>
          <PbxDataTable
            columns={extensionColumns}
            rows={rows}
            emptyMessage="No extensions match your filters."
          />
        </TabsContent>

        <TabsContent value="entitlements" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <PermissionGate pbxAction="manageRouting" fallback={null}>
              <EntitlementFormDialog domain={domain} onSuccess={refreshEntitlements} />
            </PermissionGate>
          </div>
          {entitlementsQ.isLoading ? (
            <PbxLoading />
          ) : entitlementsQ.error ? (
            <PbxError error={entitlementsQ.error} />
          ) : (
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
          )}
        </TabsContent>
      </Tabs>

      <SubscriberDetailSheet
        domain={domain}
        subscriber={detailSub}
        open={!!detailSub}
        onOpenChange={(open) => !open && setDetailSub(null)}
        onUpdated={refreshExtensions}
      />
    </div>
  );
}
