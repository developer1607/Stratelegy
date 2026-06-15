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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { calendarEventToForm, calendarFormToPayload } from '@/lib/crmHelpers';
import { validateCalendarEventForm, showValidationErrors } from '@/lib/crmFormValidation';
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
  related_to_name: '',
  status: 'scheduled',
};

const selectContentProps = { position: 'popper', className: 'max-h-[min(16rem,50dvh)]' };

export default function EventDialog({ open, onOpenChange, onSubmit, isLoading, event }) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    if (event) {
      setFormData(calendarEventToForm(event));
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [event, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!showValidationErrors(validateCalendarEventForm(formData))) return;
    onSubmit(calendarFormToPayload(formData));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={formDialogContent('md')}>
        <DialogHeader className={formDialogHeader}>
          <DialogTitle>{event ? 'Edit Event' : 'New Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className={formDialogForm}>
          <div className={formDialogBody}>
            <div className={formDialogField}>
              <Label htmlFor="event-title">Title *</Label>
              <Input
                id="event-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className={formDialogField}>
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="event-type">Event Type *</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) => setFormData({ ...formData, event_type: value })}
                >
                  <SelectTrigger id="event-type">
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
              </div>

              <div className={formDialogField}>
                <Label htmlFor="event-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger id="event-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent {...selectContentProps}>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="event-start">Start Date & Time *</Label>
                <Input
                  id="event-start"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div className={formDialogField}>
                <Label htmlFor="event-end">End Date & Time</Label>
                <Input
                  id="event-end"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div className={formDialogField}>
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location or meeting link"
              />
            </div>

            <div className={formDialogGrid}>
              <div className={formDialogField}>
                <Label htmlFor="event-related-type">Related To</Label>
                <Select
                  value={formData.related_to_type || 'none'}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      related_to_type: value === 'none' ? '' : value,
                      related_to_name: '',
                    })
                  }
                >
                  <SelectTrigger id="event-related-type">
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

              {formData.related_to_type && (
                <div className={formDialogField}>
                  <Label htmlFor="event-related-name">Name</Label>
                  <Input
                    id="event-related-name"
                    value={formData.related_to_name}
                    onChange={(e) => setFormData({ ...formData, related_to_name: e.target.value })}
                    placeholder={`Enter ${formData.related_to_type} name`}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className={formDialogFooter}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
