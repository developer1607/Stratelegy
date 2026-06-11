import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { pbxApi } from '@/api/pbx';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { PbxDataTable } from '@/components/pbx/PbxShell';

function asRows(data) {
  const list = Array.isArray(data) ? data : data ? Object.values(data) : [];
  return list.map((item, idx) => ({
    id: item.id ?? idx,
    name: item.setting?.display_name || item.setting?.name || item.setting_name || '—',
    value: item.setting_value ?? '—',
    plan: item.setting?.plan || '—',
    subscriber: item.subscriber || '—',
  }));
}

export default function UcConfigSheet({ domain, subscriber, open, onOpenChange }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-uc-config', domain, subscriber],
    queryFn: () => pbxApi.ucConfig(domain, subscriber, { include_entitlement: 1 }),
    enabled: open && !!domain && !!subscriber,
  });

  const rows = asRows(data);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>UC config — ext {subscriber}</SheetTitle>
          <SheetDescription>UC settings for ext {subscriber} on {domain}</SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading…
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">
              {error.data?.code === 'skyswitch_uc_config_scope_required'
                ? 'UC config unavailable.'
                : error.message || 'Load failed.'}
            </p>
          ) : (
            <PbxDataTable
              columns={[
                { key: 'name', label: 'Setting' },
                { key: 'value', label: 'Value' },
                { key: 'plan', label: 'Plan' },
              ]}
              rows={rows}
              emptyMessage="No UC config rules for this subscriber."
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
