import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/api/client';
import { showError } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Send, Lock, Trash2, Save } from 'lucide-react';
import PermissionGate from '@/components/PermissionGate';
import { usePermissions } from '@/hooks/usePermissions';
import {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_CATEGORIES,
  TICKET_DEPARTMENTS,
  TICKET_SOURCES,
  STATUS_COLORS,
  PRIORITY_COLORS,
  formatTicketLabel,
  getTicketAssignee,
  normalizeTicketPayload,
  getSuggestedDepartmentForCategory,
  buildAssigneeSelectOptions,
} from '@/lib/ticketConstants';

function FieldRow({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

const CLOSED_STATUSES = new Set(['resolved', 'closed']);

export default function SupportTicketDetail() {
  const [searchParams] = useSearchParams();
  const ticketId = searchParams.get('id');
  const queryClient = useQueryClient();
  const { canTicketAction } = usePermissions();
  const canEdit = canTicketAction('edit');
  const canAssign = canTicketAction('assign');
  const canClose = canTicketAction('close');
  const canUseInternalNotes = canEdit || canAssign;
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    api.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => api.entities.Ticket.get(ticketId),
    enabled: !!ticketId,
  });

  const { data: assignees = [] } = useQuery({
    queryKey: ['ticket-assignees', editForm?.department, editForm?.category],
    queryFn: () =>
      api.tickets.listAssignees({
        department: editForm?.department || undefined,
        category: editForm?.category || undefined,
      }),
    enabled: !!ticketId && !!editForm,
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['ticket-comments', ticketId],
    queryFn: () => api.entities.TicketComment.filter({ ticket_id: ticketId }, 'created_date'),
    enabled: !!ticketId,
  });

  useEffect(() => {
    if (!ticket) return;
    setEditForm({
      title: ticket.title || '',
      description: ticket.description || '',
      status: ticket.status || 'open',
      priority: ticket.priority || 'medium',
      category: ticket.category || '',
      department: ticket.department || '',
      source: ticket.source || '',
      assigned_to: getTicketAssignee(ticket),
      requester: ticket.requester || '',
      requester_email: ticket.requester_email || '',
    });
    setDirty(false);
  }, [ticket?.id, ticket?.updated_date]);

  const updateTicket = useMutation({
    mutationFn: (data) => api.entities.Ticket.update(ticketId, normalizeTicketPayload(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setDirty(false);
    },
    onError: (err) => showError(err, 'Failed to update ticket'),
  });

  const deleteTicket = useMutation({
    mutationFn: () => api.entities.Ticket.delete(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      window.location.href = '/SupportTickets';
    },
    onError: (err) => showError(err, 'Failed to delete ticket'),
  });

  const addComment = useMutation({
    mutationFn: (data) => api.entities.TicketComment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', ticketId] });
      setMessage('');
    },
    onError: (err) => showError(err, 'Failed to add comment'),
  });

  const patchField = (key, value) => {
    setEditForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const patchCategory = (value) => {
    const category = value === '_none' ? '' : value;
    const suggested = getSuggestedDepartmentForCategory(category);
    setEditForm((f) => ({
      ...f,
      category,
      ...(suggested ? { department: suggested } : {}),
    }));
    setDirty(true);
  };

  const handleSave = () => {
    if (!editForm) return;
    updateTicket.mutate(editForm);
  };

  const handleSendComment = () => {
    if (!message.trim()) return;
    addComment.mutate({
      ticket_id: ticketId,
      message: message.trim(),
      is_internal: isInternal,
      author: currentUser?.full_name || currentUser?.email || 'Agent',
      author_email: currentUser?.email || '',
    });
  };

  const assigneeOptions = useMemo(
    () => buildAssigneeSelectOptions(assignees, editForm?.assigned_to || ''),
    [assignees, editForm?.assigned_to]
  );

  if (!ticketId) {
    return (
      <div className="p-6 text-muted-foreground">
        No ticket selected. <Link to="/SupportTickets" className="text-primary underline">Back to tickets</Link>
      </div>
    );
  }

  if (isLoading || !ticket || !editForm) {
    return (
      <div className="p-6 flex justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <Link to="/SupportTickets" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Tickets
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ticket #{ticket.ticket_number || '—'}</p>
                  <CardTitle className="text-xl">{editForm.title}</CardTitle>
                  <div className="flex gap-2 flex-wrap mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[editForm.status] || 'bg-gray-100 text-gray-600'}`}>
                      {formatTicketLabel(editForm.status)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[editForm.priority] || 'bg-gray-100 text-gray-600'}`}>
                      {editForm.priority}
                    </span>
                    {editForm.category && (
                      <Badge variant="outline" className="text-xs capitalize">{formatTicketLabel(editForm.category)}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {dirty && canEdit && (
                    <Button size="sm" onClick={handleSave} disabled={updateTicket.isPending}>
                      <Save className="w-4 h-4 mr-1" />
                      {updateTicket.isPending ? 'Saving...' : 'Save changes'}
                    </Button>
                  )}
                  <PermissionGate ticketAction="delete">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this ticket?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This permanently removes the ticket and cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deleteTicket.mutate()}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </PermissionGate>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldRow label="Title">
                <Input
                  value={editForm.title}
                  onChange={(e) => patchField('title', e.target.value)}
                  disabled={!canEdit}
                />
              </FieldRow>
              <FieldRow label="Description">
                <Textarea
                  value={editForm.description}
                  onChange={(e) => patchField('description', e.target.value)}
                  rows={5}
                  placeholder="Ticket description..."
                  disabled={!canEdit}
                />
              </FieldRow>
              <div className="text-xs text-muted-foreground flex flex-wrap gap-4 pt-2 border-t">
                {ticket.created_date && (
                  <span>Created: {new Date(ticket.created_date).toLocaleString()}</span>
                )}
                {ticket.updated_date && (
                  <span>Updated: {new Date(ticket.updated_date).toLocaleString()}</span>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h2 className="font-semibold text-foreground">Conversation</h2>
            {comments.length === 0 && <p className="text-muted-foreground text-sm">No messages yet.</p>}
            {comments.map((c) => (
              <div
                key={c.id}
                className={`rounded-xl p-4 border ${c.is_internal ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-border'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{c.author || c.author_email || 'Agent'}</span>
                  <div className="flex items-center gap-2">
                    {c.is_internal && (
                      <span className="text-xs text-yellow-600 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Internal
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {c.created_date ? new Date(c.created_date).toLocaleString() : ''}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{c.message}</p>
              </div>
            ))}
          </div>

          <PermissionGate ticketAction="comment">
            <Card>
              <CardContent className="p-4">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a reply..."
                  rows={3}
                  className="mb-3"
                />
                <div className="flex items-center justify-between">
                  {canUseInternalNotes ? (
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded"
                      />
                      <Lock className="w-3 h-3" /> Internal note (not visible to customer)
                    </label>
                  ) : (
                    <span />
                  )}
                  <Button onClick={handleSendComment} disabled={!message.trim() || addComment.isPending}>
                    <Send className="w-4 h-4 mr-2" /> Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </PermissionGate>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Ticket details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FieldRow label="Status">
                <Select
                  value={editForm.status}
                  onValueChange={(v) => patchField('status', v)}
                  disabled={!canEdit && !canClose}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TICKET_STATUSES.filter(
                      (s) => !CLOSED_STATUSES.has(s.value) || canClose
                    ).map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>

              <FieldRow label="Priority">
                <Select
                  value={editForm.priority}
                  onValueChange={(v) => patchField('priority', v)}
                  disabled={!canEdit}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TICKET_PRIORITIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>

              <FieldRow label="Category">
                <Select
                  value={editForm.category || '_none'}
                  onValueChange={patchCategory}
                  disabled={!canEdit}
                >
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {TICKET_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>

              <FieldRow label="Department">
                <Select
                  value={editForm.department || '_none'}
                  onValueChange={(v) => patchField('department', v === '_none' ? '' : v)}
                  disabled={!canEdit}
                >
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {TICKET_DEPARTMENTS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>

              <FieldRow label="Source">
                <Select
                  value={editForm.source || '_none'}
                  onValueChange={(v) => patchField('source', v === '_none' ? '' : v)}
                  disabled={!canEdit}
                >
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">—</SelectItem>
                    {TICKET_SOURCES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>

              <FieldRow label="Assignee">
                <Select
                  value={editForm.assigned_to || '_unassigned'}
                  onValueChange={(v) => patchField('assigned_to', v === '_unassigned' ? '' : v)}
                  disabled={!canAssign}
                >
                  <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_unassigned">Unassigned</SelectItem>
                    {assigneeOptions.map((a) => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldRow>

              <FieldRow label="Requester name">
                <Input
                  value={editForm.requester}
                  onChange={(e) => patchField('requester', e.target.value)}
                  placeholder="Customer name"
                  disabled={!canEdit}
                />
              </FieldRow>

              <FieldRow label="Requester email">
                <Input
                  type="email"
                  value={editForm.requester_email}
                  onChange={(e) => patchField('requester_email', e.target.value)}
                  placeholder="customer@example.com"
                  disabled={!canEdit}
                />
              </FieldRow>

              {dirty && (canEdit || canAssign || canClose) && (
                <Button className="w-full" onClick={handleSave} disabled={updateTicket.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {updateTicket.isPending ? 'Saving...' : 'Save all changes'}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
