import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { pbxApi } from "@/api/pbx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PbxFormField from "@/components/pbx/shared/PbxFormField";
import PbxFormSelect from "@/components/pbx/shared/PbxFormSelect";
import { toast } from "sonner";

export default function EntitlementFormDialog({
  domain,
  entitlement,
  onSuccess,
  trigger,
}) {
  const isEdit = Boolean(entitlement?.id);
  const [open, setOpen] = useState(false);
  const [subscriber, setSubscriber] = useState("");
  const [offeringId, setOfferingId] = useState("");
  const [offerOptionId, setOfferOptionId] = useState("");

  const offeringsQ = useQuery({
    queryKey: ["pbx-entitlement-offerings"],
    queryFn: () => pbxApi.entitlementOfferings(),
    enabled: open,
  });

  const offeringOptions = useMemo(() => {
    const list = Array.isArray(offeringsQ.data) ? offeringsQ.data : [];
    return list
      .filter((item) => item.hidden !== "1")
      .map((item) => ({ value: String(item.id), label: item.name }));
  }, [offeringsQ.data]);

  const selectedOffering = useMemo(
    () => offeringOptions.find((item) => item.value === offeringId) || null,
    [offeringOptions, offeringId],
  );

  const optionsQ = useQuery({
    queryKey: ["pbx-entitlement-offer-options", selectedOffering?.label],
    queryFn: () =>
      pbxApi.entitlementOfferOptions({ offering_name: selectedOffering.label }),
    enabled: open && !!selectedOffering?.label,
  });

  const offerOptionOptions = useMemo(() => {
    const list = Array.isArray(optionsQ.data) ? optionsQ.data : [];
    return list
      .filter((item) => item.hidden !== "1")
      .map((item) => ({ value: String(item.id), label: item.name }));
  }, [optionsQ.data]);

  useEffect(() => {
    if (!open) return;
    setSubscriber(entitlement?.subscriber || "");
    setOfferingId(
      entitlement?.offering?.id != null
        ? String(entitlement.offering.id)
        : entitlement?.offering_id != null
          ? String(entitlement.offering_id)
          : "",
    );
    setOfferOptionId(
      entitlement?.offer_option?.id != null
        ? String(entitlement.offer_option.id)
        : entitlement?.offer_option_id != null
          ? String(entitlement.offer_option_id)
          : "",
    );
  }, [open, entitlement]);

  const mutation = useMutation({
    mutationFn: () =>
      pbxApi.storeEntitlement({
        domain,
        subscriber: subscriber.trim(),
        offering_id: Number(offeringId),
        offer_option_id: Number(offerOptionId),
      }),
    onSuccess: () => {
      toast.success(isEdit ? "Entitlement updated" : "Entitlement added");
      setOpen(false);
      onSuccess?.();
    },
    onError: (err) => toast.error(err?.message || "Failed to save entitlement"),
  });

  const canSubmit = domain && subscriber.trim() && offeringId && offerOptionId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add entitlement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) mutation.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {isEdit ? "Edit entitlement" : "Add entitlement"}
            </DialogTitle>
            <DialogDescription>
              Assign a UC offering to an extension on{" "}
              {domain || "the selected domain"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <PbxFormField
              label="Extension / subscriber"
              value={subscriber}
              onChange={(e) => setSubscriber(e.target.value)}
              required
              disabled={isEdit}
            />
            <PbxFormSelect
              label="Offering"
              value={offeringId}
              onValueChange={(value) => {
                setOfferingId(value);
                setOfferOptionId("");
              }}
              options={offeringOptions}
              placeholder={
                offeringsQ.isLoading ? "Loading…" : "Select offering"
              }
              disabled={offeringsQ.isLoading}
            />
            <PbxFormSelect
              label="Offer option"
              value={offerOptionId}
              onValueChange={setOfferOptionId}
              options={offerOptionOptions}
              placeholder={
                !offeringId
                  ? "Select offering first"
                  : optionsQ.isLoading
                    ? "Loading…"
                    : "Select option"
              }
              disabled={!offeringId || optionsQ.isLoading}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!canSubmit || mutation.isPending}>
              {mutation.isPending
                ? "Saving…"
                : isEdit
                  ? "Save changes"
                  : "Add entitlement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
