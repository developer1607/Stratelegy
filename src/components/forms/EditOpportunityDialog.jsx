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
import { validateOpportunityForm } from '@/lib/crmFormValidation';
import { useCrmFormValidation } from '@/lib/useCrmFormValidation';
import FieldError from '@/components/forms/FieldError';
import AccountSelectField from '@/components/forms/AccountSelectField';
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

export default function EditOpportunityDialog({
  open,
  onOpenChange,
  opportunity,
  onSubmit,
  isLoading,
  readOnly = false,
}) {
  const [formData, setFormData] = useState({
    name: '',
    account_name: '',
    account_id: '',
    amount: '',
    stage: 'prospecting',
    probability: '',
    close_date: '',
    owner: '',
    source: '',
  });
  const validation = useCrmFormValidation(validateOpportunityForm);
  const { resetValidation, validateSubmit } = validation;

  useEffect(() => {
    if (open) resetValidation();
  }, [open, resetValidation]);

  useEffect(() => {
    if (opportunity) {
      setFormData({
        name: opportunity.name || '',
        account_name: opportunity.account_name || '',
        account_id: opportunity.account_id || '',
        amount: opportunity.amount ?? '',
        stage: opportunity.stage || 'prospecting',
        probability: opportunity.probability ?? '',
        close_date: opportunity.close_date || '',
        owner: opportunity.owner || '',
        source: opportunity.source || '',
      });
      resetValidation();
    }
  }, [opportunity, resetValidation]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    if (!validateSubmit(formData)) return;

    onSubmit({
      ...formData,
      amount: formData.amount !== '' ? Number(formData.amount) : undefined,
      probability: formData.probability !== '' ? Number(formData.probability) : undefined,
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
          <DialogTitle>{readOnly ? 'View Opportunity' : 'Edit Opportunity'}</DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={handleSubmit} className={formDialogForm}>
          <div className={formDialogBody}>
            <div className="space-y-4">
              <div className={formDialogField}>
                <Label htmlFor="edit-opp-name">Name *</Label>
                <Input id="edit-opp-name" disabled={readOnly} value={formData.name} {...bind('name')} />
                {!readOnly && <FieldError message={validation.fieldError('name')} />}
              </div>
              <AccountSelectField
                value={formData.account_name}
                accountId={formData.account_id}
                onValueChange={(accountName) =>
                  readOnly
                    ? undefined
                    : validation.updateField('account_name', accountName, formData, setFormData)
                }
                onAccountIdChange={(id) =>
                  readOnly
                    ? undefined
                    : validation.updateField('account_id', id, formData, setFormData)
                }
                onCompanyBlur={() => validation.touchField('account_name', formData)}
                companyError={validation.fieldError('account_name')}
                companyInputClassName={validation.inputClassName('account_name')}
                disabled={readOnly}
                accountSelectId="edit-opp-account"
                companyInputId="edit-opp-account-custom"
                linkedHint={(name) =>
                  `Deal will show under ${name} in Account Insights → Open Deals.`
                }
              />
              <div className={formDialogGrid}>
                <div className={formDialogField}>
                  <Label htmlFor="edit-opp-amount">Amount</Label>
                  <Input
                    id="edit-opp-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    disabled={readOnly}
                    value={formData.amount}
                    {...bind('amount')}
                  />
                  {!readOnly && <FieldError message={validation.fieldError('amount')} />}
                </div>
                <div className={formDialogField}>
                  <Label htmlFor="edit-opp-stage">Stage</Label>
                  <Select
                    disabled={readOnly}
                    value={formData.stage}
                    onValueChange={(stage) => validation.updateField('stage', stage, formData, setFormData)}
                  >
                    <SelectTrigger id="edit-opp-stage" className={validation.inputClassName('stage')}>
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
                  {!readOnly && <FieldError message={validation.fieldError('stage')} />}
                </div>
              </div>
              <div className={formDialogGrid}>
                <div className={formDialogField}>
                  <Label htmlFor="edit-opp-probability">Probability (%)</Label>
                  <Input
                    id="edit-opp-probability"
                    type="number"
                    min="0"
                    max="100"
                    disabled={readOnly}
                    value={formData.probability}
                    {...bind('probability')}
                  />
                  {!readOnly && <FieldError message={validation.fieldError('probability')} />}
                </div>
                <div className={formDialogField}>
                  <Label htmlFor="edit-opp-close">Close date</Label>
                  <Input
                    id="edit-opp-close"
                    type="date"
                    disabled={readOnly}
                    value={formData.close_date}
                    {...bind('close_date')}
                  />
                  {!readOnly && <FieldError message={validation.fieldError('close_date')} />}
                </div>
              </div>
              <div className={formDialogGrid}>
                <div className={formDialogField}>
                  <Label htmlFor="edit-opp-owner">Owner</Label>
                  <Input id="edit-opp-owner" disabled={readOnly} value={formData.owner} {...bind('owner')} />
                  {!readOnly && <FieldError message={validation.fieldError('owner')} />}
                </div>
                <div className={formDialogField}>
                  <Label htmlFor="edit-opp-source">Source</Label>
                  <Input id="edit-opp-source" disabled={readOnly} value={formData.source} {...bind('source')} />
                  {!readOnly && <FieldError message={validation.fieldError('source')} />}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className={formDialogFooter}>
            {readOnly ? (
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
