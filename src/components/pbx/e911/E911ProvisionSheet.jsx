import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { pbxApi } from "@/api/pbx";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import PbxFormField from "@/components/pbx/shared/PbxFormField";
import PbxFormSelect, {
  mapCodeLabelOptions,
} from "@/components/pbx/shared/PbxFormSelect";
import {
  EMPTY_E911_FORM,
  buildE911ValidateQuery,
  e911AddressFieldsComplete,
  mapE911ToForm,
} from "@/components/pbx/shared/pbxFormMappers";
import { toast } from "sonner";

export default function E911ProvisionSheet({
  phoneNumber,
  open,
  onOpenChange,
  onSuccess,
  initialData,
  loadExisting = false,
}) {
  const isEdit = !!phoneNumber;
  const [form, setForm] = useState(EMPTY_E911_FORM);
  const [validationSummary, setValidationSummary] = useState(null);

  const {
    data: detail,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["pbx-e911-detail", phoneNumber],
    queryFn: async () => {
      try {
        return await pbxApi.e911Detail(phoneNumber);
      } catch (err) {
        if (err?.status === 404) return null;
        throw err;
      }
    },
    enabled: open && isEdit && loadExisting,
    retry: false,
  });

  const countriesQuery = useQuery({
    queryKey: ["pbx-e911-countries"],
    queryFn: () => pbxApi.e911Countries(),
    enabled: open,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const statesQuery = useQuery({
    queryKey: ["pbx-e911-states"],
    queryFn: () => pbxApi.e911States(),
    enabled: open,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const countryOptions = useMemo(
    () => mapCodeLabelOptions(countriesQuery.data),
    [countriesQuery.data],
  );

  const stateOptions = useMemo(() => {
    const byCountry = statesQuery.data?.[form.country];
    return mapCodeLabelOptions(byCountry);
  }, [statesQuery.data, form.country]);

  useEffect(() => {
    if (!open) {
      setValidationSummary(null);
      return;
    }
    if (loadExisting) {
      const source = detail || initialData;
      setForm(mapE911ToForm(source));
      return;
    }
    setForm(EMPTY_E911_FORM);
  }, [open, loadExisting, detail, initialData]);

  const mutation = useMutation({
    mutationFn: () => pbxApi.provisionE911(phoneNumber, form),
    onSuccess: () => {
      toast.success(loadExisting ? "E911 updated" : "E911 provisioned");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message || "Failed to save E911"),
  });

  const validateMutation = useMutation({
    mutationFn: () => pbxApi.validateE911Address(buildE911ValidateQuery(form)),
    onSuccess: (data) => {
      const routing = data?.level_of_service?.routing_status;
      const msag = data?.level_of_service?.msag_status;
      setValidationSummary({
        ok: true,
        routing,
        msag,
        corrected: data?.address_corrected || null,
      });
      toast.success(
        routing
          ? `Address validated (${routing}${msag ? `, ${msag}` : ""})`
          : "Address validated",
      );
    },
    onError: (err) => {
      setValidationSummary({
        ok: false,
        message: err.message || "Address validation failed",
      });
      toast.error(err.message || "Address validation failed");
    },
  });

  const loadingExisting =
    open &&
    loadExisting &&
    (isLoading || isFetching) &&
    !detail &&
    !initialData;
  const loadingGeo = countriesQuery.isLoading || statesQuery.isLoading;
  const canValidate = e911AddressFieldsComplete(form) && !loadingExisting;

  const handleCountryChange = (country) => {
    setValidationSummary(null);
    setForm((prev) => {
      const nextStates = statesQuery.data?.[country] || {};
      const stateStillValid = prev.state && nextStates[prev.state];
      return { ...prev, country, state: stateStillValid ? prev.state : "" };
    });
  };

  const handleValidate = () => {
    if (!canValidate) {
      toast.error("Enter a full address first.");
      return;
    }
    setValidationSummary(null);
    validateMutation.mutate();
  };

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
            <SheetTitle>
              {loadExisting ? "Update E911" : "Provision E911"}
            </SheetTitle>
            <SheetDescription>
              {loadExisting
                ? "Review the current emergency location and update as needed."
                : "Enter emergency location details for this phone number."}
            </SheetDescription>
          </SheetHeader>

          {loadingExisting ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading current E911 data…
            </div>
          ) : (
            <div className="grid gap-3 py-6">
              <PbxFormField
                label="Phone number"
                value={phoneNumber}
                readOnly
                required
              />
              <PbxFormField
                label="Name"
                value={form.name}
                onChange={(e) => {
                  setValidationSummary(null);
                  setForm({ ...form, name: e.target.value });
                }}
                disabled={loadingExisting}
              />
              <PbxFormField
                label="Street number"
                value={form.street_number}
                onChange={(e) => {
                  setValidationSummary(null);
                  setForm({ ...form, street_number: e.target.value });
                }}
                required
                disabled={loadingExisting}
              />
              <PbxFormField
                label="Street name"
                value={form.street_name}
                onChange={(e) => {
                  setValidationSummary(null);
                  setForm({ ...form, street_name: e.target.value });
                }}
                required
                disabled={loadingExisting}
              />
              <PbxFormField
                label="Suite / location"
                value={form.location}
                onChange={(e) => {
                  setValidationSummary(null);
                  setForm({ ...form, location: e.target.value });
                }}
                disabled={loadingExisting}
              />
              <PbxFormField
                label="City"
                value={form.city}
                onChange={(e) => {
                  setValidationSummary(null);
                  setForm({ ...form, city: e.target.value });
                }}
                required
                disabled={loadingExisting}
              />
              {loadingGeo ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading countries and states…
                </div>
              ) : countriesQuery.error || statesQuery.error ? (
                <p className="text-sm text-amber-700">
                  Country/state lists unavailable — you can still enter codes
                  manually.
                </p>
              ) : null}
              {countryOptions.length > 0 ? (
                <PbxFormSelect
                  label="Country"
                  value={form.country}
                  onValueChange={handleCountryChange}
                  options={countryOptions}
                  placeholder="Select country"
                  required
                  disabled={loadingExisting || loadingGeo}
                />
              ) : (
                <PbxFormField
                  label="Country"
                  value={form.country}
                  onChange={(e) => {
                    setValidationSummary(null);
                    setForm({ ...form, country: e.target.value });
                  }}
                  required
                  disabled={loadingExisting}
                />
              )}
              {stateOptions.length > 0 ? (
                <PbxFormSelect
                  label="State / province"
                  value={form.state}
                  onValueChange={(state) => {
                    setValidationSummary(null);
                    setForm({ ...form, state });
                  }}
                  options={stateOptions}
                  placeholder="Select state"
                  required
                  disabled={loadingExisting || loadingGeo || !form.country}
                />
              ) : (
                <PbxFormField
                  label="State / province"
                  value={form.state}
                  onChange={(e) => {
                    setValidationSummary(null);
                    setForm({ ...form, state: e.target.value });
                  }}
                  required
                  disabled={loadingExisting}
                />
              )}
              <PbxFormField
                label="ZIP / postal code"
                value={form.zip_code}
                onChange={(e) => {
                  setValidationSummary(null);
                  setForm({ ...form, zip_code: e.target.value });
                }}
                required
                disabled={loadingExisting}
              />

              {validationSummary?.ok ? (
                <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
                  Address validated
                  {validationSummary.routing
                    ? ` — ${validationSummary.routing}`
                    : ""}
                  {validationSummary.msag ? ` (${validationSummary.msag})` : ""}
                </div>
              ) : null}
              {validationSummary && !validationSummary.ok ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                  {validationSummary.message}
                </div>
              ) : null}
            </div>
          )}

          <SheetFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={validateMutation.isPending || !canValidate}
              onClick={handleValidate}
            >
              {validateMutation.isPending ? "Validating…" : "Validate address"}
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || loadingExisting}
            >
              {mutation.isPending ? "Saving…" : "Save E911"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
