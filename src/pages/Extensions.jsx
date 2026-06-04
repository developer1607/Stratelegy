import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import { matchSearch, matchSelect, uniqueFieldValues } from '@/lib/listFilters';

const columns = [
  { key: 'user', label: 'Extension' },
  { key: 'name', label: 'Name' },
  { key: 'subscriber_login', label: 'Login' },
  { key: 'caller_id', label: 'Caller ID' },
  { key: 'email_address', label: 'Email' },
  { key: 'group', label: 'Group' },
];

export default function Extensions() {
  return (
    <PbxShell title="Extensions" description="PBX extensions and subscribers">
      {({ domain }) => <ExtensionsContent domain={domain} />}
    </PbxShell>
  );
}

function ExtensionsContent({ domain }) {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['pbx-extensions', domain],
    queryFn: () => pbxApi.extensions(domain),
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

  if (!domain) return <PbxLoading />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  return (
    <div className="space-y-4">
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
      </PbxListToolbar>
      <PbxDataTable
        columns={columns}
        rows={rows}
        emptyMessage="No extensions match your filters."
      />
    </div>
  );
}
