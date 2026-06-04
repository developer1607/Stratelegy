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
import { mapRouteToForm } from '@/components/pbx/shared/pbxFormMappers';
import { toast } from 'sonner';

export default function RoutePhoneSheet({
  phoneNumber,
  domain,
  open,
  onOpenChange,
  onSuccess,
  initialData,
}) {
  const [form, setForm] = useState(() => mapRouteToForm(initialData, domain));

  const {
    data: routeData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['pbx-route', phoneNumber],
    queryFn: () => pbxApi.getRoute(phoneNumber),
    enabled: open && !!phoneNumber,
  });

  useEffect(() => {
    if (!open) return;
    const source = routeData || initialData;
    setForm(mapRouteToForm(source, domain));
  }, [open, routeData, initialData, domain]);

  const mutation = useMutation({
    mutationFn: async () => {
      const route = { treatment: form.treatment, enable: form.enable, notes: form.notes };
      if (form.domain) route.domain = form.domain;
      if (form.subscriber) route.subscriber = form.subscriber;
      return pbxApi.setRoute(phoneNumber, { type: form.type, route });
    },
    onSuccess: () => {
      toast.success('Route updated');
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message || 'Failed to update route'),
  });

  const loadingExisting =
    open && !!phoneNumber && (isLoading || isFetching) && !routeData && !initialData;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <SheetHeader>
            <SheetTitle>Edit route</SheetTitle>
            <SheetDescription>
              Current routing for {phoneNumber}. Update fields and save.
            </SheetDescription>
          </SheetHeader>

          {loadingExisting ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading current route…
            </div>
          ) : (
            <div className="grid gap-3 py-6">
              <PbxFormField label="Phone number" value={phoneNumber} readOnly />
              <PbxFormField
                label="Type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              />
              <PbxFormField
                label="Domain"
                value={form.domain}
                onChange={(e) => setForm({ ...form, domain: e.target.value })}
              />
              <PbxFormField
                label="Subscriber"
                value={form.subscriber}
                onChange={(e) => setForm({ ...form, subscriber: e.target.value })}
                placeholder="100@domain.service"
              />
              <PbxFormField
                label="Treatment"
                value={form.treatment}
                onChange={(e) => setForm({ ...form, treatment: e.target.value })}
              />
              <PbxFormField
                label="Enabled"
                value={form.enable}
                onChange={(e) => setForm({ ...form, enable: e.target.value })}
                placeholder="yes / no"
              />
              <PbxFormField
                label="Notes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          )}

          <SheetFooter>
            <Button type="submit" disabled={mutation.isPending || loadingExisting}>
              {mutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
