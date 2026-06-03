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
import { EMPTY_E911_FORM, mapE911ToForm } from '@/components/pbx/shared/pbxFormMappers';
import { toast } from 'sonner';

export default function E911ProvisionSheet({
  phoneNumber,
  open,
  onOpenChange,
  onSuccess,
  initialData,
}) {
  const isEdit = !!phoneNumber;
  const [form, setForm] = useState(EMPTY_E911_FORM);

  const { data: detail, isLoading, isFetching } = useQuery({
    queryKey: ['pbx-e911-detail', phoneNumber],
    queryFn: () => pbxApi.e911Detail(phoneNumber),
    enabled: open && isEdit,
  });

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      const source = detail || initialData;
      setForm(mapE911ToForm(source));
      return;
    }
    setForm(EMPTY_E911_FORM);
  }, [open, isEdit, detail, initialData]);

  const mutation = useMutation({
    mutationFn: () => pbxApi.provisionE911(phoneNumber, form),
    onSuccess: () => {
      toast.success(isEdit ? 'E911 updated' : 'E911 provisioned');
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message || 'Failed to save E911'),
  });

  const validateMutation = useMutation({
    mutationFn: () =>
      pbxApi.validateE911Address({
        street_number: form.street_number,
        street_name: form.street_name,
        city: form.city,
        state: form.state,
        zip_code: form.zip_code,
        country: form.country,
      }),
    onSuccess: () => toast.success('Address validated'),
    onError: (err) => toast.error(err.message || 'Address validation failed'),
  });

  const loadingExisting = open && isEdit && (isLoading || isFetching) && !detail && !initialData;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <SheetHeader>
            <SheetTitle>{isEdit ? 'Update E911' : 'Provision E911'}</SheetTitle>
            <SheetDescription>
              {isEdit
                ? 'Review the current emergency location and update as needed.'
                : 'Enter emergency location details for this phone number.'}
            </SheetDescription>
          </SheetHeader>

          {loadingExisting ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading current E911 data…
            </div>
          ) : (
            <div className="grid gap-3 py-6">
              <PbxFormField label="Phone number" value={phoneNumber} readOnly required />
              <PbxFormField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <PbxFormField label="Street number" value={form.street_number} onChange={(e) => setForm({ ...form, street_number: e.target.value })} required />
              <PbxFormField label="Street name" value={form.street_name} onChange={(e) => setForm({ ...form, street_name: e.target.value })} required />
              <PbxFormField label="Suite / location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              <PbxFormField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              <PbxFormField label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
              <PbxFormField label="ZIP" value={form.zip_code} onChange={(e) => setForm({ ...form, zip_code: e.target.value })} required />
              <PbxFormField label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required />
            </div>
          )}

          <SheetFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={validateMutation.isPending || loadingExisting}
              onClick={() => validateMutation.mutate()}
            >
              {validateMutation.isPending ? 'Validating…' : 'Validate address'}
            </Button>
            <Button type="submit" disabled={mutation.isPending || loadingExisting}>
              {mutation.isPending ? 'Saving…' : 'Save E911'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
