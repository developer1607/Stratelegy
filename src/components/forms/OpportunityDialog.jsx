import React, { useState } from 'react';
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

export default function OpportunityDialog({ open, onOpenChange, onSubmit, isLoading }) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!showValidationErrors(validateOpportunityForm(formData))) return;

    onSubmit({
      ...formData,
      amount: formData.amount ? parseFloat(formData.amount) : undefined,
      probability: formData.probability ? parseFloat(formData.probability) : undefined,
    });
    setFormData({
      name: '',
      account_name: '',
      amount: '',
      stage: 'prospecting',
      probability: '',
      close_date: '',
      owner: '',
      source: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={formDialogContent('sm')}>
        <DialogHeader className={formDialogHeader}>
          <DialogTitle>Create Opportunity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className={formDialogForm}>
          <div className={formDialogBody}>
            <div className="space-y-4">
              <div className={formDialogField}>
                <Label htmlFor="opp-name">Name *</Label>
                <Input
                  id="opp-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="opp-account">Account</Label>
                <Input
                  id="opp-account"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                />
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
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className={formDialogField}>
                  <Label htmlFor="opp-stage">Stage</Label>
                  <Select
                    value={formData.stage}
                    onValueChange={(stage) => setFormData({ ...formData, stage })}
                  >
                    <SelectTrigger id="opp-stage">
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
                  <Label htmlFor="opp-probability">Probability (%)</Label>
                  <Input
                    id="opp-probability"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability}
                    onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
                  />
                </div>
                <div className={formDialogField}>
                  <Label htmlFor="opp-close">Close date</Label>
                  <Input
                    id="opp-close"
                    type="date"
                    value={formData.close_date}
                    onChange={(e) => setFormData({ ...formData, close_date: e.target.value })}
                  />
                </div>
              </div>
              <div className={formDialogGrid}>
                <div className={formDialogField}>
                  <Label htmlFor="opp-owner">Owner</Label>
                  <Input
                    id="opp-owner"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  />
                </div>
                <div className={formDialogField}>
                  <Label htmlFor="opp-source">Source</Label>
                  <Input
                    id="opp-source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className={formDialogFooter}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
