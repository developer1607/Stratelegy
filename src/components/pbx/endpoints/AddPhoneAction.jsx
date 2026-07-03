import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PbxFormField from '@/components/pbx/shared/PbxFormField';
import PbxFormSelect from '@/components/pbx/shared/PbxFormSelect';
import { toast } from 'sonner';

const TRANSPORT_OPTIONS = [
  { value: 'UDP', label: 'UDP' },
  { value: 'TCP', label: 'TCP' },
  { value: 'TLS', label: 'TLS' },
];

export default function AddPhoneAction({ domain, extension, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [mac, setMac] = useState('');
  const [model, setModel] = useState('generic');
  const [transport, setTransport] = useState('UDP');

  const mutation = useMutation({
    mutationFn: () =>
      pbxApi.createPhone(domain, {
        mac: mac.replace(/[^a-fA-F0-9]/g, ''),
        model,
        transport,
        phone_ext: extension,
      }),
    onSuccess: () => {
      toast.success('Phone provisioned');
      setOpen(false);
      setMac('');
      onSuccess?.();
    },
    onError: (err) => toast.error(err?.message || 'Failed to provision phone'),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Add phone
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Provision phone</DialogTitle>
          <DialogDescription>
            Assign a MAC address to extension {extension}. The device will receive provisioning on next boot.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <PbxFormField
            label="MAC address"
            value={mac}
            onChange={(e) => setMac(e.target.value)}
            placeholder="AABBCCDDEEFF"
            required
          />
          <PbxFormField
            label="Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="generic"
          />
          <PbxFormSelect
            label="Transport"
            value={transport}
            onValueChange={setTransport}
            options={TRANSPORT_OPTIONS}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={mutation.isPending || !mac.replace(/[^a-fA-F0-9]/g, '')}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Saving…' : 'Provision phone'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
