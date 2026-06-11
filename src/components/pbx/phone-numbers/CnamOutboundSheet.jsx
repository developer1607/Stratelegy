import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { pbxApi } from '@/api/pbx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import PbxDeleteDialog from '@/components/pbx/shared/PbxDeleteDialog';
import { toast } from 'sonner';

export default function CnamOutboundSheet({ phoneNumber, open, onOpenChange }) {
  const [callingName, setCallingName] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pbx-cnam-outbound', phoneNumber],
    queryFn: () => pbxApi.getOutboundCnam(phoneNumber),
    enabled: open && !!phoneNumber,
  });

  useEffect(() => {
    if (!open) return;
    setCallingName(data?.neustar || data?.cidname || '');
  }, [open, data]);

  const saveMutation = useMutation({
    mutationFn: () => pbxApi.setOutboundCnam(phoneNumber, { calling_name: callingName.trim() }),
    onSuccess: () => {
      toast.success('CNAM saved');
      refetch();
    },
    onError: (err) => toast.error(err.message || 'CNAM save failed'),
  });

  const removeMutation = useMutation({
    mutationFn: () => pbxApi.removeOutboundCnam(phoneNumber),
    onSuccess: () => {
      toast.success('CNAM removed');
      setCallingName('');
      refetch();
    },
    onError: (err) => toast.error(err.message || 'CNAM remove failed'),
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Outbound CNAM</SheetTitle>
          <SheetDescription>Caller ID name delivery for {phoneNumber}</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading…
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {data && (
              <dl className="text-sm space-y-2 rounded-lg bg-gray-50 p-3">
                {data.open_cnam_standard != null && (
                  <div>
                    <dt className="text-gray-500">Open CNAM</dt>
                    <dd className="font-mono">{data.open_cnam_standard}</dd>
                  </div>
                )}
                {data.cidname != null && (
                  <div>
                    <dt className="text-gray-500">CID name</dt>
                    <dd className="font-mono">{data.cidname}</dd>
                  </div>
                )}
                {data.neustar != null && (
                  <div>
                    <dt className="text-gray-500">Neustar</dt>
                    <dd className="font-mono">{data.neustar}</dd>
                  </div>
                )}
              </dl>
            )}

            <div className="space-y-2">
              <Label htmlFor="cnam-calling-name">Calling name (Neustar)</Label>
              <Input
                id="cnam-calling-name"
                value={callingName}
                onChange={(e) => setCallingName(e.target.value)}
                placeholder="Display name for outbound calls"
              />
            </div>
          </div>
        )}

        <SheetFooter className="flex-col sm:flex-row gap-2">
          <PbxDeleteDialog
            triggerLabel="Remove CNAM"
            title="Remove outbound CNAM?"
            description={`Remove Neustar CNAM for ${phoneNumber}.`}
            confirmLabel="Remove"
            loading={removeMutation.isPending}
            onConfirm={() => removeMutation.mutateAsync()}
          />
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !callingName.trim()}
          >
            {saveMutation.isPending ? 'Saving…' : 'Save CNAM'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
