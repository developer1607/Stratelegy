import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { pbxApi } from '@/api/pbx';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import PbxFormField from '@/components/pbx/shared/PbxFormField';
import { toast } from 'sonner';

export default function E911SubscriberCallerIdSheet({
  domain,
  subscriber,
  open,
  onOpenChange,
  onSuccess,
}) {
  const [e911CallerId, setE911CallerId] = useState('');

  const profileQ = useQuery({
    queryKey: ['pbx-e911-subscriber-profile', domain, subscriber?.user],
    queryFn: () => pbxApi.subscriberE911Profile(domain, subscriber.user),
    enabled: open && Boolean(domain && subscriber?.user),
  });

  useEffect(() => {
    if (!open || !subscriber) return;
    const value = subscriber.e911_caller_id || subscriber.caller_id || '';
    setE911CallerId(value === '[*]' ? '' : String(value));
  }, [open, subscriber]);

  const saveMutation = useMutation({
    mutationFn: () =>
      pbxApi.updateSubscriberE911CallerId(
        domain,
        subscriber.user,
        e911CallerId.trim() || '[*]'
      ),
    onSuccess: () => {
      toast.success('911 caller ID updated');
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to update 911 caller ID');
    },
  });

  if (!subscriber) return null;

  const profile = profileQ.data;
  const v2Value = profile?.v2_e911_caller_id;
  const showV2Mismatch =
    v2Value &&
    v2Value !== (subscriber.e911_caller_id || '[*]') &&
    v2Value !== (e911CallerId.trim() || '[*]');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Set 911 caller ID</SheetTitle>
          <SheetDescription>
            Extension {subscriber.user} ({subscriber.name || '—'}). Updates PBX{' '}
            <code className="text-xs">callid_emgr</code>. Civic address provisioning uses the
            phone-number workflow when Telco E911 is enabled.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-4">
          <PbxFormField
            label="911 caller ID (callid_emgr)"
            value={e911CallerId}
            onChange={(event) => setE911CallerId(event.target.value)}
            placeholder="13154829441 or leave blank for domain pool [*]"
          />
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 space-y-1">
            <p>
              Caller ID: <span className="font-medium text-gray-900">{subscriber.caller_id || '—'}</span>
            </p>
            <p>
              Current PBX 911 CID:{' '}
              <span className="font-medium text-gray-900">{subscriber.e911_caller_id || '—'}</span>
            </p>
            {profileQ.isLoading ? <p>Loading v2 profile…</p> : null}
            {v2Value ? (
              <p>
                v2 caller-id-number-emergency:{' '}
                <span className="font-medium text-gray-900">{v2Value}</span>
              </p>
            ) : null}
            {profile?.emergency_address_id ? (
              <p>
                Emergency address ID:{' '}
                <span className="font-medium text-gray-900">{profile.emergency_address_id}</span>
              </p>
            ) : null}
            {profile?.addresses?.supported === false ? (
              <p className="text-amber-700">PBX civic addresses API is not available on this portal.</p>
            ) : null}
            {showV2Mismatch ? (
              <p className="text-amber-700">
                v2 profile differs from v1. Saving updates v1 <code>callid_emgr</code>, which is used
                for routing on this portal.
              </p>
            ) : null}
          </div>
        </div>

        <SheetFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
