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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { validateAccountForm } from '@/lib/crmFormValidation';
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

const EMPTY_FORM = {
  name: '',
  industry: '',
  website: '',
  phone: '',
  email: '',
  annual_revenue: '',
  employees: '',
  status: 'active',
};

export default function AccountDialog({ open, onOpenChange, onSubmit, isLoading }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const validation = useCrmFormValidation(validateAccountForm);
  const { resetValidation, validateSubmit } = validation;

  useEffect(() => {
    if (open) {
      resetValidation();
      return;
    }
    setFormData(EMPTY_FORM);
    resetValidation();
  }, [open, resetValidation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateSubmit(formData)) return;

    onSubmit({
      ...formData,
      annual_revenue:
        formData.annual_revenue !== ''
          ? parseFloat(formData.annual_revenue)
          : undefined,
      employees:
        formData.employees !== ''
          ? parseInt(formData.employees, 10)
          : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={formDialogContent('md')}>
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
                  onChange={(e) => validation.updateField('name', e.target.value, formData, setFormData)}
                  onBlur={() => validation.touchField('name', formData)}
                  className={validation.inputClassName('name')}
                  aria-invalid={Boolean(validation.fieldError('name'))}
                />
                <FieldError message={validation.fieldError('name')} />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => validation.updateField('industry', e.target.value, formData, setFormData)}
                  onBlur={() => validation.touchField('industry', formData)}
                  className={validation.inputClassName('industry')}
                />
                <FieldError message={validation.fieldError('industry')} />
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
              <div className={formDialogField}>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="text"
                  inputMode="url"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => validation.updateField('website', e.target.value, formData, setFormData)}
                  onBlur={() => validation.touchField('website', formData)}
                  className={validation.inputClassName('website')}
                  aria-invalid={Boolean(validation.fieldError('website'))}
                />
                <FieldError message={validation.fieldError('website')} />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="revenue">Annual Revenue</Label>
                <Input
                  id="revenue"
                  type="number"
                  min="0"
                  value={formData.annual_revenue}
                  onChange={(e) => validation.updateField('annual_revenue', e.target.value, formData, setFormData)}
                  onBlur={() => validation.touchField('annual_revenue', formData)}
                  className={validation.inputClassName('annual_revenue')}
                  aria-invalid={Boolean(validation.fieldError('annual_revenue'))}
                />
                <FieldError message={validation.fieldError('annual_revenue')} />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="employees">Employees</Label>
                <Input
                  id="employees"
                  type="number"
                  min="0"
                  value={formData.employees}
                  onChange={(e) => validation.updateField('employees', e.target.value, formData, setFormData)}
                  onBlur={() => validation.touchField('employees', formData)}
                  className={validation.inputClassName('employees')}
                  aria-invalid={Boolean(validation.fieldError('employees'))}
                />
                <FieldError message={validation.fieldError('employees')} />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => validation.updateField('status', value, formData, setFormData)}
                >
                  <SelectTrigger id="status" className={validation.inputClassName('status')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-[min(16rem,50dvh)]">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError message={validation.fieldError('status')} />
              </div>
            </div>
          </div>
          <DialogFooter className={formDialogFooter}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
