import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { todayDateMin } from '@/lib/crmHelpers';
import { validateLeadForm } from '@/lib/crmFormValidation';
import { useCrmFormValidation } from '@/lib/useCrmFormValidation';
import FieldError from '@/components/forms/FieldError';
import AccountSelectField from '@/components/forms/AccountSelectField';
import ConfigNameSelect from '@/components/forms/ConfigNameSelect';
import { useCrmConfig } from '@/hooks/useCrmConfig';
import { contactSourceOptions, leadStageOptions } from '@/lib/crmConfig';
import {
  formDialogContent,
  formDialogHeader,
  formDialogBody,
  formDialogGrid,
  formDialogField,
  formDialogForm,
  formDialogFooter,
} from '@/lib/formDialog';

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
  account_id: '',
  status: '',
  source: '',
  value: '',
  next_follow_up: '',
};

export default function LeadDialog({ open, onOpenChange, onSubmit, isLoading }) {
  const { defaults, leadStages, contactSources } = useCrmConfig({ enabled: open });
  const stageOptions = leadStageOptions(leadStages);
  const sourceOptions = contactSourceOptions(contactSources);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const validation = useCrmFormValidation((data) =>
    validateLeadForm(data, {
      allowedStatuses: stageOptions,
      allowedSources: sourceOptions,
    }),
  );
  const { resetValidation, validateSubmit } = validation;

  useEffect(() => {
    if (open) {
      setFormData({
        ...EMPTY_FORM,
        status: defaults.leadStage,
        source: defaults.contactSource,
        next_follow_up: defaults.followUpDate,
      });
      resetValidation();
      return;
    }
    setFormData(EMPTY_FORM);
    resetValidation();
  }, [open, resetValidation, defaults.leadStage, defaults.contactSource, defaults.followUpDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateSubmit(formData)) return;

    onSubmit({
      ...formData,
      value: formData.value ? parseFloat(formData.value) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={formDialogContent('sm')}>
        <DialogHeader className={formDialogHeader}>
          <DialogTitle>Create New Lead</DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={handleSubmit} className={formDialogForm}>
          <div className={formDialogBody}>
            <div className="space-y-4">
              <div className={formDialogField}>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => validation.updateField('name', e.target.value, formData, setFormData)}
                  onBlur={() => validation.touchField('name', formData)}
                  className={validation.inputClassName('name')}
                  aria-invalid={Boolean(validation.fieldError('name'))}
                />
                <FieldError message={validation.fieldError('name')} />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => validation.updateField('email', e.target.value, formData, setFormData)}
                  onBlur={() => validation.touchField('email', formData)}
                  className={validation.inputClassName('email')}
                  aria-invalid={Boolean(validation.fieldError('email'))}
                />
                <FieldError message={validation.fieldError('email')} />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => validation.updateField('phone', e.target.value, formData, setFormData)}
                  onBlur={() => validation.touchField('phone', formData)}
                  className={validation.inputClassName('phone')}
                  aria-invalid={Boolean(validation.fieldError('phone'))}
                />
                <FieldError message={validation.fieldError('phone')} />
              </div>
              <AccountSelectField
                company={formData.company}
                accountId={formData.account_id}
                onCompanyChange={(company) =>
                  validation.updateField('company', company, formData, setFormData)
                }
                onAccountIdChange={(id) =>
                  validation.updateField('account_id', id, formData, setFormData)
                }
                onCompanyBlur={() => validation.touchField('company', formData)}
                companyError={validation.fieldError('company')}
                companyInputClassName={validation.inputClassName('company')}
                accountSelectId="lead-account"
                companyInputId="lead-company"
                customValueLabel="Company name"
                linkedHint={(name) =>
                  `When converted, the opportunity will link to account ${name}.`
                }
              />
              <div className={formDialogField}>
                <Label htmlFor="value">Estimated Value</Label>
                <Input
                  id="value"
                  type="number"
                  value={formData.value}
                  onChange={(e) => validation.updateField('value', e.target.value, formData, setFormData)}
                  onBlur={() => validation.touchField('value', formData)}
                  className={validation.inputClassName('value')}
                  aria-invalid={Boolean(validation.fieldError('value'))}
                />
                <FieldError message={validation.fieldError('value')} />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="next_follow_up">Next Follow-up</Label>
                <Input
                  id="next_follow_up"
                  type="date"
                  min={todayDateMin()}
                  value={formData.next_follow_up}
                  onChange={(e) => validation.updateField('next_follow_up', e.target.value, formData, setFormData)}
                  onBlur={() => validation.touchField('next_follow_up', formData)}
                  className={validation.inputClassName('next_follow_up')}
                  aria-invalid={Boolean(validation.fieldError('next_follow_up'))}
                />
                <FieldError message={validation.fieldError('next_follow_up')} />
              </div>
              <div className={formDialogGrid}>
                <div className={formDialogField}>
                  <Label htmlFor="status">Status</Label>
                  <ConfigNameSelect
                    id="status"
                    value={formData.status}
                    onValueChange={(value) => validation.updateField('status', value, formData, setFormData)}
                    options={stageOptions}
                    className={validation.inputClassName('status')}
                  />
                  <FieldError message={validation.fieldError('status')} />
                </div>
                <div className={formDialogField}>
                  <Label htmlFor="source">Source</Label>
                  <ConfigNameSelect
                    id="source"
                    value={formData.source}
                    onValueChange={(value) => validation.updateField('source', value, formData, setFormData)}
                    options={sourceOptions}
                    className={validation.inputClassName('source')}
                  />
                  <FieldError message={validation.fieldError('source')} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className={formDialogFooter}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
