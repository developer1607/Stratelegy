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
import { validateOpportunityForm } from '@/lib/crmFormValidation';
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

const STAGES = [
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
];

const EMPTY_FORM = {
  name: '',
  account_name: '',
  amount: '',
  stage: 'prospecting',
  probability: '',
  close_date: '',
  owner: '',
  source: '',
};

export default function OpportunityDialog({ open, onOpenChange, onSubmit, isLoading }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const validation = useCrmFormValidation(validateOpportunityForm);
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
      amount: formData.amount ? parseFloat(formData.amount) : undefined,
      probability: formData.probability ? parseFloat(formData.probability) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={formDialogContent('sm')}>
        <DialogHeader className={formDialogHeader}>
          <DialogTitle>Create Opportunity</DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={handleSubmit} className={formDialogForm}>
          <div className={formDialogBody}>
            <div className="space-y-4">
              <div className={formDialogField}>
                <Label htmlFor="opp-name">Name *</Label>
                <Input
                  id="opp-name"
                  value={formData.name}
                  onChange={(e) => validation.updateField('name', e.target.value, formData, setFormData)}
                  onBlur={() => validation.touchField('name', formData)}
                  className={validation.inputClassName('name')}
                  aria-invalid={Boolean(validation.fieldError('name'))}
                />
                <FieldError message={validation.fieldError('name')} />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="opp-account">Account</Label>
                <Input
                  id="opp-account"
                  value={formData.account_name}
                  onChange={(e) => validation.updateField('account_name', e.target.value, formData, setFormData)}
                  onBlur={() => validation.touchField('account_name', formData)}
                  className={validation.inputClassName('account_name')}
                />
                <FieldError message={validation.fieldError('account_name')} />
              </div>
              <div className={formDialogGrid}>
                <div className={formDialogField}>
                  <Label htmlFor="opp-amount">Amount</Label>
                  <Input
                    id="opp-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => validation.updateField('amount', e.target.value, formData, setFormData)}
                    onBlur={() => validation.touchField('amount', formData)}
                    className={validation.inputClassName('amount')}
                    aria-invalid={Boolean(validation.fieldError('amount'))}
                  />
                  <FieldError message={validation.fieldError('amount')} />
                </div>
                <div className={formDialogField}>
                  <Label htmlFor="opp-stage">Stage</Label>
                  <Select
                    value={formData.stage}
                    onValueChange={(stage) => validation.updateField('stage', stage, formData, setFormData)}
                  >
                    <SelectTrigger id="opp-stage" className={validation.inputClassName('stage')}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[min(16rem,50dvh)]">
                      {STAGES.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={validation.fieldError('stage')} />
                </div>
              </div>
              <div className={formDialogGrid}>
                <div className={formDialogField}>
                  <Label htmlFor="opp-probability">Probability (%)</Label>
                  <Input
                    id="opp-probability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => validation.updateField('probability', e.target.value, formData, setFormData)}
                    onBlur={() => validation.touchField('probability', formData)}
                    className={validation.inputClassName('probability')}
                    aria-invalid={Boolean(validation.fieldError('probability'))}
                  />
                  <FieldError message={validation.fieldError('probability')} />
                </div>
                <div className={formDialogField}>
                  <Label htmlFor="opp-close">Close date</Label>
                  <Input
                    id="opp-close"
                    type="date"
                    value={formData.close_date}
                    onChange={(e) => validation.updateField('close_date', e.target.value, formData, setFormData)}
                    onBlur={() => validation.touchField('close_date', formData)}
                    className={validation.inputClassName('close_date')}
                    aria-invalid={Boolean(validation.fieldError('close_date'))}
                  />
                  <FieldError message={validation.fieldError('close_date')} />
                </div>
              </div>
              <div className={formDialogGrid}>
                <div className={formDialogField}>
                  <Label htmlFor="opp-owner">Owner</Label>
                  <Input
                    id="opp-owner"
                    value={formData.owner}
                    onChange={(e) => validation.updateField('owner', e.target.value, formData, setFormData)}
                    onBlur={() => validation.touchField('owner', formData)}
                    className={validation.inputClassName('owner')}
                  />
                  <FieldError message={validation.fieldError('owner')} />
                </div>
                <div className={formDialogField}>
                  <Label htmlFor="opp-source">Source</Label>
                  <Input
                    id="opp-source"
                    value={formData.source}
                    onChange={(e) => validation.updateField('source', e.target.value, formData, setFormData)}
                    onBlur={() => validation.touchField('source', formData)}
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
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
