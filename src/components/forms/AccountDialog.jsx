import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { useAuth } from "@/lib/AuthContext";
import { userOwnerLabel } from "@/lib/accountOwner";
import {
  formDialogContent,
  formDialogHeader,
  formDialogBody,
  formDialogGrid,
  formDialogField,
  formDialogForm,
  formDialogFooter,
} from "@/lib/formDialog";

const EMPTY_FORM = {
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
};

export default function AccountDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  tiers = [],
  defaultTier = "Standard",
}) {
  const { user } = useAuth();
  const { defaults, accountTiers, industries } = useCrmConfig({
    enabled: open,
  });
  const [formData, setFormData] = useState(EMPTY_FORM);
  const tierOptions = accountTierOptions(accountTiers, formData.tier);
  const industryOpts = industryOptions(industries, formData.industry);
  const validate = useCallback(
    (data) =>
      validateAccountForm(data, {
        allowedTiers: tierOptions,
        allowedIndustries: industryOpts,
      }),
    [tierOptions, industryOpts],
  );
  const validation = useCrmFormValidation(validate);
  const { resetValidation, validateSubmit } = validation;
  const defaultOwner = userOwnerLabel(user);

  useEffect(() => {
    if (open) {
      setFormData({
        ...EMPTY_FORM,
        tier: defaultTier || defaults.accountTier || tiers[0] || "Standard",
        owner: defaultOwner,
      });
      resetValidation();
      return;
    }
    setFormData(EMPTY_FORM);
    resetValidation();
  }, [
    open,
    resetValidation,
    defaultTier,
    tiers,
    defaultOwner,
    defaults.accountTier,
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateSubmit(formData)) return;

    onSubmit(buildAccountPayload(formData));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={formDialogContent("md")}>
        <DialogHeader className={formDialogHeader}>
          <DialogTitle>Create New Account</DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={handleSubmit} className={formDialogForm}>
          <div className={formDialogBody}>
            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="name">Account Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    validation.updateField(
                      "name",
                      e.target.value,
                      formData,
                      setFormData,
                    )
                  }
                  onBlur={() => validation.touchField("name", formData)}
                  className={validation.inputClassName("name")}
                  aria-invalid={Boolean(validation.fieldError("name"))}
                />
                <FieldError message={validation.fieldError("name")} />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="industry">Industry</Label>
                <ConfigNameSelect
                  id="industry"
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
                  className={validation.inputClassName("industry")}
                />
                <FieldError message={validation.fieldError("industry")} />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="tier">Tier</Label>
                <ConfigNameSelect
                  id="tier"
                  value={formData.tier}
                  onValueChange={(value) =>
                    validation.updateField("tier", value, formData, setFormData)
                  }
                  options={tierOptions.length ? tierOptions : tiers}
                  placeholder="Select tier"
                  className={validation.inputClassName("tier")}
                />
                <FieldError message={validation.fieldError("tier")} />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    validation.updateField(
                      "email",
                      e.target.value,
                      formData,
                      setFormData,
                    )
                  }
                  onBlur={() => validation.touchField("email", formData)}
                  className={validation.inputClassName("email")}
                  aria-invalid={Boolean(validation.fieldError("email"))}
                />
                <FieldError message={validation.fieldError("email")} />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    validation.updateField(
                      "phone",
                      e.target.value,
                      formData,
                      setFormData,
                    )
                  }
                  onBlur={() => validation.touchField("phone", formData)}
                  className={validation.inputClassName("phone")}
                  aria-invalid={Boolean(validation.fieldError("phone"))}
                />
                <FieldError message={validation.fieldError("phone")} />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="text"
                  inputMode="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) =>
                    validation.updateField(
                      "website",
                      e.target.value,
                      formData,
                      setFormData,
                    )
                  }
                  onBlur={() => validation.touchField("website", formData)}
                  className={validation.inputClassName("website")}
                  aria-invalid={Boolean(validation.fieldError("website"))}
                />
                <FieldError message={validation.fieldError("website")} />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="revenue">Annual Revenue</Label>
                <Input
                  id="revenue"
                  type="number"
                  min="0"
                  value={formData.annual_revenue}
                  onChange={(e) =>
                    validation.updateField(
                      "annual_revenue",
                      e.target.value,
                      formData,
                      setFormData,
                    )
                  }
                  onBlur={() =>
                    validation.touchField("annual_revenue", formData)
                  }
                  className={validation.inputClassName("annual_revenue")}
                  aria-invalid={Boolean(
                    validation.fieldError("annual_revenue"),
                  )}
                />
                <FieldError message={validation.fieldError("annual_revenue")} />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="employees">Employees</Label>
                <Input
                  id="employees"
                  type="number"
                  min="0"
                  value={formData.employees}
                  onChange={(e) =>
                    validation.updateField(
                      "employees",
                      e.target.value,
                      formData,
                      setFormData,
                    )
                  }
                  onBlur={() => validation.touchField("employees", formData)}
                  className={validation.inputClassName("employees")}
                  aria-invalid={Boolean(validation.fieldError("employees"))}
                />
                <FieldError message={validation.fieldError("employees")} />
              </div>
              <div className={formDialogField}>
                <OwnerSelectField
                  id="owner"
                  value={formData.owner}
                  onValueChange={(value) =>
                    validation.updateField(
                      "owner",
                      value,
                      formData,
                      setFormData,
                    )
                  }
                  disabled={isLoading}
                  error={validation.fieldError("owner")}
                  inputClassName={validation.inputClassName("owner")}
                  allowUnassigned={false}
                />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="status">Account Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    validation.updateField(
                      "status",
                      value,
                      formData,
                      setFormData,
                    )
                  }
                >
                  <SelectTrigger
                    id="status"
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
                <FieldError message={validation.fieldError("status")} />
              </div>
            </div>
          </div>
          <DialogFooter className={formDialogFooter}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
