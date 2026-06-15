import React, { useState, useEffect } from 'react';
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
import { validateActivityForm, showValidationErrors } from '@/lib/crmFormValidation';
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

export default function ActivityDialog({ open, onOpenChange, onSubmit, isLoading, defaultType }) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    setFormData({
      ...EMPTY_FORM,
      type: defaultType || 'Call',
      date: new Date().toISOString().slice(0, 16),
    });
  }, [open, defaultType]);

  const { data: relatedEntities = [] } = useQuery({
    queryKey: ['crm-related-entities', formData.related_to_type],
    queryFn: () => api.entities[formData.related_to_type].list('name'),
    enabled: open && Boolean(formData.related_to_type),
    staleTime: 60_000,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      related_to_type: formData.related_to_type || undefined,
      related_to_id: formData.related_to_id || undefined,
      related_to_name: formData.related_to_name || undefined,
    };
    if (!showValidationErrors(validateActivityForm(payload))) return;
    onSubmit(payload);
  };

  const handleRelatedEntityChange = (entityId) => {
    const entity = relatedEntities.find((item) => item.id === entityId);
    setFormData({
      ...formData,
      related_to_id: entity?.id || '',
      related_to_name: entity?.name || '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={formDialogContent('md')}>
        <DialogHeader className={formDialogHeader}>
          <DialogTitle>Log Activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className={formDialogForm}>
          <div className={formDialogBody}>
            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="activity-type">Activity Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger id="activity-type">
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
              </div>
              <div className={formDialogField}>
                <Label htmlFor="activity-date">Date & Time *</Label>
                <Input
                  id="activity-date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className={formDialogField}>
              <Label htmlFor="activity-description">Description *</Label>
              <Textarea
                id="activity-description"
                placeholder="Enter activity details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="activity-related-type">Related To (Type)</Label>
                <Select
                  value={formData.related_to_type || 'none'}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      related_to_type: value === 'none' ? '' : value,
                      related_to_id: '',
                      related_to_name: '',
                    })
                  }
                >
                  <SelectTrigger id="activity-related-type">
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
              </div>
              <div className={formDialogField}>
                <Label htmlFor="activity-related-record">Related To (Record)</Label>
                {formData.related_to_type ? (
                  <Select
                    value={formData.related_to_id || 'none'}
                    onValueChange={(value) =>
                      value === 'none'
                        ? setFormData({ ...formData, related_to_id: '', related_to_name: '' })
                        : handleRelatedEntityChange(value)
                    }
                  >
                    <SelectTrigger id="activity-related-record">
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
              </div>
            </div>
          </div>

          <DialogFooter className={formDialogFooter}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
