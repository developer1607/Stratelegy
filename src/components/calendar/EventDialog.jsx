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
import { calendarEventToForm, calendarFormToPayload, nowDatetimeLocalMin, datetimeMinForEnd } from '@/lib/crmHelpers';
import { validateCalendarEventForm } from '@/lib/crmFormValidation';
import { useCrmFormValidation } from '@/lib/useCrmFormValidation';
import FieldError from '@/components/forms/FieldError';
import { usePermissions } from '@/hooks/usePermissions';
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
  title: '',
  description: '',
  event_type: 'meeting',
  start_date: '',
  end_date: '',
  location: '',
  related_to_type: '',
  related_to_id: '',
  related_to_name: '',
  status: 'scheduled',
};

const selectContentProps = { position: 'popper', className: 'max-h-[min(16rem,50dvh)]' };

export default function EventDialog({ open, onOpenChange, onSubmit, isLoading, event }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [originalForm, setOriginalForm] = useState(null);
  const validate = useCallback(
    (data) => validateCalendarEventForm(data, { original: originalForm }),
    [originalForm]
  );
  const validation = useCrmFormValidation(validate);
  const { resetValidation, validateSubmit, revalidate } = validation;
  const { canReadEntity, isLoading: permsLoading } = usePermissions();

  useEffect(() => {
    if (!open) return;
    const loaded = event ? calendarEventToForm(event) : { ...EMPTY_FORM };
    setFormData(loaded);
    setOriginalForm(loaded);
    resetValidation();
  }, [event, open, resetValidation]);

  const { data: relatedEntities = [] } = useQuery({
    queryKey: ['crm-related-entities', formData.related_to_type],
    queryFn: () => api.entities[formData.related_to_type].list('name'),
    enabled:
      open &&
      !permsLoading &&
      Boolean(formData.related_to_type) &&
      canReadEntity(formData.related_to_type),
    staleTime: 60_000,
  });

  const isScheduled = formData.status === 'scheduled';
  const startMin = isScheduled ? nowDatetimeLocalMin() : undefined;
  const endMin = isScheduled ? datetimeMinForEnd(formData.start_date) : undefined;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateSubmit(formData)) return;
    onSubmit(calendarFormToPayload(formData));
  };

  const handleRelatedEntityChange = (entityId) => {
    const entity = relatedEntities.find((item) => item.id === entityId);
    const newData = {
      ...formData,
      related_to_id: entity?.id || '',
      related_to_name: entity?.name || '',
    };
    setFormData(newData);
    revalidate(newData, 'related_to_name');
  };

  const handleRelatedTypeChange = (value) => {
    const newData = {
      ...formData,
      related_to_type: value === 'none' ? '' : value,
      related_to_id: '',
      related_to_name: '',
    };
    setFormData(newData);
    revalidate(newData, 'related_to_type');
  };

  const handleRelatedClear = () => {
    const newData = { ...formData, related_to_id: '', related_to_name: '' };
    setFormData(newData);
    revalidate(newData, 'related_to_name');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={formDialogContent('md')}>
        <DialogHeader className={formDialogHeader}>
          <DialogTitle>{event ? 'Edit Event' : 'New Event'}</DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={handleSubmit} className={formDialogForm}>
          <div className={formDialogBody}>
            <div className={formDialogField}>
              <Label htmlFor="event-title">Title *</Label>
              <Input
                id="event-title"
                value={formData.title}
                onChange={(e) => validation.updateField('title', e.target.value, formData, setFormData)}
                onBlur={() => validation.touchField('title', formData)}
                className={validation.inputClassName('title')}
                aria-invalid={Boolean(validation.fieldError('title'))}
              />
              <FieldError message={validation.fieldError('title')} />
            </div>

            <div className={formDialogField}>
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={formData.description}
                onChange={(e) => validation.updateField('description', e.target.value, formData, setFormData)}
                onBlur={() => validation.touchField('description', formData)}
                className={validation.inputClassName('description')}
                rows={3}
              />
              <FieldError message={validation.fieldError('description')} />
            </div>

            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="event-type">Event Type *</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) => validation.updateField('event_type', value, formData, setFormData)}
                >
                  <SelectTrigger id="event-type" className={validation.inputClassName('event_type')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent {...selectContentProps}>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="demo">Demo</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError message={validation.fieldError('event_type')} />
              </div>

              <div className={formDialogField}>
                <Label htmlFor="event-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => {
                    const newData = { ...formData, status: value };
                    setFormData(newData);
                    revalidate(newData, ['status', 'start_date', 'end_date']);
                  }}
                >
                  <SelectTrigger id="event-status" className={validation.inputClassName('status')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent {...selectContentProps}>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError message={validation.fieldError('status')} />
              </div>
            </div>

            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="event-start">Start Date & Time *</Label>
                <Input
                  id="event-start"
                  type="datetime-local"
                  value={formData.start_date}
                  min={startMin}
                  onChange={(e) =>
                    validation.updateField('start_date', e.target.value, formData, setFormData, ['end_date'])
                  }
                  onBlur={() => validation.touchField('start_date', formData, ['end_date'])}
                  className={validation.inputClassName('start_date')}
                  aria-invalid={Boolean(validation.fieldError('start_date'))}
                />
                <FieldError message={validation.fieldError('start_date')} />
              </div>

              <div className={formDialogField}>
                <Label htmlFor="event-end">End Date & Time</Label>
                <Input
                  id="event-end"
                  type="datetime-local"
                  value={formData.end_date}
                  min={endMin}
                  onChange={(e) =>
                    validation.updateField('end_date', e.target.value, formData, setFormData, ['start_date'])
                  }
                  onBlur={() => validation.touchField('end_date', formData, ['start_date'])}
                  className={validation.inputClassName('end_date')}
                  aria-invalid={Boolean(validation.fieldError('end_date'))}
                />
                <FieldError message={validation.fieldError('end_date')} />
              </div>
            </div>

            <div className={formDialogField}>
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                value={formData.location}
                onChange={(e) => validation.updateField('location', e.target.value, formData, setFormData)}
                onBlur={() => validation.touchField('location', formData)}
                className={validation.inputClassName('location')}
                placeholder="Enter location or meeting link"
              />
              <FieldError message={validation.fieldError('location')} />
            </div>

            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="event-related-type">Related To</Label>
                <Select
                  value={formData.related_to_type || 'none'}
                  onValueChange={handleRelatedTypeChange}
                >
                  <SelectTrigger id="event-related-type" className={validation.inputClassName('related_to_type')}>
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

              {formData.related_to_type && (
                <div className={formDialogField}>
                  <Label htmlFor="event-related-record">
                    Related To (Record) *
                  </Label>
                  <Select
                    value={formData.related_to_id || 'none'}
                    onValueChange={(value) =>
                      value === 'none' ? handleRelatedClear() : handleRelatedEntityChange(value)
                    }
                  >
                    <SelectTrigger
                      id="event-related-record"
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
                  <FieldError message={validation.fieldError('related_to_name')} />
                  {formData.related_to_id && formData.related_to_name && (
                    <p className="text-xs text-gray-500">
                      Linked to {formData.related_to_type}: {formData.related_to_name}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className={formDialogFooter}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
