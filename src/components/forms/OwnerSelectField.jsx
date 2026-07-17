import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FieldError from "@/components/forms/FieldError";
import { usePermissions } from "@/hooks/usePermissions";
import { normalizeOwnerLabel, userOwnerLabel } from "@/lib/accountOwner";
import { uniqueOwners } from "@/lib/listFilters";

export const OWNER_UNASSIGNED = "__unassigned__";

const selectContentProps = {
  position: "popper",
  className: "max-h-[min(16rem,50dvh)]",
};

/**
 * Account owner picker — portal users plus any legacy owner names already on accounts.
 */
export default function OwnerSelectField({
  id = "account-owner",
  label = "Account owner",
  value = "",
  onValueChange,
  disabled = false,
  error,
  inputClassName = "",
  allowUnassigned = true,
  extraOptions = [],
}) {
  const {
    canReadEntity,
    hasCrmAccess,
    isLoading: permsLoading,
  } = usePermissions();
  const canLoadOwners = !permsLoading && hasCrmAccess;

  const { data: directory = [], isLoading: directoryLoading } = useQuery({
    queryKey: ["users", "directory"],
    queryFn: () => api.users.directory(),
    staleTime: 5 * 60_000,
    enabled: canLoadOwners,
  });

  const { data: accounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ["accounts", "owner-options"],
    queryFn: () => api.entities.Account.list("name"),
    staleTime: 60_000,
    enabled: canLoadOwners && canReadEntity("Account"),
  });

  const options = useMemo(() => {
    const set = new Set();
    for (const user of directory) {
      const label = userOwnerLabel(user);
      if (label) set.add(label);
    }
    for (const owner of uniqueOwners(accounts, ["owner"])) {
      set.add(owner);
    }
    for (const owner of extraOptions) {
      const label = normalizeOwnerLabel(owner);
      if (label) set.add(label);
    }
    const current = normalizeOwnerLabel(value);
    if (current) set.add(current);
    return [...set].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" }),
    );
  }, [accounts, directory, extraOptions, value]);

  const selectValue =
    normalizeOwnerLabel(value) ||
    (allowUnassigned ? OWNER_UNASSIGNED : undefined);
  const isLoading = directoryLoading || accountsLoading;

  const handleChange = (selected) => {
    if (selected === OWNER_UNASSIGNED) {
      onValueChange?.("");
      return;
    }
    onValueChange?.(selected);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={selectValue}
        onValueChange={handleChange}
        disabled={disabled || isLoading}
      >
        <SelectTrigger id={id} className={inputClassName}>
          <SelectValue
            placeholder={isLoading ? "Loading owners..." : "Select owner"}
          />
        </SelectTrigger>
        <SelectContent {...selectContentProps}>
          {allowUnassigned && (
            <SelectItem value={OWNER_UNASSIGNED}>Unassigned</SelectItem>
          )}
          {options.map((owner) => (
            <SelectItem key={owner} value={owner}>
              {owner}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError message={error} />
    </div>
  );
}
