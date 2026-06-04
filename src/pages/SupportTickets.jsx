import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '@/api/client';
import { showError } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Search, MessageSquare } from 'lucide-react';
import PermissionGate from '@/components/PermissionGate';
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
  DEFAULT_TICKET_FORM,
  getSuggestedDepartmentForCategory,
  buildAssigneeSelectOptions,
} from '@/lib/ticketConstants';

export default function SupportTickets() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || 'all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState('all');
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_TICKET_FORM });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    api.auth
      .me()
      .then(setCurrentUser)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) setFilterStatus(status);
  }, [searchParams]);

  const handleStatusFilter = (value) => {
    setFilterStatus(value);
    if (value === 'all') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', value);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const { data: tickets = [] } = useQuery({
    queryKey: ['tickets'],
    queryFn: () => api.entities.Ticket.list('-created_date'),
  });

  const { data: assignees = [] } = useQuery({
    queryKey: ['ticket-assignees', form.department, form.category],
    queryFn: () =>
      api.tickets.listAssignees({
        department: form.department || undefined,
        category: form.category || undefined,
      }),
    enabled: showDialog,
  });

  const assigneeOptions = useMemo(
    () => buildAssigneeSelectOptions(assignees, form.assigned_to),
    [assignees, form.assigned_to]
  );

  const createMutation = useMutation({
    /** @param {Record<string, unknown>} data */
    mutationFn: async (data) => {
      if (!currentUser) throw new Error('Please log in to create tickets');
      const payload = normalizeTicketPayload({
        ...data,
        requester: data.requester || currentUser.full_name || currentUser.email,
        requester_email: data.requester_email || currentUser.email,
      });
      return api.entities.Ticket.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      setShowDialog(false);
      setForm({ ...DEFAULT_TICKET_FORM });
    },
    onError: (error) => {
      console.error('Failed to create ticket:', error);
      showError(error, 'Failed to create ticket');
    },
  });

  const assigneeFilterOptions = useMemo(() => {
    const set = new Set();
    for (const t of tickets) {
      const name = getTicketAssignee(t);
      if (name && name !== '—' && name !== '-') set.add(name);
    }
    return [...set].sort();
  }, [tickets]);

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    const assignee = getTicketAssignee(t);
    const matchSearch =
      !q ||
      t.title?.toLowerCase().includes(q) ||
      t.requester?.toLowerCase().includes(q) ||
      t.requester_email?.toLowerCase().includes(q) ||
      String(t.ticket_number || '').includes(q) ||
      assignee.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
    const matchCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchDepartment = filterDepartment === 'all' || t.department === filterDepartment;
    const matchAssignee = filterAssignee === 'all' || assignee === filterAssignee;
    const matchUnassigned = !unassignedOnly || !t.assigned_to;
    return (
      matchSearch &&
      matchStatus &&
      matchPriority &&
      matchCategory &&
      matchDepartment &&
      matchAssignee &&
      matchUnassigned
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tickets</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} of {tickets.length} tickets
          </p>
        </div>
        <PermissionGate ticketAction="create">
          <Button onClick={() => setShowDialog(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> New Ticket
          </Button>
        </PermissionGate>
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search title, requester, #, assignee..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {TICKET_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {TICKET_PRIORITIES.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {TICKET_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {TICKET_DEPARTMENTS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterAssignee} onValueChange={setFilterAssignee}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {assigneeFilterOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant={unassignedOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setUnassignedOnly((v) => !v)}
        >
          Unassigned only
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Ticket #</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Title</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Requester</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Priority</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Category</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Department</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Source</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Assignee</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ticket, i) => (
              <tr
                key={ticket.id}
                className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  #{ticket.ticket_number || '—'}
                </td>
                <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">
                  {ticket.title}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div className="truncate max-w-[140px]">{ticket.requester || '—'}</div>
                  {ticket.requester_email && (
                    <div className="text-xs truncate max-w-[140px]">{ticket.requester_email}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_COLORS[ticket.status] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {formatTicketLabel(ticket.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[ticket.priority] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {ticket.priority}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatTicketLabel(ticket.category)}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {formatTicketLabel(ticket.department)}
                </td>
                <td className="px-4 py-3 text-muted-foreground capitalize">
                  {ticket.source || '—'}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {getTicketAssignee(ticket) || 'Unassigned'}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                  {ticket.created_date ? new Date(ticket.created_date).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <Link to={`/SupportTicketDetail?id=${ticket.id}`}>
                    <Button variant="ghost" size="icon" title="View ticket">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">
                  No tickets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ticket title"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the issue..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Category *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => {
                    const suggested = getSuggestedDepartmentForCategory(v);
                    setForm((f) => ({
                      ...f,
                      category: v,
                      ...(suggested ? { department: suggested } : {}),
                    }));
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Select
                  value={form.department || '_none'}
                  onValueChange={(v) => setForm({ ...form, department: v === '_none' ? '' : v })}
                >
                  <SelectTrigger className="mt-1">
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
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v })}
                >
                  <SelectTrigger className="mt-1">
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
                <Label>Source</Label>
                <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                  <SelectTrigger className="mt-1">
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
            <div>
              <Label>Assignee</Label>
              <Select
                value={form.assigned_to || '_unassigned'}
                onValueChange={(v) =>
                  setForm({ ...form, assigned_to: v === '_unassigned' ? '' : v })
                }
              >
                <SelectTrigger className="mt-1">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Requester</Label>
                <Input
                  value={form.requester}
                  onChange={(e) => setForm({ ...form, requester: e.target.value })}
                  placeholder="Name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Requester Email</Label>
                <Input
                  type="email"
                  value={form.requester_email}
                  onChange={(e) => setForm({ ...form, requester_email: e.target.value })}
                  placeholder="Requester email"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.title || !form.category || createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
