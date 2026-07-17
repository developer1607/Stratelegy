import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { toast } from "sonner";

export default function E911EmergencyPoolSheet({
  domain,
  row,
  open,
  onOpenChange,
  onSuccess,
}) {
  const [tag, setTag] = useState("");

  useEffect(() => {
    if (!open || !row) return;
    setTag(row.tag || "");
  }, [open, row]);

  const saveMutation = useMutation({
    mutationFn: () =>
      pbxApi.updateEmergencyPoolNumber(domain, row.callid, { tag: tag.trim() }),
    onSuccess: () => {
      toast.success("Emergency pool tag updated");
      onSuccess?.();
      onOpenChange(false);
    },
    onError: (err) =>
      toast.error(err?.message || "Failed to update pool number"),
  });

  if (!row) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit emergency pool number</SheetTitle>
          <SheetDescription>
            Caller ID {row.callid} in the domain emergency pool. The number
            itself cannot be changed — remove and re-add to replace it.
          </SheetDescription>
        </SheetHeader>

        <div className="py-4 space-y-4">
          <PbxFormField
            label="Emergency caller ID"
            value={row.callid || ""}
            readOnly
          />
          <PbxFormField
            label="Tag"
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            placeholder="Location label"
          />
        </div>

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
