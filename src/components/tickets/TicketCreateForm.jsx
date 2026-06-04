import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TICKET_PRIORITIES,
  TICKET_CATEGORIES,
  TICKET_DEPARTMENTS,
  TICKET_SOURCES,
  getSuggestedDepartmentForCategory,
} from '@/lib/ticketConstants';

/**
 * Shared new-ticket form — same fields and layout as SupportTickets "New Ticket" dialog.
 */
export default function TicketCreateForm({
  form,
  setForm,
  assigneeOptions = [],
  idPrefix = 'ticket',
}) {
  const field = (name) => `${idPrefix}-${name}`;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={field('title')}>Title *</Label>
        <Input
          id={field('title')}
          name="title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Ticket title"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor={field('description')}>Description</Label>
        <Textarea
          id={field('description')}
          name="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe the issue..."
          rows={4}
          className="mt-1"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor={field('category')}>Category *</Label>
          <Select
            value={form.category || '_none'}
            onValueChange={(v) => {
              const category = v === '_none' ? '' : v;
              const suggested = getSuggestedDepartmentForCategory(category);
              setForm((f) => ({
                ...f,
                category,
                ...(suggested ? { department: suggested } : {}),
              }));
            }}
          >
            <SelectTrigger id={field('category')} name="category" className="mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">Select category</SelectItem>
              {TICKET_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={field('department')}>Department</Label>
          <Select
            value={form.department || '_none'}
            onValueChange={(v) => setForm({ ...form, department: v === '_none' ? '' : v })}
          >
            <SelectTrigger id={field('department')} name="department" className="mt-1">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">—</SelectItem>
              {TICKET_DEPARTMENTS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor={field('priority')}>Priority</Label>
          <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
            <SelectTrigger id={field('priority')} name="priority" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TICKET_PRIORITIES.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={field('source')}>Source</Label>
          <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
            <SelectTrigger id={field('source')} name="source" className="mt-1">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {TICKET_SOURCES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {assigneeOptions.length > 0 && (
        <div>
          <Label htmlFor={field('assigned_to')}>Assignee</Label>
          <Select
            value={form.assigned_to || '_unassigned'}
            onValueChange={(v) => setForm({ ...form, assigned_to: v === '_unassigned' ? '' : v })}
          >
            <SelectTrigger id={field('assigned_to')} name="assigned_to" className="mt-1">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_unassigned">Unassigned</SelectItem>
              {assigneeOptions.map((a) => (
                <SelectItem key={a.value} value={a.value}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor={field('requester')}>Requester</Label>
          <Input
            id={field('requester')}
            name="requester"
            value={form.requester}
            onChange={(e) => setForm({ ...form, requester: e.target.value })}
            placeholder="Name"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor={field('requester_email')}>Requester Email</Label>
          <Input
            id={field('requester_email')}
            name="requester_email"
            type="email"
            value={form.requester_email}
            onChange={(e) => setForm({ ...form, requester_email: e.target.value })}
            placeholder="Requester email"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}
