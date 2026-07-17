import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Input } from "@/components/ui/input";
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

export const ACCOUNT_NONE = "__none__";
export const ACCOUNT_CUSTOM = "__custom__";

const selectContentProps = {
  position: "popper",
  className: "max-h-[min(16rem,50dvh)]",
};

const defaultLinkedHint = (accountName) =>
  `Linked to ${accountName} in Account Insights.`;

/**
 * Pick an account from Accounts; stores account name in company/account_name and account_id when linked.
 */
export default function AccountSelectField({
  value: valueProp,
  onValueChange,
  company,
  onCompanyChange,
  accountId = "",
  onAccountIdChange,
  disabled = false,
  accountSelectId = "account-select",
  companyInputId = "account-custom-name",
  companyError,
  companyInputClassName = "",
  onCompanyBlur,
  linkedHint = defaultLinkedHint,
  customValueLabel = "Account / company name",
}) {
  const value = valueProp ?? company ?? "";
  const onChange = onValueChange ?? onCompanyChange;

  const { canReadEntity, isLoading: permsLoading } = usePermissions();
  const canLoadAccounts = !permsLoading && canReadEntity("Account");

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts", "select"],
    queryFn: () => api.entities.Account.list("name"),
    staleTime: 60_000,
    enabled: canLoadAccounts,
  });

  const matchedAccount = useMemo(() => {
    if (accountId) {
      return accounts.find((account) => account.id === accountId) || null;
    }
    return accounts.find((account) => account.name === value) || null;
  }, [accounts, accountId, value]);

  const selectValue =
    matchedAccount?.id ?? (value ? ACCOUNT_CUSTOM : ACCOUNT_NONE);
  const showCustomValue = selectValue === ACCOUNT_CUSTOM;

  const handleAccountSelect = (selected) => {
    if (selected === ACCOUNT_NONE) {
      onChange?.("");
      onAccountIdChange?.("");
      return;
    }
    if (selected === ACCOUNT_CUSTOM) {
      onChange?.(value && !matchedAccount ? value : "");
      onAccountIdChange?.("");
      return;
    }
    const account = accounts.find((item) => item.id === selected);
    onChange?.(account?.name || "");
    onAccountIdChange?.(account?.id || "");
  };

  const handleCustomNameChange = (nextValue) => {
    onChange?.(nextValue);
    onAccountIdChange?.("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={accountSelectId}>Account</Label>
        <Select
          value={selectValue}
          onValueChange={handleAccountSelect}
          disabled={disabled || isLoading}
        >
          <SelectTrigger id={accountSelectId}>
            <SelectValue
              placeholder={isLoading ? "Loading accounts..." : "Select account"}
            />
          </SelectTrigger>
          <SelectContent {...selectContentProps}>
            <SelectItem value={ACCOUNT_NONE}>None</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
            <SelectItem value={ACCOUNT_CUSTOM}>
              Other (not in Accounts)
            </SelectItem>
          </SelectContent>
        </Select>
        {matchedAccount && linkedHint && (
          <p className="text-xs text-gray-500">
            {linkedHint(matchedAccount.name)}
          </p>
        )}
      </div>

      {showCustomValue && (
        <div className="space-y-2">
          <Label htmlFor={companyInputId}>{customValueLabel}</Label>
          <Input
            id={companyInputId}
            placeholder={customValueLabel}
            value={value}
            onChange={(e) => handleCustomNameChange(e.target.value)}
            onBlur={onCompanyBlur}
            disabled={disabled}
            className={companyInputClassName}
          />
          <FieldError message={companyError} />
          <p className="text-xs text-gray-500">
            Create an Account with this exact name to link records in Account
            Insights.
          </p>
        </div>
      )}
    </div>
  );
}
