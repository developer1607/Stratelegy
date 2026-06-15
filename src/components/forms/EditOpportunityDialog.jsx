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
import { validateOpportunityForm, showValidationErrors } from '@/lib/crmFormValidation';
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
    amount: '',
    stage: 'prospecting',
    probability: '',
    close_date: '',
    owner: '',
    source: '',
  });

  useEffect(() => {
    if (opportunity) {
      setFormData({
        name: opportunity.name || '',
        account_name: opportunity.account_name || '',
        amount: opportunity.amount ?? '',
        stage: opportunity.stage || 'prospecting',
        probability: opportunity.probability ?? '',
        close_date: opportunity.close_date || '',
        owner: opportunity.owner || '',
        source: opportunity.source || '',
      });
    }
  }, [opportunity]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return;
    if (!showValidationErrors(validateOpportunityForm(formData))) return;

    onSubmit({
      ...formData,
      amount: formData.amount !== '' ? Number(formData.amount) : undefined,
      probability: formData.probability !== '' ? Number(formData.probability) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={formDialogContent('md')}>
        <DialogHeader className={formDialogHeader}>
          <DialogTitle>{readOnly ? 'View Opportunity' : 'Edit Opportunity'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className={formDialogForm}>
          <div className={formDialogBody}>
            <div className="space-y-4">
              <div className={formDialogField}>
                <Label htmlFor="edit-opp-name">Name *</Label>
                <Input
                  id="edit-opp-name"
                  disabled={readOnly}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="edit-opp-account">Account</Label>
                <Input
                  id="edit-opp-account"
                  disabled={readOnly}
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                />
              </div>
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
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className={formDialogField}>
                  <Label htmlFor="edit-opp-stage">Stage</Label>
                  <Select
                    disabled={readOnly}
                    value={formData.stage}
                    onValueChange={(stage) => setFormData({ ...formData, stage })}
                  >
                    <SelectTrigger id="edit-opp-stage">
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
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                  />
                </div>
                <div className={formDialogField}>
                  <Label htmlFor="edit-opp-close">Close date</Label>
                  <Input
                    id="edit-opp-close"
                    type="date"
                    disabled={readOnly}
                    value={formData.close_date}
                    onChange={(e) => setFormData({ ...formData, close_date: e.target.value })}
                  />
                </div>
              </div>
              <div className={formDialogGrid}>
                <div className={formDialogField}>
                  <Label htmlFor="edit-opp-owner">Owner</Label>
                  <Input
                    id="edit-opp-owner"
                    disabled={readOnly}
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  />
                </div>
                <div className={formDialogField}>
                  <Label htmlFor="edit-opp-source">Source</Label>
                  <Input
                    id="edit-opp-source"
                    disabled={readOnly}
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  />
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
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
