import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
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
import { toast } from "sonner";

export default function AddEmergencyPoolDialog({ domain, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [callid, setCallid] = useState("");
  const [tag, setTag] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      pbxApi.createEmergencyPoolNumber(domain, {
        callid: callid.trim(),
        tag: tag.trim(),
      }),
    onSuccess: () => {
      toast.success("Emergency pool number added");
      setCallid("");
      setTag("");
      setOpen(false);
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(err?.message || "Failed to add emergency number"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1.5" />
          Add pool number
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add emergency pool number</DialogTitle>
          <DialogDescription>
            Adds a domain emergency caller ID via PBX{" "}
            <code className="text-xs">callidemgr</code>. Extensions using{" "}
            <code className="text-xs">[*]</code> can route 911 through this
            pool.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <PbxFormField
            label="Emergency caller ID"
            value={callid}
            onChange={(event) => setCallid(event.target.value)}
            placeholder="3154829441"
          />
          <PbxFormField
            label="Tag (optional)"
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            placeholder="Main office, lobby, etc."
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={!callid.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Add number"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
