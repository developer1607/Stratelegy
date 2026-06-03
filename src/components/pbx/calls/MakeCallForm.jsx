import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import { Button } from '@/components/ui/button';
import PbxFormField from '@/components/pbx/shared/PbxFormField';
import { toast } from 'sonner';

export default function MakeCallForm() {
  const [form, setForm] = useState({ uid: '', destination: '', origination: '', ani: '' });

  const mutation = useMutation({
    mutationFn: () => pbxApi.makeCall(form),
    onSuccess: (result) => toast.success(`Call initiated${result.call_id ? `: ${result.call_id}` : ''}`),
    onError: (err) => toast.error(err.message || 'Call failed'),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="bg-white rounded-lg shadow p-6 space-y-4 max-w-xl"
    >
      <PbxFormField label="Subscriber UID" value={form.uid} onChange={(e) => setForm({ ...form, uid: e.target.value })} required />
      <PbxFormField label="Destination (SIP URI / extension)" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
      <PbxFormField label="Origination (optional)" value={form.origination} onChange={(e) => setForm({ ...form, origination: e.target.value })} />
      <PbxFormField label="ANI (optional)" value={form.ani} onChange={(e) => setForm({ ...form, ani: e.target.value })} />
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Calling…' : 'Make call'}
      </Button>
    </form>
  );
}
