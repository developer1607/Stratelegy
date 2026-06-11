import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { pbxApi } from '@/api/pbx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function FaxAtaActions({ macAddress }) {
  const [checked, setChecked] = useState(false);

  const statusQuery = useQuery({
    queryKey: ['pbx-fax-ata-status', macAddress],
    queryFn: () => pbxApi.faxAtaStatus(macAddress),
    enabled: checked && !!macAddress,
  });

  const rebootMutation = useMutation({
    mutationFn: () => pbxApi.rebootFaxAta(macAddress),
    onSuccess: () => {
      toast.success('Reboot sent');
      if (checked) statusQuery.refetch();
    },
    onError: (err) => toast.error(err.message || 'Reboot failed'),
  });

  const isOnline = statusQuery.data?.is_online;
  const onlineLabel =
    isOnline === true || isOnline === 'true' || isOnline === 1 || isOnline === '1'
      ? 'Online'
      : isOnline === false || isOnline === 'false' || isOnline === 0 || isOnline === '0'
        ? 'Offline'
        : null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {!checked ? (
        <Button type="button" variant="outline" size="sm" onClick={() => setChecked(true)}>
          Check status
        </Button>
      ) : statusQuery.isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      ) : statusQuery.error ? (
        <span className="text-xs text-red-600">No status</span>
      ) : onlineLabel ? (
        <Badge variant={onlineLabel === 'Online' ? 'default' : 'destructive'}>{onlineLabel}</Badge>
      ) : (
        <span className="text-xs text-gray-500">Unknown</span>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={rebootMutation.isPending}
        onClick={() => rebootMutation.mutate()}
      >
        {rebootMutation.isPending ? 'Rebooting…' : 'Reboot'}
      </Button>
    </div>
  );
}
