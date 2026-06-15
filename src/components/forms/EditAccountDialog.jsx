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
import { validateAccountForm, showValidationErrors } from '@/lib/crmFormValidation';
import {
  formDialogContent,
  formDialogHeader,
  formDialogBody,
  formDialogGrid,
  formDialogField,
  formDialogForm,
  formDialogFooter,
} from '@/lib/formDialog';

export default function EditAccountDialog({
  open,
  onOpenChange,
  account,
  onSubmit,
  isLoading,
  readOnly = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    phone: '',
    email: '',
    annual_revenue: '',
    employees: '',
    status: 'active',
  });

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        industry: account.industry || '',
        website: account.website || '',
        phone: account.phone || '',
        email: account.email || '',
        annual_revenue: account.annual_revenue || '',
        employees: account.employees || '',
        status: account.status || 'active',
      });
    }
  }, [account]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    if (!showValidationErrors(validateAccountForm(formData))) return;

    const dataToSubmit = {
      ...formData,
      annual_revenue: formData.annual_revenue ? Number(formData.annual_revenue) : undefined,
      employees: formData.employees ? Number(formData.employees) : undefined,
    };
    onSubmit(dataToSubmit);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={formDialogContent('md')}>
        <DialogHeader className={formDialogHeader}>
          <DialogTitle>{readOnly ? 'Account Details' : 'Edit Account'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className={formDialogForm}>
          <div className={formDialogBody}>
            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="edit-account-name">Account Name *</Label>
                <Input
                  id="edit-account-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={readOnly}
                />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-account-industry">Industry</Label>
                <Input
                  id="edit-account-industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  disabled={readOnly}
                />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-account-phone">Phone</Label>
                <Input
                  id="edit-account-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={readOnly}
                />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-account-email">Email</Label>
                <Input
                  id="edit-account-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={readOnly}
                />
              </div>
            </div>

            <div className={formDialogField}>
              <Label htmlFor="edit-account-website">Website</Label>
              <Input
                id="edit-account-website"
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={readOnly}
              />
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
                  onChange={(e) => setFormData({ ...formData, annual_revenue: e.target.value })}
                  disabled={readOnly}
                />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-account-employees">Employees</Label>
                <Input
                  id="edit-account-employees"
                  type="number"
                  min="0"
                  placeholder="50"
                  value={formData.employees}
                  onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                  disabled={readOnly}
                />
              </div>
            </div>

            <div className={formDialogField}>
              <Label htmlFor="edit-account-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                disabled={readOnly}
              >
                <SelectTrigger id="edit-account-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-[min(16rem,50dvh)]">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
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
