import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import PermissionGate from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { matchSearch } from '@/lib/listFilters';

function RadioGroup({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      <div className="flex flex-wrap gap-3 text-sm">
        {options.map((opt) => (
          <label key={opt.value} className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name={label}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
              className="accent-blue-600"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

const DEFAULT_FILTERS = {
  dial_policy: 'all',
  highlighted: 'both',
  show_voicemail_pin: 'no',
  voicemail_enabled: 'both',
};

export default function Troubleshooting() {
  return (
    <PbxShell
      title="Troubleshooting"
      description="Security and configuration checks for the selected domain"
    >
      {({ domain }) => <TroubleshootingContent domain={domain} />}
    </PbxShell>
  );
}

function TroubleshootingContent({ domain }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);
  const [callLimitDraft, setCallLimitDraft] = useState('');

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['pbx-vulnerability', domain, appliedFilters],
    queryFn: () => pbxApi.vulnerabilityCheck(domain, appliedFilters),
    enabled: !!domain,
  });

  const updateCallLimit = useMutation({
    mutationFn: (call_limit) => pbxApi.updateVulnerabilityCallLimit(domain, { call_limit }),
    onSuccess: (result) => {
      setCallLimitDraft(String(result.call_limit ?? ''));
      queryClient.invalidateQueries({ queryKey: ['pbx-vulnerability', domain] });
    },
  });

  const rows = useMemo(() => {
    const list = data?.rows || [];
    if (!search.trim()) return list;
    return list.filter((row) =>
      matchSearch(row, search, ['user', 'name', 'dial_policy', 'vm_pin', 'vmail_label'])
    );
  }, [data?.rows, search]);

  if (!domain) return <PbxLoading />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  const domainLabel = data?.domain_description || domain;
  const callLimitValue =
    callLimitDraft !== ''
      ? callLimitDraft
      : data?.call_limit == null
        ? ''
        : String(data.call_limit);

  return (
    <Tabs defaultValue="vulnerability">
      <TabsList>
        <TabsTrigger value="vulnerability">Vulnerability Check</TabsTrigger>
      </TabsList>

      <TabsContent value="vulnerability" className="mt-4 space-y-4">
        <div className="rounded-lg border bg-white p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <PbxFilterSelect
              label="Dial permission"
              value={draftFilters.dial_policy}
              onValueChange={(value) => setDraftFilters((prev) => ({ ...prev, dial_policy: value }))}
              options={data?.dial_policies || []}
              allLabel="All dial permissions"
              className="w-full"
            />
            <RadioGroup
              label="Highlighted*"
              value={draftFilters.highlighted}
              onChange={(value) => setDraftFilters((prev) => ({ ...prev, highlighted: value }))}
              options={[
                { value: 'both', label: 'Both' },
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ]}
            />
            <RadioGroup
              label="Show Voicemail Pin"
              value={draftFilters.show_voicemail_pin}
              onChange={(value) =>
                setDraftFilters((prev) => ({ ...prev, show_voicemail_pin: value }))
              }
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ]}
            />
            <RadioGroup
              label="Voicemail Enabled"
              value={draftFilters.voicemail_enabled}
              onChange={(value) =>
                setDraftFilters((prev) => ({ ...prev, voicemail_enabled: value }))
              }
              options={[
                { value: 'both', label: 'Both' },
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ]}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDraftFilters(DEFAULT_FILTERS);
                setAppliedFilters(DEFAULT_FILTERS);
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={() => setAppliedFilters({ ...draftFilters })}>
              Apply
            </Button>
          </div>

          <p className="text-sm text-red-600">*{data?.criteria_note}</p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 rounded-lg border bg-white p-4">
          <div className="min-w-0 flex-1">
            <PbxListToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search by keyword"
            />
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">External call limit</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 truncate max-w-[180px]" title={domainLabel}>
                  {domainLabel}
                </span>
                <Input
                  className="h-9 w-20"
                  value={callLimitValue}
                  onChange={(e) => setCallLimitDraft(e.target.value)}
                  inputMode="numeric"
                />
                <PermissionGate permission="can_manage_pbx_endpoints">
                  <Button
                    type="button"
                    size="sm"
                    disabled={updateCallLimit.isPending || callLimitValue === ''}
                    onClick={() => updateCallLimit.mutate(callLimitValue)}
                  >
                    Update call limit
                  </Button>
                </PermissionGate>
              </div>
              <p className="text-xs text-gray-500">
                Current: {data?.call_limit_label || '—'}
                {data?.call_limit_label === 'Unlimited' ? ' (0 = unlimited)' : ''}
              </p>
            </div>
            <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <th className="px-3 py-2.5 font-semibold">Ext</th>
                <th className="px-3 py-2.5 font-semibold">Name</th>
                <th className="px-3 py-2.5 font-semibold">Dial Permission</th>
                <th className="px-3 py-2.5 font-semibold">Voicemail PIN</th>
                <th className="px-3 py-2.5 font-semibold">VM</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr
                    key={row.user}
                    className={`border-t ${row.vulnerable ? 'bg-red-50/60' : ''}`}
                  >
                    <td className="px-3 py-2.5 font-mono">{row.user}</td>
                    <td className="px-3 py-2.5">{row.name || '—'}</td>
                    <td className="px-3 py-2.5">{row.dial_policy || '—'}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={
                          row.pin_highlight
                            ? 'inline-block rounded bg-orange-500 px-2 py-0.5 font-mono text-white'
                            : 'font-mono'
                        }
                      >
                        {row.vm_pin || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">{row.vmail_label}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-gray-500">
                    No extensions match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
