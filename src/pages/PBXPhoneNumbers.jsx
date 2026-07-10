import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import CnamOutboundSheet from '@/components/pbx/phone-numbers/CnamOutboundSheet';
import { Button } from '@/components/ui/button';
import { matchSearch, matchSelect, uniqueFieldValues } from '@/lib/listFilters';

export default function PBXPhoneNumbers() {
  return (
    <PbxShell
      title="Phone Numbers"
      description="PBX and inventory phone numbers for the selected domain"
    >
      {({ domain }) => <PhoneNumbersContent domain={domain} />}
    </PbxShell>
  );
}

function PhoneNumbersContent({ domain }) {
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState('domain');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cnamPhone, setCnamPhone] = useState(null);

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['pbx-phone-numbers', domain, scope],
    queryFn: () =>
      scope === 'inventory'
        ? pbxApi.phoneNumbers(undefined, 'inventory')
        : pbxApi.phoneNumbers(domain),
    enabled: scope === 'inventory' || !!domain,
  });

  const rows = useMemo(() => {
    const list = (Array.isArray(data) ? data : data?.data || []).map((item) => {
      if (typeof item === 'string') return { phone_number: item };
      if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
      const phone = item.phone_number || item.number || item.did || null;
      if (!phone) return null;
      return {
        phone_number: phone,
        description:
          item.description ||
          item.notes ||
          [item.type, item.origin, item.rate_center, item.state].filter(Boolean).join(' · ') ||
          '—',
        status:
          item.status ||
          item.routing_status ||
          (item.on_network == null ? null : item.on_network ? 'On network' : 'Off network'),
      };
    }).filter(Boolean);

    const statusOptions = uniqueFieldValues(list, 'status');

    const filtered = list.filter((row) => {
      if (!matchSearch(row, search, ['phone_number', 'description', 'status'])) return false;
      return matchSelect(row.status, statusFilter);
    });

    return { rows: filtered, statusOptions };
  }, [data, search, statusFilter]);

  const { rows: filteredRows, statusOptions } = rows;

  const columns = useMemo(
    () => [
      { key: 'phone_number', label: 'Phone number' },
      { key: 'description', label: 'Description' },
      { key: 'status', label: 'Status' },
      {
        key: 'actions',
        label: 'CNAM',
        render: (row) => {
          const phone = String(row.phone_number || '').replace(/\D/g, '');
          if (phone.length !== 11) return '—';
          return (
            <Button type="button" variant="outline" size="sm" onClick={() => setCnamPhone(phone)}>
              View CNAM
            </Button>
          );
        },
      },
    ],
    []
  );

  if (scope !== 'inventory' && !domain) return <PbxLoading />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  return (
    <div className="space-y-4">
      <PbxListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search phone numbers…"
      >
        {statusOptions.length > 0 && (
          <PbxFilterSelect
            value={statusFilter}
            onValueChange={setStatusFilter}
            options={statusOptions}
            allLabel="All statuses"
          />
        )}
        <div className="flex rounded-lg border overflow-hidden text-sm">
          <button
            type="button"
            className={`px-3 py-1.5 ${scope === 'domain' ? 'bg-[#F07020] text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setScope('domain')}
          >
            Domain
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 ${scope === 'inventory' ? 'bg-[#F07020] text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setScope('inventory')}
          >
            Account inventory
          </button>
        </div>
      </PbxListToolbar>

      <PbxDataTable
        columns={columns}
        rows={filteredRows}
        emptyMessage={
          scope === 'inventory'
            ? 'No inventory phone numbers found.'
            : 'No phone numbers for this domain.'
        }
      />

      <CnamOutboundSheet
        phoneNumber={cnamPhone}
        open={!!cnamPhone}
        onOpenChange={(open) => !open && setCnamPhone(null)}
      />
    </div>
  );
}
