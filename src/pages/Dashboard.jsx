import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Search, MoreHorizontal, Plus, Download, ChevronDown } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { formatCurrency, createPageUrl } from '@/utils';
import { recentMonthLabels, safeParseDate } from '@/lib/crmHelpers';
import { showError, showSuccess } from '@/lib/toast';
import PermissionGate from '@/components/PermissionGate';
import { usePermissions } from '@/hooks/usePermissions';
import { useCrmConfig } from '@/hooks/useCrmConfig';
import LeadDialog from '@/components/forms/LeadDialog';
import ContactDialog from '@/components/forms/ContactDialog';
import OpportunityDialog from '@/components/forms/OpportunityDialog';
import EditOpportunityDialog from '@/components/forms/EditOpportunityDialog';
import ActivityDialog from '@/components/forms/ActivityDialog';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const PIPELINE_STAGE_COLORS = {
  Prospecting: 'bg-blue-500',
  Qualification: 'bg-cyan-500',
  Proposal: 'bg-yellow-500',
  Negotiation: 'bg-orange-500',
  Won: 'bg-green-500',
};

function percentChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function formatDelta(value) {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

function countInMonth(rows, dateField, monthKey) {
  return rows.filter((row) => {
    const date = safeParseDate(row[dateField]);
    return date && format(date, 'yyyy-MM') === monthKey;
  }).length;
}

function sumWonRevenueInMonth(opportunities, monthKey) {
  return opportunities
    .filter((o) => {
      if (o.stage !== 'closed_won') return false;
      const closeDate = safeParseDate(o.close_date) || safeParseDate(o.updated_date);
      return closeDate && format(closeDate, 'yyyy-MM') === monthKey;
    })
    .reduce((sum, o) => sum + (o.amount || 0), 0);
}

function MiniSparkline({ data, type = 'line', color = '#10b981' }) {
  if (!data.length) return <div className="mt-2 h-8" />;
  return (
    <div className="mt-2 h-8">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'area' ? (
          <AreaChart data={data}>
            <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.3} />
          </AreaChart>
        ) : (
          <LineChart data={data}>
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function MiniBars({ data, barClass = 'bg-cyan-400' }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="mt-2 h-8 flex items-end gap-1">
      {data.map((item, index) => (
        <div
          key={index}
          className={`flex-1 rounded-sm ${barClass}`}
          style={{ height: `${Math.max(item.value > 0 ? 12 : 4, (item.value / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function formatStageLabel(stage) {
  if (!stage) return '—';
  if (stage === 'closed_won') return 'Won';
  if (stage === 'closed_lost') return 'Lost';
  return stage.replace(/_/g, ' ');
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { canWriteEntity, canReadEntity, isLoading: permsLoading } = usePermissions();
  const canManageOpportunities = canWriteEntity('Opportunity');
  const canReadLeads = canReadEntity('Lead');
  const canReadOpportunities = canReadEntity('Opportunity');
  const canReadActivities = canReadEntity('Activity');
  const canReadCalendar = canReadEntity('CalendarEvent');
  const canReadCrmConfig = canReadEntity('DefaultSettings');
  const queriesEnabled = !permsLoading;
  const { defaults } = useCrmConfig({ enabled: queriesEnabled && canReadCrmConfig });
  const currency = defaults.currency;
  const queryClient = useQueryClient();
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDialog, setActiveDialog] = useState(null);
  const [editOpportunityOpen, setEditOpportunityOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  const { data: leads = [] } = useQuery({
    queryKey: ['leads', 'dashboard'],
    queryFn: () => api.entities.Lead.list('-created_date'),
    staleTime: 60_000,
    enabled: queriesEnabled && canReadLeads,
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ['opportunities', 'dashboard'],
    queryFn: () => api.entities.Opportunity.list('-created_date'),
    staleTime: 60_000,
    enabled: queriesEnabled && canReadOpportunities,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', 'dashboard'],
    queryFn: () => api.entities.Activity.list('-date', 100),
    staleTime: 60_000,
    enabled: queriesEnabled && canReadActivities,
  });

  const { data: calendarEvents = [] } = useQuery({
    queryKey: ['calendarEvents', 'dashboard'],
    queryFn: () => api.entities.CalendarEvent.list('start_date', 100),
    staleTime: 60_000,
    enabled: queriesEnabled && canReadCalendar,
  });

  const { data: defaultSettings } = useQuery({
    queryKey: ['defaultSettings'],
    queryFn: async () => {
      const settings = await api.entities.DefaultSettings.list();
      return settings[0] || null;
    },
    staleTime: 60_000,
    enabled: queriesEnabled && canReadCrmConfig,
  });

  const ownerOptions = useMemo(() => {
    const owners = new Set();
    opportunities.forEach((opp) => {
      if (opp.owner?.trim()) owners.add(opp.owner.trim());
    });
    return [...owners].sort((a, b) => a.localeCompare(b));
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return opportunities.filter((opp) => {
      if (ownerFilter !== 'all' && opp.owner !== ownerFilter) return false;
      if (stageFilter !== 'all' && opp.stage !== stageFilter) return false;
      if (sourceFilter !== 'all' && opp.source !== sourceFilter) return false;
      if (!query) return true;
      return [opp.name, opp.account_name, opp.owner, opp.stage, opp.source]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [opportunities, ownerFilter, stageFilter, sourceFilter, searchTerm]);

  const monthBuckets = useMemo(() => recentMonthLabels(6), []);

  const dashboardTrends = useMemo(() => {
    const leadTrend = monthBuckets.map(({ key, label }) => ({
      label,
      value: countInMonth(leads, 'created_date', key),
    }));
    const dealsClosedTrend = monthBuckets.map(({ key, label }) => ({
      label,
      value: sumWonRevenueInMonth(opportunities, key),
    }));
    const revenueTrend = dealsClosedTrend;
    const targetTrend = monthBuckets.map(({ key, label }) => {
      const won = sumWonRevenueInMonth(opportunities, key);
      const target = Number(defaultSettings?.monthly_sales_target) || 0;
      return { label, value: target > 0 ? Math.round((won / target) * 100) : won };
    });
    const conversionTrend = monthBuckets.map(({ key, label }) => {
      const monthLeads = leads.filter((lead) => {
        const date = safeParseDate(lead.created_date);
        return date && format(date, 'yyyy-MM') === key;
      });
      const won = monthLeads.filter((lead) => lead.status === 'won').length;
      return {
        label,
        value: monthLeads.length > 0 ? Math.round((won / monthLeads.length) * 100) : 0,
      };
    });
    const salesCycleTrend = monthBuckets.map(({ key, label }) => {
      const wonOpps = opportunities.filter((opp) => {
        if (opp.stage !== 'closed_won') return false;
        const closeDate = safeParseDate(opp.close_date) || safeParseDate(opp.updated_date);
        return closeDate && format(closeDate, 'yyyy-MM') === key;
      });
      if (!wonOpps.length) return { label, value: 0 };
      const avgDays = Math.round(
        wonOpps.reduce((sum, opp) => {
          const created = safeParseDate(opp.created_date);
          const closed = safeParseDate(opp.close_date) || safeParseDate(opp.updated_date);
          if (!created || !closed) return sum;
          return sum + Math.max(0, Math.floor((closed - created) / (1000 * 60 * 60 * 24)));
        }, 0) / wonOpps.length
      );
      return { label, value: avgDays };
    });

    const currentMonthKey = format(new Date(), 'yyyy-MM');
    const previousMonthKey = format(subMonths(new Date(), 1), 'yyyy-MM');
    const leadsThisMonth = countInMonth(leads, 'created_date', currentMonthKey);
    const leadsLastMonth = countInMonth(leads, 'created_date', previousMonthKey);
    const revenueThisMonth = sumWonRevenueInMonth(opportunities, currentMonthKey);
    const revenueLastMonth = sumWonRevenueInMonth(opportunities, previousMonthKey);

    return {
      leadTrend,
      dealsClosedTrend,
      revenueTrend,
      targetTrend,
      conversionTrend,
      salesCycleTrend,
      leadsDelta: percentChange(leadsThisMonth, leadsLastMonth),
      revenueDelta: percentChange(revenueThisMonth, revenueLastMonth),
    };
  }, [leads, opportunities, defaultSettings, monthBuckets]);

  const kpis = useMemo(() => {
    const totalLeads = leads.length;
    const closedDeals = filteredOpportunities.filter((o) => o.stage === 'closed_won');
    const dealsClosedValue = closedDeals.reduce((sum, o) => sum + (o.amount || 0), 0);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const revenueThisMonth = filteredOpportunities
      .filter((o) => {
        if (o.stage !== 'closed_won') return false;
        const closeDate = safeParseDate(o.close_date) || safeParseDate(o.updated_date);
        return closeDate && closeDate.getMonth() === currentMonth && closeDate.getFullYear() === currentYear;
      })
      .reduce((sum, o) => sum + (o.amount || 0), 0);

    const salesTarget = Number(defaultSettings?.monthly_sales_target) || 0;
    const targetProgress =
      salesTarget > 0 ? ((revenueThisMonth / salesTarget) * 100).toFixed(1) : 0;

    const conversionRate =
      leads.length > 0
        ? ((leads.filter((l) => l.status === 'won').length / leads.length) * 100).toFixed(1)
        : 0;

    const wonOpportunities = filteredOpportunities.filter((o) => o.stage === 'closed_won');
    const avgSalesCycle =
      wonOpportunities.length > 0
        ? Math.round(
            wonOpportunities.reduce((sum, opp) => {
              const created = safeParseDate(opp.created_date);
              const closed = safeParseDate(opp.close_date) || safeParseDate(opp.updated_date);
              if (!created || !closed) return sum;
              return sum + Math.max(0, Math.floor((closed - created) / (1000 * 60 * 60 * 24)));
            }, 0) / wonOpportunities.length
          )
        : 0;

    return {
      totalLeads,
      dealsClosedValue,
      revenueThisMonth,
      salesTarget,
      targetProgress,
      conversionRate,
      avgSalesCycle,
      leadsDelta: dashboardTrends.leadsDelta,
      revenueDelta: dashboardTrends.revenueDelta,
    };
  }, [leads, filteredOpportunities, defaultSettings, dashboardTrends]);

  const pipelineData = useMemo(() => {
    const stages = ['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won'];
    return stages.map((stage) => ({
      stage: stage === 'closed_won' ? 'Won' : stage.charAt(0).toUpperCase() + stage.slice(1),
      value: filteredOpportunities
        .filter((o) => o.stage === stage)
        .reduce((sum, o) => sum + (o.amount || 0), 0),
      count: filteredOpportunities.filter((o) => o.stage === stage).length,
    }));
  }, [filteredOpportunities]);

  const revenueOverTime = useMemo(() => {
    const months = recentMonthLabels(6);

    return months.map(({ key, label }) => {
      const monthRevenue = opportunities
        .filter((o) => {
          if (o.stage !== 'closed_won') return false;
          const closeDate = safeParseDate(o.close_date) || safeParseDate(o.updated_date);
          return closeDate && format(closeDate, 'yyyy-MM') === key;
        })
        .reduce((sum, o) => sum + (o.amount || 0), 0);

      return {
        month: label,
        won: monthRevenue,
        target: Number(defaultSettings?.monthly_sales_target) || 0,
      };
    });
  }, [opportunities, defaultSettings]);

  const topPerformers = useMemo(() => {
    const performerMap = {};
    filteredOpportunities.forEach((opp) => {
      if (opp.owner) {
        if (!performerMap[opp.owner]) {
          performerMap[opp.owner] = { name: opp.owner, deals: 0, value: 0 };
        }
        if (opp.stage === 'closed_won') {
          performerMap[opp.owner].deals++;
          performerMap[opp.owner].value += opp.amount || 0;
        }
      }
    });
    return Object.values(performerMap)
      .filter((performer) => performer.deals > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  }, [filteredOpportunities]);

  const leadSources = useMemo(() => {
    const sourceMap = {};
    leads.forEach((lead) => {
      const source = lead.source || 'Unknown';
      sourceMap[source] = (sourceMap[source] || 0) + 1;
    });
    return Object.entries(sourceMap).map(([source, count]) => ({ source, count }));
  }, [leads]);

  const recentDeals = useMemo(() => {
    return filteredOpportunities
      .sort((a, b) => new Date(b.updated_date).getTime() - new Date(a.updated_date).getTime())
      .slice(0, 5);
  }, [filteredOpportunities]);

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const futureActivities = activities
      .filter((activity) => {
        const date = safeParseDate(activity.date);
        return date && date >= now && !activity.completed;
      })
      .map((activity) => ({
        id: activity.id,
        title: activity.description,
        subtitle: activity.related_to_name || activity.type,
        date: activity.date,
        kind: 'activity',
      }));

    const futureEvents = calendarEvents
      .filter((event) => {
        if (event.status && event.status !== 'scheduled') return false;
        const date = safeParseDate(event.start_date);
        return date && date >= now;
      })
      .map((event) => ({
        id: event.id,
        title: event.title,
        subtitle: event.related_to_name || event.event_type,
        date: event.start_date,
        kind: 'event',
      }));

    return [...futureActivities, ...futureEvents]
      .sort((a, b) => safeParseDate(a.date) - safeParseDate(b.date))
      .slice(0, 3);
  }, [activities, calendarEvents]);

  const statusColors = {
    prospecting: 'bg-blue-100 text-blue-800',
    qualification: 'bg-purple-100 text-purple-800',
    proposal: 'bg-yellow-100 text-yellow-800',
    negotiation: 'bg-orange-100 text-orange-800',
    closed_won: 'bg-green-100 text-green-800',
    closed_lost: 'bg-red-100 text-red-800',
  };

  const invalidateDashboard = () => {
    queryClient.invalidateQueries({ queryKey: ['leads', 'dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['opportunities', 'dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['activities', 'dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['calendarEvents', 'dashboard'] });
  };

  const createLeadMutation = useMutation({
    mutationFn: (data) => api.entities.Lead.create(data),
    onSuccess: () => {
      invalidateDashboard();
      setActiveDialog(null);
      showSuccess('Lead created.');
    },
    onError: (error) => showError(error, 'Failed to create lead.'),
  });

  const createContactMutation = useMutation({
    mutationFn: (data) => api.entities.Contact.create(data),
    onSuccess: () => {
      invalidateDashboard();
      setActiveDialog(null);
      showSuccess('Contact created.');
    },
    onError: (error) => showError(error, 'Failed to create contact.'),
  });

  const createOpportunityMutation = useMutation({
    mutationFn: (data) => api.entities.Opportunity.create(data),
    onSuccess: () => {
      invalidateDashboard();
      setActiveDialog(null);
      showSuccess('Opportunity created.');
    },
    onError: (error) => showError(error, 'Failed to create opportunity.'),
  });

  const createActivityMutation = useMutation({
    mutationFn: (data) => api.entities.Activity.create(data),
    onSuccess: () => {
      invalidateDashboard();
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setActiveDialog(null);
      showSuccess('Activity logged.');
    },
    onError: (error) => showError(error, 'Failed to log activity.'),
  });

  const updateOpportunityMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Opportunity.update(id, data),
    onSuccess: () => {
      invalidateDashboard();
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      setEditOpportunityOpen(false);
      setSelectedOpportunity(null);
      showSuccess('Opportunity updated.');
    },
    onError: (error) => showError(error, 'Failed to update opportunity.'),
  });

  const deleteOpportunityMutation = useMutation({
    mutationFn: (id) => api.entities.Opportunity.delete(id),
    onSuccess: () => {
      invalidateDashboard();
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      showSuccess('Opportunity deleted.');
    },
    onError: (error) => showError(error, 'Failed to delete opportunity.'),
  });

  const openOpportunity = (deal) => {
    setSelectedOpportunity(deal);
    setEditOpportunityOpen(true);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Account', 'Amount', 'Stage', 'Owner', 'Close Date'];
    const rows = recentDeals.map((deal) => {
      const closeDate = safeParseDate(deal.close_date);
      return [
        deal.name || '',
        deal.account_name || '',
        deal.amount || 0,
        deal.stage || '',
        deal.owner || '',
        closeDate ? format(closeDate, 'yyyy-MM-dd') : '',
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_deals_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCloseDate = (value) => {
    const date = safeParseDate(value);
    return date ? date.toLocaleDateString() : '—';
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <PermissionGate permission="can_export_data">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </PermissionGate>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <PermissionGate entity="Lead">
                <DropdownMenuItem onClick={() => setActiveDialog('lead')}>New Lead</DropdownMenuItem>
              </PermissionGate>
              <PermissionGate entity="Contact">
                <DropdownMenuItem onClick={() => setActiveDialog('contact')}>
                  New Contact
                </DropdownMenuItem>
              </PermissionGate>
              <PermissionGate entity="Opportunity">
                <DropdownMenuItem onClick={() => setActiveDialog('opportunity')}>
                  New Opportunity
                </DropdownMenuItem>
              </PermissionGate>
              <PermissionGate entity="Activity">
                <DropdownMenuItem onClick={() => setActiveDialog('activity')}>
                  Log Activity
                </DropdownMenuItem>
              </PermissionGate>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs sm:text-sm text-gray-600">Total Leads</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl sm:text-3xl font-bold">{kpis.totalLeads}</span>
              {kpis.leadsDelta !== 0 && (
                <div
                  className={`text-xs mb-1 ${kpis.leadsDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatDelta(kpis.leadsDelta)}
                </div>
              )}
            </div>
            <MiniSparkline data={dashboardTrends.leadTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs sm:text-sm text-gray-600">Deals Closed</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl sm:text-3xl font-bold">
                {formatCurrency(kpis.dealsClosedValue, currency, true)}
              </span>
            </div>
            <MiniBars data={dashboardTrends.dealsClosedTrend} barClass="bg-cyan-400" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs sm:text-sm text-gray-600">Revenue This Month</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl sm:text-3xl font-bold">
                {formatCurrency(kpis.revenueThisMonth, currency, true)}
              </span>
              {kpis.revenueDelta !== 0 && (
                <div
                  className={`text-xs mb-1 ${kpis.revenueDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatDelta(kpis.revenueDelta)}
                </div>
              )}
            </div>
            <MiniBars data={dashboardTrends.revenueTrend} barClass="bg-green-400" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs sm:text-sm text-gray-600">Sales Target</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl sm:text-3xl font-bold">
                {formatCurrency(kpis.salesTarget, currency, true)}
              </span>
              <div className="text-xs text-gray-600 mb-1">{kpis.targetProgress}%</div>
            </div>
            <MiniBars data={dashboardTrends.targetTrend} barClass="bg-amber-400" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs sm:text-sm text-gray-600">Conversion Rate</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl sm:text-3xl font-bold">{kpis.conversionRate}%</span>
            </div>
            <MiniSparkline data={dashboardTrends.conversionTrend} type="area" color="#8b5cf6" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs sm:text-sm text-gray-600">Avg. Sales Cycle</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl sm:text-3xl font-bold">{kpis.avgSalesCycle}</span>
              <span className="text-xs text-gray-600 mb-1">days</span>
            </div>
            <MiniSparkline data={dashboardTrends.salesCycleTrend} color="#10b981" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              {ownerOptions.map((owner) => (
                <SelectItem key={owner} value={owner}>
                  {owner}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="prospecting">Prospecting</SelectItem>
              <SelectItem value="qualification">Qualification</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closed_won">Won</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="call">Call</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              id="dashboard-stage-source-filter"
              name="dashboard-stage-source-filter"
              placeholder="Search deals..."
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Sales Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
                <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-4 text-xs">
              {pipelineData.map((item) => (
                <div key={item.stage} className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded ${PIPELINE_STAGE_COLORS[item.stage] || 'bg-gray-400'}`}
                  ></div>
                  <span className="text-gray-600">
                    {item.stage}: {formatCurrency(item.value, currency, true)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base sm:text-lg">Revenue Over Time</CardTitle>
              <span className="text-xs text-gray-500">Last 6 months</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value), currency)} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="won"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="Won"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                  name="Target"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base sm:text-lg">Top Performing Sales Reps</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(createPageUrl('Reports'))}>
                    View Reports
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(createPageUrl('Opportunities'))}>
                    View Opportunities
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b">
                <span>Sales Rep</span>
                <div className="flex gap-8">
                  <span>Revenue</span>
                  <span>Won Deals</span>
                </div>
              </div>
              {topPerformers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No closed deals yet</p>
              ) : (
                topPerformers.map((performer) => (
                <div key={performer.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold">
                      {performer.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{performer.name}</p>
                      <p className="text-xs text-gray-500">
                        {performer.deals} won deal{performer.deals === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold">
                      {formatCurrency(performer.value, currency, true)}
                    </span>
                    <Badge className="bg-green-100 text-green-800">{performer.deals}</Badge>
                  </div>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base sm:text-lg">Lead Sources</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 h-8"
                onClick={() => setActiveDialog('lead')}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leadSources.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No lead sources yet</p>
              ) : (
                leadSources.slice(0, 4).map((source) => (
                <div
                  key={source.source}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <span className="text-sm capitalize">{source.source}</span>
                  <span className="text-xs text-gray-500">{source.count} lead{source.count === 1 ? '' : 's'}</span>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base sm:text-lg">Upcoming Schedule</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 h-8"
                onClick={() => navigate(createPageUrl('Calendar'))}
              >
                <Plus className="w-4 h-4 mr-1" />
                View
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((item) => (
                  <div
                    key={`${item.kind}-${item.id}`}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() =>
                      item.kind === 'event'
                        ? navigate(createPageUrl('Calendar'))
                        : setActiveDialog('activity')
                    }
                  >
                    <div>
                      <p className="text-sm">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        {item.subtitle || (item.kind === 'event' ? 'Calendar event' : 'Activity')}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {safeParseDate(item.date)?.toLocaleDateString() || '—'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No upcoming events</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deals */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-base sm:text-lg">Recent Deals</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(createPageUrl('Opportunities'))}>
                  View all opportunities
                </DropdownMenuItem>
                <PermissionGate permission="can_export_data">
                  <DropdownMenuItem onClick={exportToCSV}>Export deals</DropdownMenuItem>
                </PermissionGate>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 border-b">
                  <th className="text-left py-2 font-medium">Lead</th>
                  <th className="text-left py-2 font-medium">Company</th>
                  <th className="text-left py-2 font-medium">Deal Value</th>
                  <th className="text-left py-2 font-medium">Stage</th>
                  <th className="text-left py-2 font-medium">Owner</th>
                  <th className="text-left py-2 font-medium">Close Date</th>
                  <th className="text-left py-2 font-medium">Source</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {recentDeals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-sm text-gray-500">
                      No recent deals
                    </td>
                  </tr>
                ) : (
                  recentDeals.map((deal) => (
                    <tr
                      key={deal.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => openOpportunity(deal)}
                    >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8 bg-gray-200" />
                        <div>
                          <p className="text-sm font-medium">{deal.name}</p>
                          <p className="text-xs text-gray-500">{deal.account_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm">{deal.account_name}</td>
                    <td className="text-sm font-semibold">{formatCurrency(deal.amount || 0, currency)}</td>
                    <td>
                      <Badge className={statusColors[deal.stage] || 'bg-gray-100 text-gray-800'}>
                        {formatStageLabel(deal.stage)}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 bg-blue-100" />
                        <span className="text-sm">{deal.owner || '—'}</span>
                      </div>
                    </td>
                    <td className="text-sm text-gray-600">{formatCloseDate(deal.close_date)}</td>
                    <td className="text-sm text-gray-600 capitalize">{deal.source || '—'}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openOpportunity(deal)}>
                            {canManageOpportunities ? 'Edit' : 'View'}
                          </DropdownMenuItem>
                          {canManageOpportunities && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deleteOpportunityMutation.mutate(deal.id)}
                            >
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <LeadDialog
        open={activeDialog === 'lead'}
        onOpenChange={(open) => {
          if (!open && createLeadMutation.isPending) return;
          if (!open) setActiveDialog(null);
        }}
        onSubmit={(data) => createLeadMutation.mutate(data)}
        isLoading={createLeadMutation.isPending}
      />
      <ContactDialog
        open={activeDialog === 'contact'}
        onOpenChange={(open) => {
          if (!open && createContactMutation.isPending) return;
          if (!open) setActiveDialog(null);
        }}
        onSubmit={(data) => createContactMutation.mutate(data)}
        isLoading={createContactMutation.isPending}
      />
      <OpportunityDialog
        open={activeDialog === 'opportunity'}
        onOpenChange={(open) => {
          if (!open && createOpportunityMutation.isPending) return;
          if (!open) setActiveDialog(null);
        }}
        onSubmit={(data) => createOpportunityMutation.mutate(data)}
        isLoading={createOpportunityMutation.isPending}
      />
      <ActivityDialog
        open={activeDialog === 'activity'}
        onOpenChange={(open) => {
          if (!open && createActivityMutation.isPending) return;
          if (!open) setActiveDialog(null);
        }}
        onSubmit={(data) => createActivityMutation.mutate(data)}
        isLoading={createActivityMutation.isPending}
      />
      <EditOpportunityDialog
        open={editOpportunityOpen}
        onOpenChange={(open) => {
          if (!open && updateOpportunityMutation.isPending) return;
          setEditOpportunityOpen(open);
          if (!open) setSelectedOpportunity(null);
        }}
        opportunity={selectedOpportunity}
        onSubmit={(data) =>
          selectedOpportunity &&
          updateOpportunityMutation.mutate({ id: selectedOpportunity.id, data })
        }
        isLoading={updateOpportunityMutation.isPending}
        readOnly={!canManageOpportunities}
      />
    </div>
  );
}
