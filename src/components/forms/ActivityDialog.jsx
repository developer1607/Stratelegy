import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { validateActivityForm } from '@/lib/crmFormValidation';
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
  type: 'Call',
  description: '',
  date: '',
  related_to_type: '',
  related_to_id: '',
  related_to_name: '',
};

const selectContentProps = { position: 'popper', className: 'max-h-[min(16rem,50dvh)]' };

function toPayload(formData) {
  return {
    ...formData,
    related_to_type: formData.related_to_type || undefined,
    related_to_id: formData.related_to_id || undefined,
    related_to_name: formData.related_to_name || undefined,
  };
}

export default function ActivityDialog({ open, onOpenChange, onSubmit, isLoading, defaultType }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const validate = useCallback((data) => validateActivityForm(toPayload(data)), []);
  const validation = useCrmFormValidation(validate);
  const { resetValidation, validateSubmit, revalidate } = validation;

  useEffect(() => {
    if (!open) return;
    setFormData({
      ...EMPTY_FORM,
      type: defaultType || 'Call',
      date: new Date().toISOString().slice(0, 16),
    });
    resetValidation();
  }, [open, defaultType, resetValidation]);

  const { data: relatedEntities = [] } = useQuery({
    queryKey: ['crm-related-entities', formData.related_to_type],
    queryFn: () => api.entities[formData.related_to_type].list('name'),
    enabled: open && Boolean(formData.related_to_type),
    staleTime: 60_000,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = toPayload(formData);
    if (!validateSubmit(payload)) return;
    onSubmit(payload);
  };

  const handleRelatedEntityChange = (entityId) => {
    const entity = relatedEntities.find((item) => item.id === entityId);
    const newData = {
      ...formData,
      related_to_id: entity?.id || '',
      related_to_name: entity?.name || '',
    };
    setFormData(newData);
    revalidate(toPayload(newData), 'related_to_name');
  };

  const handleRelatedTypeChange = (value) => {
    const newData = {
      ...formData,
      related_to_type: value === 'none' ? '' : value,
      related_to_id: '',
      related_to_name: '',
    };
    setFormData(newData);
    revalidate(toPayload(newData), 'related_to_type');
  };

  const handleRelatedClear = () => {
    const newData = { ...formData, related_to_id: '', related_to_name: '' };
    setFormData(newData);
    revalidate(toPayload(newData), 'related_to_name');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={formDialogContent('md')}>
        <DialogHeader className={formDialogHeader}>
          <DialogTitle>Log Activity</DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={handleSubmit} className={formDialogForm}>
          <div className={formDialogBody}>
            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="activity-type">Activity Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => validation.updateField('type', value, formData, setFormData)}
                >
                  <SelectTrigger id="activity-type" className={validation.inputClassName('type')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent {...selectContentProps}>
                    <SelectItem value="Call">Call</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Meeting">Meeting</SelectItem>
                    <SelectItem value="Task">Task</SelectItem>
                    <SelectItem value="Note">Note</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError message={validation.fieldError('type')} />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="activity-date">Date & Time *</Label>
                <Input
                  id="activity-date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => validation.updateField('date', e.target.value, formData, setFormData)}
                  onBlur={() => validation.touchField('date', formData)}
                  className={validation.inputClassName('date')}
                  aria-invalid={Boolean(validation.fieldError('date'))}
                />
                <FieldError message={validation.fieldError('date')} />
              </div>
            </div>

            <div className={formDialogField}>
              <Label htmlFor="activity-description">Description *</Label>
              <Textarea
                id="activity-description"
                placeholder="Enter activity details..."
                value={formData.description}
                onChange={(e) => validation.updateField('description', e.target.value, formData, setFormData)}
                onBlur={() => validation.touchField('description', formData)}
                className={validation.inputClassName('description')}
                aria-invalid={Boolean(validation.fieldError('description'))}
                rows={4}
              />
              <FieldError message={validation.fieldError('description')} />
            </div>

            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="activity-related-type">Related To (Type)</Label>
                <Select value={formData.related_to_type || 'none'} onValueChange={handleRelatedTypeChange}>
                  <SelectTrigger id="activity-related-type" className={validation.inputClassName('related_to_type')}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent {...selectContentProps}>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="Contact">Contact</SelectItem>
                    <SelectItem value="Account">Account</SelectItem>
                    <SelectItem value="Opportunity">Opportunity</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError message={validation.fieldError('related_to_type')} />
              </div>
              <div className={formDialogField}>
                <Label htmlFor="activity-related-record">
                  Related To (Record){formData.related_to_type ? ' *' : ''}
                </Label>
                {formData.related_to_type ? (
                  <Select
                    value={formData.related_to_id || 'none'}
                    onValueChange={(value) =>
                      value === 'none' ? handleRelatedClear() : handleRelatedEntityChange(value)
                    }
                  >
                    <SelectTrigger
                      id="activity-related-record"
                      className={validation.inputClassName('related_to_name')}
                    >
                      <SelectValue placeholder={`Select ${formData.related_to_type}`} />
                    </SelectTrigger>
                    <SelectContent {...selectContentProps}>
                      <SelectItem value="none">None</SelectItem>
                      {relatedEntities.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input id="activity-related-record" placeholder="Select a type first" disabled />
                )}
                <FieldError message={validation.fieldError('related_to_name')} />
              </div>
            </div>
          </div>

          <DialogFooter className={formDialogFooter}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Log Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
