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
import { validateLeadForm, showValidationErrors } from '@/lib/crmFormValidation';
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
    }
  }, [lead]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    if (!showValidationErrors(validateLeadForm(formData))) return;

    onSubmit({
      ...formData,
      value: formData.value ? Number(formData.value) : undefined,
    });
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
                <Input
                  id="edit-lead-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={readOnly}
                />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-email">Email</Label>
                <Input
                  id="edit-lead-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={readOnly}
                />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-phone">Phone</Label>
                <Input
                  id="edit-lead-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={readOnly}
                />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-company">Company</Label>
                <Input
                  id="edit-lead-company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  disabled={readOnly}
                />
              </div>
            </div>

            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={readOnly}
                >
                  <SelectTrigger id="edit-lead-status">
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
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-source">Source</Label>
                <Select
                  value={formData.source}
                  onValueChange={(value) => setFormData({ ...formData, source: value })}
                  disabled={readOnly}
                >
                  <SelectTrigger id="edit-lead-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-[min(16rem,50dvh)]">
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                  </SelectContent>
                </Select>
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
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  disabled={readOnly}
                />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-lead-follow-up">Next Follow-up</Label>
                <Input
                  id="edit-lead-follow-up"
                  type="date"
                  value={formData.next_follow_up}
                  onChange={(e) => setFormData({ ...formData, next_follow_up: e.target.value })}
                  disabled={readOnly}
                />
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
