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
import { validateContactForm } from "@/lib/crmFormValidation";
import { useCrmFormValidation } from "@/lib/useCrmFormValidation";
import FieldError from "@/components/forms/FieldError";
import ConfigNameSelect from "@/components/forms/ConfigNameSelect";
import { useCrmConfig } from "@/hooks/useCrmConfig";
import { contactSourceOptions } from "@/lib/crmConfig";
import {
  formDialogContent,
  formDialogHeader,
  formDialogBody,
  formDialogGrid,
  formDialogField,
  formDialogForm,
  formDialogFooter,
} from "@/lib/formDialog";
import AccountSelectField from "@/components/forms/AccountSelectField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditContactDialog({
  open,
  onOpenChange,
  contact,
  onSubmit,
  isLoading,
  readOnly = false,
}) {
  const { contactSources } = useCrmConfig({ enabled: open });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    account_id: "",
    position: "",
    role: "",
    priority: "Standard",
    status: "active",
    source: "email",
    engagement_level: "Medium",
    company_size: "",
    last_activity_date: "",
  });
  const sourceOptions = contactSourceOptions(contactSources, formData.source);
  const validate = useCallback(
    (data) =>
      validateContactForm(data, {
        requireEmail: true,
        allowedSources: contactSourceOptions(contactSources, data.source),
      }),
    [contactSources],
  );
  const validation = useCrmFormValidation(validate);
  const { resetValidation, validateSubmit } = validation;

  useEffect(() => {
    if (open) resetValidation();
  }, [open, resetValidation]);

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || "",
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        account_id: contact.account_id || "",
        position: contact.position || "",
        role: contact.role || "",
        priority: contact.priority || "Standard",
        status: contact.status || "active",
        source: contact.source || "email",
        engagement_level: contact.engagement_level || "Medium",
        company_size: contact.company_size || "",
        last_activity_date: contact.last_activity_date || "",
      });
      resetValidation();
    }
  }, [contact, resetValidation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    if (!validateSubmit(formData)) return;
    onSubmit(formData);
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
            {readOnly ? "Contact Details" : "Edit Contact"}
          </DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={handleSubmit} className={formDialogForm}>
          <div className={formDialogBody}>
            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="edit-contact-name">Name *</Label>
                <Input
                  id="edit-contact-name"
                  value={formData.name}
                  disabled={readOnly}
                  {...bind("name")}
                />
                {!readOnly && (
                  <FieldError message={validation.fieldError("name")} />
                )}
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-contact-email">Email *</Label>
                <Input
                  id="edit-contact-email"
                  type="email"
                  value={formData.email}
                  disabled={readOnly}
                  {...bind("email")}
                />
                {!readOnly && (
                  <FieldError message={validation.fieldError("email")} />
                )}
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-contact-phone">Phone</Label>
                <Input
                  id="edit-contact-phone"
                  type="tel"
                  value={formData.phone}
                  disabled={readOnly}
                  {...bind("phone")}
                />
                {!readOnly && (
                  <FieldError message={validation.fieldError("phone")} />
                )}
              </div>
            </div>

            <AccountSelectField
              company={formData.company}
              accountId={formData.account_id}
              onCompanyChange={(value) =>
                readOnly
                  ? undefined
                  : validation.updateField(
                      "company",
                      value,
                      formData,
                      setFormData,
                    )
              }
              onAccountIdChange={(id) =>
                readOnly
                  ? undefined
                  : validation.updateField(
                      "account_id",
                      id,
                      formData,
                      setFormData,
                    )
              }
              onCompanyBlur={() => validation.touchField("company", formData)}
              companyError={validation.fieldError("company")}
              companyInputClassName={validation.inputClassName("company")}
              disabled={readOnly}
              accountSelectId="edit-contact-account"
              companyInputId="edit-contact-company"
            />

            <div className={formDialogField}>
              <Label htmlFor="edit-contact-position">Position</Label>
              <Input
                id="edit-contact-position"
                value={formData.position}
                disabled={readOnly}
                {...bind("position")}
              />
              {!readOnly && (
                <FieldError message={validation.fieldError("position")} />
              )}
            </div>

            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="edit-contact-status">Status</Label>
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
                  disabled={readOnly}
                >
                  <SelectTrigger
                    id="edit-contact-status"
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
                  </SelectContent>
                </Select>
                {!readOnly && (
                  <FieldError message={validation.fieldError("status")} />
                )}
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-contact-source">Source</Label>
                <ConfigNameSelect
                  id="edit-contact-source"
                  value={formData.source}
                  onValueChange={(value) =>
                    validation.updateField(
                      "source",
                      value,
                      formData,
                      setFormData,
                    )
                  }
                  options={sourceOptions}
                  disabled={readOnly}
                  className={validation.inputClassName("source")}
                />
                {!readOnly && (
                  <FieldError message={validation.fieldError("source")} />
                )}
              </div>
            </div>
          </div>

          <DialogFooter className={formDialogFooter}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={!readOnly && isLoading}
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
