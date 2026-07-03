import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
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

function toFormValue(value) {
  const text = String(value ?? '').trim();
  return text === '[*]' ? '' : text;
}

export default function E911DomainDefaultsSheet({ domain, defaults, open, onOpenChange, onSuccess }) {
  const [callerId, setCallerId] = useState('');
  const [callerIdName, setCallerIdName] = useState('');
  const [e911CallerId, setE911CallerId] = useState('');

  useEffect(() => {
    if (!open || !defaults) return;
    setCallerId(toFormValue(defaults.caller_id));
    setCallerIdName(toFormValue(defaults.caller_id_name));
    setE911CallerId(toFormValue(defaults.e911_caller_id));
  }, [open, defaults]);

  const saveMutation = useMutation({
    mutationFn: () =>
      pbxApi.updateE911DomainDefaults(domain, {
        caller_id: callerId.trim() || '[*]',
        caller_id_name: callerIdName.trim() || '[*]',
        e911_caller_id: e911CallerId.trim() || '[*]',
      }),
    onSuccess: (data) => {
      const unchanged =
        data?.e911_caller_id === defaults?.e911_caller_id &&
        data?.caller_id === defaults?.caller_id &&
        data?.caller_id_name === defaults?.caller_id_name;
      if (unchanged) {
        toast.message('Saved request sent', {
          description:
            'This portal may not apply domain default changes via API. Use the emergency pool tab for 911 numbers.',
        });
      } else {
        toast.success('Domain caller ID defaults updated');
      }
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to update domain defaults');
    },
  });

  if (!defaults) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Domain caller ID defaults</SheetTitle>
          <SheetDescription>
            Updates PBX domain fields for {domain}. Leave blank to use domain pool{' '}
            <code className="text-xs">[*]</code>.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-4">
          <PbxFormField
            label="Domain caller ID (callid_nmbr)"
            value={callerId}
            onChange={(event) => setCallerId(event.target.value)}
            placeholder="10-digit number or blank for [*]"
          />
          <PbxFormField
            label="Caller ID name (callid_name)"
            value={callerIdName}
            onChange={(event) => setCallerIdName(event.target.value)}
            placeholder="Display name or blank for [*]"
          />
          <PbxFormField
            label="Domain 911 caller ID (callid_emgr)"
            value={e911CallerId}
            onChange={(event) => setE911CallerId(event.target.value)}
            placeholder="10-digit number or blank for [*]"
          />
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
