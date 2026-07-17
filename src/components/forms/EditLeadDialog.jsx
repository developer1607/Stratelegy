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
import { toDateInputValue, todayDateMin } from "@/lib/crmHelpers";
import { validateLeadForm } from "@/lib/crmFormValidation";
import { useCrmFormValidation } from "@/lib/useCrmFormValidation";
import FieldError from "@/components/forms/FieldError";
import AccountSelectField from "@/components/forms/AccountSelectField";
import ConfigNameSelect from "@/components/forms/ConfigNameSelect";
import { useCrmConfig } from "@/hooks/useCrmConfig";
import { contactSourceOptions, leadStageOptions } from "@/lib/crmConfig";
import {
  formDialogContent,
  formDialogHeader,
  formDialogBody,
  formDialogGrid,
  formDialogField,
  formDialogForm,
  formDialogFooter,
} from "@/lib/formDialog";

export default function EditLeadDialog({
  open,
  onOpenChange,
  lead,
  onSubmit,
  isLoading,
  readOnly = false,
}) {
  const { leadStages, contactSources } = useCrmConfig({ enabled: open });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    account_id: "",
    status: "new",
    source: "email",
    value: "",
    next_follow_up: "",
  });
  const [originalForm, setOriginalForm] = useState(null);
  const stageOptions = leadStageOptions(leadStages, formData.status);
  const sourceOptions = contactSourceOptions(contactSources, formData.source);
  const validate = useCallback(
    (data) =>
      validateLeadForm(data, {
        original: originalForm,
        allowedStatuses: stageOptions,
        allowedSources: sourceOptions,
      }),
    [originalForm, stageOptions, sourceOptions],
  );
  const validation = useCrmFormValidation(validate);
  const { resetValidation, validateSubmit } = validation;

  useEffect(() => {
    if (open) resetValidation();
  }, [open, resetValidation]);

  useEffect(() => {
    if (lead) {
      const loaded = {
        name: lead.name || "",
        email: lead.email || "",
        phone: lead.phone || "",
        company: lead.company || "",
        account_id: lead.account_id || "",
        status: lead.status || "new",
        source: lead.source || "email",
        value: lead.value || "",
        next_follow_up: toDateInputValue(lead.next_follow_up),
      };
      setFormData(loaded);
      setOriginalForm(loaded);
      resetValidation();
    }
  }, [lead, resetValidation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    if (!validateSubmit(formData)) return;

    onSubmit({
      ...formData,
      value: formData.value ? Number(formData.value) : undefined,
    });
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
          <DialogTitle>{readOnly ? "Lead Details" : "Edit Lead"}</DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={handleSubmit} className={formDialogForm}>
          <div className={formDialogBody}>
            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-name">Name *</Label>
                <Input
                  id="edit-lead-name"
                  value={formData.name}
                  disabled={readOnly}
                  {...bind("name")}
                />
                {!readOnly && (
                  <FieldError message={validation.fieldError("name")} />
                )}
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-email">Email *</Label>
                <Input
                  id="edit-lead-email"
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
                <Label htmlFor="edit-lead-phone">Phone</Label>
                <Input
                  id="edit-lead-phone"
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
              onCompanyChange={(company) =>
                readOnly
                  ? undefined
                  : validation.updateField(
                      "company",
                      company,
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
              accountSelectId="edit-lead-account"
              companyInputId="edit-lead-company"
              customValueLabel="Company name"
              linkedHint={(name) =>
                `When converted, the opportunity will link to account ${name}.`
              }
            />

            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-status">Status</Label>
                <ConfigNameSelect
                  id="edit-lead-status"
                  value={formData.status}
                  onValueChange={(value) =>
                    validation.updateField(
                      "status",
                      value,
                      formData,
                      setFormData,
                    )
                  }
                  options={stageOptions}
                  disabled={readOnly}
                  className={validation.inputClassName("status")}
                />
                {!readOnly && (
                  <FieldError message={validation.fieldError("status")} />
                )}
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-source">Source</Label>
                <ConfigNameSelect
                  id="edit-lead-source"
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

            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-value">Estimated Value</Label>
                <Input
                  id="edit-lead-value"
                  type="number"
                  min="0"
                  placeholder="50000"
                  value={formData.value}
                  disabled={readOnly}
                  {...bind("value")}
                />
                {!readOnly && (
                  <FieldError message={validation.fieldError("value")} />
                )}
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-follow-up">Next Follow-up</Label>
                <Input
                  id="edit-lead-follow-up"
                  type="date"
                  min={todayDateMin()}
                  value={formData.next_follow_up}
                  disabled={readOnly}
                  {...bind("next_follow_up")}
                />
                {!readOnly && (
                  <FieldError
                    message={validation.fieldError("next_follow_up")}
                  />
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
