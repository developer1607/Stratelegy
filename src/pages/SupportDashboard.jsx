import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Ticket, Clock, CheckCircle, AlertCircle, PauseCircle, Plus } from 'lucide-react';
import {
  TICKET_STATUSES,
  DEFAULT_TICKET_FORM,
  normalizeTicketPayload,
} from '@/lib/ticketConstants';
import TicketCreateForm from '@/components/tickets/TicketCreateForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';

const STATUS_ICONS = {
  open: AlertCircle,
  in_progress: Clock,
  waiting_on_end_user: PauseCircle,
  waiting_on_vendor: PauseCircle,
  resolved: CheckCircle,
  closed: CheckCircle,
};

const STATUS_COLORS_TILE = {
  open: 'bg-blue-500 hover:bg-blue-600',
  in_progress: 'bg-yellow-500 hover:bg-yellow-600',
  waiting_on_end_user: 'bg-orange-500 hover:bg-orange-600',
  waiting_on_vendor: 'bg-purple-500 hover:bg-purple-600',
  resolved: 'bg-green-500 hover:bg-green-600',
  closed: 'bg-gray-500 hover:bg-gray-600',
};

const STATUS_DESCRIPTIONS = {
  open: 'New tickets awaiting response',
  in_progress: 'Tickets being actively worked on',
  waiting_on_end_user: 'Pending customer response',
  waiting_on_vendor: 'Pending third-party response',
  resolved: 'Completed tickets',
  closed: 'Closed tickets',
};

const STATUS_CONFIG = TICKET_STATUSES.map((s) => ({
  status: s.value,
  label: s.label,
  color: STATUS_COLORS_TILE[s.value] || 'bg-gray-500 hover:bg-gray-600',
  icon: STATUS_ICONS[s.value] || AlertCircle,
  description: STATUS_DESCRIPTIONS[s.value] || '',
}));

export default function SupportDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    ...DEFAULT_TICKET_FORM,
    category: 'report_a_problem',
  });

  const { data: statusCounts = {} } = useQuery({
    queryKey: ['ticket-stats'],
    queryFn: () => api.tickets.stats(),
    staleTime: 30_000,
  });

  const { data: recentTickets = [] } = useQuery({
    queryKey: ['support-recent-tickets'],
    queryFn: () => api.tickets.list({ sort: '-created_date', limit: 5 }),
    staleTime: 30_000,
  });

  const handleSubmitTicket = async () => {
    await api.tickets.create(normalizeTicketPayload(newTicket));
    queryClient.invalidateQueries({ queryKey: ['ticket-stats'] });
    queryClient.invalidateQueries({ queryKey: ['support-recent-tickets'] });
    queryClient.invalidateQueries({ queryKey: ['tickets'] });
    setIsDialogOpen(false);
    setNewTicket({ ...DEFAULT_TICKET_FORM, category: 'report_a_problem' });
  };

  const getStatusCount = (status) => Number(statusCounts[status] || 0);

  const getTotalTickets = () => {
    return Object.entries(statusCounts).reduce((sum, [status, count]) => {
      if (['resolved', 'closed'].includes(status)) return sum;
      return sum + Number(count || 0);
    }, 0);
  };

  const totalTickets = Object.values(statusCounts).reduce((sum, count) => sum + Number(count || 0), 0);

  const handleStatusClick = (status) => {
    navigate(`/SupportTickets?status=${status}`);
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Dashboard</h1>
          <p className="text-gray-600">Overview of all support tickets by status</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Support Ticket</DialogTitle>
              <DialogDescription className="sr-only">
                Create a new support ticket with title, category, and priority.
              </DialogDescription>
            </DialogHeader>
            <TicketCreateForm idPrefix="dashboard-ticket" form={newTicket} setForm={setNewTicket} />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitTicket} disabled={!newTicket.title || !newTicket.category}>
                Submit Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Card */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-[#0D1B2E] to-[#1a2f4a] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm mb-1">Active Tickets</p>
                <p className="text-4xl font-bold">{getTotalTickets()}</p>
              </div>
              <Ticket className="w-16 h-16 text-white/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {STATUS_CONFIG.map((config) => {
          const count = getStatusCount(config.status);
          const Icon = config.icon;
          
          return (
            <Card
              key={config.status}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${config.color}`}
              onClick={() => handleStatusClick(config.status)}
            >
              <CardContent className="p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-8 h-8" />
                  <span className="text-3xl font-bold">{count}</span>
                </div>
                <h3 className="text-lg font-semibold mb-1">{config.label}</h3>
                <p className="text-xs text-white/80">{config.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Distribution</h3>
            <div className="space-y-3">
              {STATUS_CONFIG.map((config) => {
                const count = getStatusCount(config.status);
                const percentage = totalTickets > 0 ? (count / totalTickets) * 100 : 0;
                
                return (
                  <div key={config.status} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                    <span className="text-sm text-gray-600 flex-1">{config.label}</span>
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${config.color}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/SupportTicketDetail?id=${ticket.id}`)}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{ticket.title}</p>
                    <p className="text-xs text-gray-500">#{ticket.ticket_number}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                    ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
                    ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              ))}
              {recentTickets.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No tickets yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}