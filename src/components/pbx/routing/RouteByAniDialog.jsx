import React, { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import PbxDeleteDialog from '@/components/pbx/shared/PbxDeleteDialog';
import { mapRouteByAniToForm } from '@/components/pbx/shared/pbxFormMappers';
import { toast } from 'sonner';

export default function RouteByAniDialog({
  domain,
  trigger,
  initialData,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
}) {
  const queryClient = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const isEdit = Boolean(initialData?.ani);

  const [form, setForm] = useState(() => mapRouteByAniToForm(initialData, domain));

  useEffect(() => {
    if (!open) return;
    setForm(mapRouteByAniToForm(initialData, domain));
  }, [open, initialData, domain]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['pbx-route-by-ani'] });
    onSuccess?.();
  };

  const provisionMutation = useMutation({
    mutationFn: () => pbxApi.provisionRouteByAni(form),
    onSuccess: () => {
      toast.success(isEdit ? 'Route-by-ANI updated' : 'Route-by-ANI provisioned');
      setOpen(false);
      invalidate();
    },
    onError: (err) => toast.error(err.message || 'Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => pbxApi.deleteRouteByAni({ domain: form.domain, ani: form.ani, dnis: form.dnis }),
    onSuccess: () => {
      toast.success('Route-by-ANI removed');
      setOpen(false);
      invalidate();
    },
    onError: (err) => toast.error(err.message || 'Failed to delete'),
  });

  const formBody = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        provisionMutation.mutate();
      }}
    >
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit route by ANI' : 'Add route by ANI'}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? 'Current ANI routing rule. Update destination or application as needed.'
            : 'Provision a new ANI-based routing rule.'}
        </DialogDescription>
      </DialogHeader>
      <div className="grid sm:grid-cols-2 gap-3 py-4">
        <PbxFormField label="Domain" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} required />
        <PbxFormField label="ANI" value={form.ani} onChange={(e) => setForm({ ...form, ani: e.target.value })} required readOnly={isEdit} />
        <PbxFormField label="DNIS (optional)" value={form.dnis} onChange={(e) => setForm({ ...form, dnis: e.target.value })} readOnly={isEdit} />
        <PbxFormField label="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
        <PbxFormField label="Application" value={form.application} onChange={(e) => setForm({ ...form, application: e.target.value })} />
      </div>
      <DialogFooter className="gap-2 sm:justify-between">
        {isEdit ? (
          <PbxDeleteDialog
            triggerLabel="Delete rule"
            title="Delete route-by-ANI?"
            description={`Remove the rule for ANI ${form.ani || '—'} on ${form.domain || 'this domain'}.`}
            confirmLabel="Delete"
            loading={deleteMutation.isPending}
            onConfirm={() => deleteMutation.mutateAsync()}
          />
        ) : (
          <span />
        )}
        <Button type="submit" disabled={provisionMutation.isPending}>
          {provisionMutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Save rule'}
        </Button>
      </DialogFooter>
    </form>
  );

  if (controlledOpen != null) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">{formBody}</DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add rule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">{formBody}</DialogContent>
    </Dialog>
  );
}
