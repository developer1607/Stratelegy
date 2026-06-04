import React, { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
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
import { toast } from 'sonner';

const DEFAULT_FORM = {
  user: '',
  domain: '',
  device_user: '',
  name: '',
  user_type: 'skyswitch-pbx',
};

export default function ProvisionHubUserDialog({ domain, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_FORM, domain: domain || '' });

  useEffect(() => {
    if (open) setForm({ ...DEFAULT_FORM, domain: domain || '' });
  }, [open, domain]);

  const mutation = useMutation({
    mutationFn: () => pbxApi.provisionHubUser(form),
    onSuccess: () => {
      toast.success('Hub user provisioned');
      setOpen(false);
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message || 'Provision failed'),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Provision user
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>Provision messaging hub user</DialogTitle>
            <DialogDescription>Create a messaging endpoint for this PBX domain.</DialogDescription>
          </DialogHeader>
          <div className="grid sm:grid-cols-2 gap-3 py-4">
            <PbxFormField
              label="Extension / user"
              value={form.user}
              onChange={(e) => setForm({ ...form, user: e.target.value })}
              required
            />
            <PbxFormField
              label="Domain"
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              required
            />
            <PbxFormField
              label="Device user"
              value={form.device_user}
              onChange={(e) => setForm({ ...form, device_user: e.target.value })}
              placeholder="1000m"
              required
            />
            <PbxFormField
              label="Display name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Provisioning…' : 'Provision user'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
