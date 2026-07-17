import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildAccountPayload,
  validateAccountForm,
} from "@/lib/crmFormValidation";
import { useCrmFormValidation } from "@/lib/useCrmFormValidation";
import FieldError from "@/components/forms/FieldError";
import OwnerSelectField from "@/components/forms/OwnerSelectField";
import ConfigNameSelect from "@/components/forms/ConfigNameSelect";
import { useCrmConfig } from "@/hooks/useCrmConfig";
import { accountTierOptions, industryOptions } from "@/lib/crmConfig";
import { normalizeOwnerLabel } from "@/lib/accountOwner";
import {
  formDialogContent,
  formDialogHeader,
  formDialogBody,
  formDialogGrid,
  formDialogField,
  formDialogForm,
  formDialogFooter,
} from "@/lib/formDialog";

export default function EditAccountDialog({
  open,
  onOpenChange,
  account,
  onSubmit,
  isLoading,
  readOnly = false,
  tiers = [],
  defaultTier = "Standard",
}) {
  const { accountTiers, industries } = useCrmConfig({ enabled: open });
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    website: "",
    phone: "",
    email: "",
    annual_revenue: "",
    employees: "",
    status: "active",
    tier: "",
    owner: "",
  });
  const tierOptions = accountTierOptions(accountTiers, formData.tier);
  const industryOpts = industryOptions(industries, formData.industry);
  const validate = useCallback(
    (data) =>
      validateAccountForm(data, {
        allowedTiers: tierOptions.length ? tierOptions : tiers,
        allowedIndustries: industryOpts,
      }),
    [tierOptions, industryOpts, tiers],
  );
  const validation = useCrmFormValidation(validate);
  const { resetValidation, validateSubmit } = validation;

  useEffect(() => {
    if (open) resetValidation();
  }, [open, resetValidation]);

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || "",
        industry: account.industry || "",
        website: account.website || "",
        phone: account.phone || "",
        email: account.email || "",
        annual_revenue: account.annual_revenue || "",
        employees: account.employees || "",
        status: account.status || "active",
        tier: account.tier || defaultTier || tiers[0] || "Standard",
        owner: normalizeOwnerLabel(account.owner),
      });
      resetValidation();
    }
  }, [account, resetValidation, defaultTier, tiers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    if (!validateSubmit(formData)) return;

    onSubmit(buildAccountPayload(formData));
  };

  const bind = (field) =>
    readOnly
      ? {}
      : {
          onChange: (e) =>
            validation.updateField(
              field,
              e.target.value,
              formData,
              setFormData,
            ),
          onBlur: () => validation.touchField(field, formData),
          className: validation.inputClassName(field),
          "aria-invalid": Boolean(validation.fieldError(field)),
        };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={formDialogContent("md")}>
        <DialogHeader className={formDialogHeader}>
          <DialogTitle>
            {readOnly ? "Account Details" : "Edit Account"}
          </DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={handleSubmit} className={formDialogForm}>
          <div className={formDialogBody}>
            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="edit-account-name">Account Name *</Label>
                <Input
                  id="edit-account-name"
                  value={formData.name}
                  disabled={readOnly}
                  {...bind("name")}
                />
                {!readOnly && (
                  <FieldError message={validation.fieldError("name")} />
                )}
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-account-industry">Industry</Label>
                <ConfigNameSelect
                  id="edit-account-industry"
                  value={formData.industry}
                  onValueChange={(value) =>
                    validation.updateField(
                      "industry",
                      value,
                      formData,
                      setFormData,
                    )
                  }
                  options={industryOpts}
                  placeholder="Select industry"
                  disabled={readOnly}
                  className={validation.inputClassName("industry")}
                />
                {!readOnly && (
                  <FieldError message={validation.fieldError("industry")} />
                )}
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-account-phone">Phone</Label>
                <Input
                  id="edit-account-phone"
                  type="tel"
                  value={formData.phone}
                  disabled={readOnly}
                  {...bind("phone")}
                />
                {!readOnly && (
                  <FieldError message={validation.fieldError("phone")} />
                )}
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-account-email">Email *</Label>
                <Input
                  id="edit-account-email"
                  type="email"
                  value={formData.email}
                  disabled={readOnly}
                  {...bind("email")}
                />
                {!readOnly && (
                  <FieldError message={validation.fieldError("email")} />
                )}
              </div>
            </div>

            <div className={formDialogField}>
              <Label htmlFor="edit-account-website">Website</Label>
              <Input
                id="edit-account-website"
                type="text"
                inputMode="url"
                placeholder="https://example.com"
                value={formData.website}
                disabled={readOnly}
                {...bind("website")}
              />
              {!readOnly && (
                <FieldError message={validation.fieldError("website")} />
              )}
            </div>

            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="edit-account-revenue">Annual Revenue</Label>
                <Input
                  id="edit-account-revenue"
                  type="number"
                  min="0"
                  placeholder="100000"
                  value={formData.annual_revenue}
                  disabled={readOnly}
                  {...bind("annual_revenue")}
                />
                {!readOnly && (
                  <FieldError
                    message={validation.fieldError("annual_revenue")}
                  />
                )}
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-account-employees">Employees</Label>
                <Input
                  id="edit-account-employees"
                  type="number"
                  min="0"
                  placeholder="50"
                  value={formData.employees}
                  disabled={readOnly}
                  {...bind("employees")}
                />
                {!readOnly && (
                  <FieldError message={validation.fieldError("employees")} />
                )}
              </div>
            </div>

            <div className={formDialogField}>
              <Label htmlFor="edit-account-tier">Tier</Label>
              <ConfigNameSelect
                id="edit-account-tier"
                value={formData.tier}
                onValueChange={(value) =>
                  validation.updateField("tier", value, formData, setFormData)
                }
                options={tierOptions.length ? tierOptions : tiers}
                placeholder="Select tier"
                disabled={readOnly}
                className={validation.inputClassName("tier")}
              />
              {!readOnly && (
                <FieldError message={validation.fieldError("tier")} />
              )}
            </div>

            <div className={formDialogField}>
              <OwnerSelectField
                id="edit-account-owner"
                value={formData.owner}
                onValueChange={(value) =>
                  validation.updateField("owner", value, formData, setFormData)
                }
                disabled={readOnly}
                error={validation.fieldError("owner")}
                inputClassName={validation.inputClassName("owner")}
              />
            </div>

            <div className={formDialogField}>
              <Label htmlFor="edit-account-status">Account Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  validation.updateField("status", value, formData, setFormData)
                }
                disabled={readOnly}
              >
                <SelectTrigger
                  id="edit-account-status"
                  className={validation.inputClassName("status")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="max-h-[min(16rem,50dvh)]"
                >
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
              {!readOnly && (
                <FieldError message={validation.fieldError("status")} />
              )}
            </div>
          </div>

          <DialogFooter className={formDialogFooter}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {readOnly ? "Close" : "Cancel"}
            </Button>
            {!readOnly && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
