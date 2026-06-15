import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LEAD_STATUSES, toDateInputValue } from '@/lib/crmHelpers';
import { validateLeadForm } from '@/lib/crmFormValidation';
import { useCrmFormValidation } from '@/lib/useCrmFormValidation';
import FieldError from '@/components/forms/FieldError';
import {
  formDialogContent,
  formDialogHeader,
  formDialogBody,
  formDialogGrid,
  formDialogField,
  formDialogForm,
  formDialogFooter,
} from '@/lib/formDialog';

export default function EditLeadDialog({
  open,
  onOpenChange,
  lead,
  onSubmit,
  isLoading,
  readOnly = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'new',
    source: 'email',
    value: '',
    next_follow_up: '',
  });
  const validation = useCrmFormValidation(validateLeadForm);
  const { resetValidation, validateSubmit } = validation;

  useEffect(() => {
    if (open) resetValidation();
  }, [open, resetValidation]);

  useEffect(() => {
    if (lead) {
      setFormData({
        name: lead.name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        company: lead.company || '',
        status: lead.status || 'new',
        source: lead.source || 'email',
        value: lead.value || '',
        next_follow_up: toDateInputValue(lead.next_follow_up),
      });
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
          onChange: (e) => validation.updateField(field, e.target.value, formData, setFormData),
          onBlur: () => validation.touchField(field, formData),
          className: validation.inputClassName(field),
          'aria-invalid': Boolean(validation.fieldError(field)),
        };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={formDialogContent('md')}>
        <DialogHeader className={formDialogHeader}>
          <DialogTitle>{readOnly ? 'Lead Details' : 'Edit Lead'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className={formDialogForm}>
          <div className={formDialogBody}>
            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-name">Name *</Label>
                <Input id="edit-lead-name" value={formData.name} disabled={readOnly} {...bind('name')} />
                {!readOnly && <FieldError message={validation.fieldError('name')} />}
              </div>
              {!readOnly && (
                <p className="text-xs text-muted-foreground col-span-full -mb-2">
                  Email or phone is required
                </p>
              )}
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-email">Email</Label>
                <Input
                  id="edit-lead-email"
                  type="email"
                  value={formData.email}
                  disabled={readOnly}
                  {...(readOnly
                    ? {}
                    : {
                        onChange: (e) =>
                          validation.updateField('email', e.target.value, formData, setFormData, ['phone']),
                        onBlur: () => validation.touchField('email', formData, ['phone']),
                        className: validation.inputClassName('email'),
                        'aria-invalid': Boolean(validation.fieldError('email')),
                      })}
                />
                {!readOnly && <FieldError message={validation.fieldError('email')} />}
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-phone">Phone</Label>
                <Input
                  id="edit-lead-phone"
                  type="tel"
                  value={formData.phone}
                  disabled={readOnly}
                  {...(readOnly
                    ? {}
                    : {
                        onChange: (e) =>
                          validation.updateField('phone', e.target.value, formData, setFormData, ['email']),
                        onBlur: () => validation.touchField('phone', formData, ['email']),
                        className: validation.inputClassName('phone'),
                        'aria-invalid': Boolean(validation.fieldError('phone')),
                      })}
                />
                {!readOnly && <FieldError message={validation.fieldError('phone')} />}
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-company">Company</Label>
                <Input id="edit-lead-company" value={formData.company} disabled={readOnly} {...bind('company')} />
                {!readOnly && <FieldError message={validation.fieldError('company')} />}
              </div>
            </div>

            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => validation.updateField('status', value, formData, setFormData)}
                  disabled={readOnly}
                >
                  <SelectTrigger id="edit-lead-status" className={validation.inputClassName('status')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-[min(16rem,50dvh)]">
                    {LEAD_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!readOnly && <FieldError message={validation.fieldError('status')} />}
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-source">Source</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => validation.updateField('source', value, formData, setFormData)}
                  disabled={readOnly}
                >
                  <SelectTrigger id="edit-lead-source" className={validation.inputClassName('source')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-[min(16rem,50dvh)]">
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
                {!readOnly && <FieldError message={validation.fieldError('source')} />}
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
                  {...bind('value')}
                />
                {!readOnly && <FieldError message={validation.fieldError('value')} />}
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-follow-up">Next Follow-up</Label>
                <Input
                  id="edit-lead-follow-up"
                  type="date"
                  value={formData.next_follow_up}
                  disabled={readOnly}
                  {...bind('next_follow_up')}
                />
                {!readOnly && <FieldError message={validation.fieldError('next_follow_up')} />}
              </div>
            </div>
          </div>

          <DialogFooter className={formDialogFooter}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {readOnly ? 'Close' : 'Cancel'}
            </Button>
            {!readOnly && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
