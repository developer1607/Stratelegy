import React, { useState, useMemo } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Building2, MoreVertical, Download, Star, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AccountDialog from '../components/forms/AccountDialog';
import EditAccountDialog from '../components/forms/EditAccountDialog';
import AccountKPICard from '../components/accounts/AccountKPICard';
import PermissionGate from '@/components/PermissionGate';
import AccountFilters from '../components/accounts/AccountFilters';
import AccountInsightsDialog from '../components/accounts/AccountInsightsDialog';
import {
  activitiesForAccount,
  opportunityMatchesAccount,
  isOpenOpportunity,
} from '@/lib/accountLinking';
import {
  monthBucketCounts,
  sparklineHeights,
  percentChange,
  formatTrendDelta,
} from '@/lib/kpiTrends';
import { matchFieldEquals, matchSearch, namesFromConfigItems, uniqueOwners, revenueInRange } from '@/lib/listFilters';
import { displayAccountOwner, ownerInitials, userOwnerLabel } from '@/lib/accountOwner';
import { showError, showSuccess } from '@/lib/toast';
import { usePermissions } from '@/hooks/usePermissions';

export default function Accounts() {
  const { canWriteEntity, canReadEntity, isLoading: permsLoading } = usePermissions();
  const canManage = canWriteEntity('Account');
  const canReadAccounts = canReadEntity('Account');
  const canReadActivities = canReadEntity('Activity');
  const canReadContacts = canReadEntity('Contact');
  const canReadOpportunities = canReadEntity('Opportunity');
  const canReadCalendar = canReadEntity('CalendarEvent');
  const canReadCrmConfig = canReadEntity('Industry');
  const queriesEnabled = !permsLoading;
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [insightsDialogOpen, setInsightsDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [filters, setFilters] = useState({
    owner: 'all',
    industry: 'all',
    revenue: 'all',
    tier: 'all',
  });
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.entities.Account.list('-created_date'),
    enabled: queriesEnabled && canReadAccounts,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => api.entities.Activity.list('-date'),
    enabled: queriesEnabled && canReadActivities,
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => api.entities.Contact.list('-created_date'),
    enabled: queriesEnabled && canReadContacts,
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ['opportunities'],
    queryFn: () => api.entities.Opportunity.list('-created_date'),
    enabled: queriesEnabled && canReadOpportunities,
  });

  const { data: calendarEvents = [] } = useQuery({
    queryKey: ['calendarEvents'],
    queryFn: () => api.entities.CalendarEvent.list('-start_date', 500),
    staleTime: 60_000,
    enabled: queriesEnabled && canReadCalendar,
  });

  const { data: userDirectory = [] } = useQuery({
    queryKey: ['users', 'directory'],
    queryFn: () => api.users.directory(),
    staleTime: 5 * 60_000,
    enabled: queriesEnabled && canReadAccounts,
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.entities.Account.create(data),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setDialogOpen(false);
      showSuccess('Account created.');
    },
    onError: (error) => showError(error, 'Failed to create account.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Account.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      setEditDialogOpen(false);
      setSelectedAccount(null);
      showSuccess('Account updated.');
    },
    onError: (error) => showError(error, 'Failed to update account.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.entities.Account.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      showSuccess('Account deleted.');
    },
    onError: (error) => showError(error, 'Failed to delete account.'),
  });

  const { data: accountTiers = [] } = useQuery({
    queryKey: ['accountTiers'],
    queryFn: () => api.entities.AccountTier.list('order'),
    enabled: queriesEnabled && canReadCrmConfig,
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

  const tierOptions = useMemo(
    () => namesFromConfigItems(accountTiers),
    [accountTiers]
  );

  const defaultAccountTier = useMemo(() => {
    const configured = defaultSettings?.default_account_tier;
    if (configured && tierOptions.includes(configured)) return configured;
    return tierOptions[0] || 'Standard';
  }, [defaultSettings, tierOptions]);

  const topTierName = useMemo(() => {
    if (!accountTiers.length) return 'Enterprise';
    return [...accountTiers].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).at(-1)?.name || 'Enterprise';
  }, [accountTiers]);

  const resolveAccountTier = (account) => {
    if (account.tier && tierOptions.includes(account.tier)) return account.tier;
    if (defaultAccountTier) return defaultAccountTier;
    return tierOptions[0] || 'Standard';
  };

  const enrichedAccounts = useMemo(() => {
    return accounts.map((account) => {
      const accountActivities = activitiesForAccount(account, activities, {
        contacts,
        opportunities,
      });
      const lastActivity =
        accountActivities.length > 0
          ? new Date(Math.max(...accountActivities.map((a) => new Date(a.date))))
          : null;

      const openDeals = opportunities.filter(
        (o) => opportunityMatchesAccount(o, account) && isOpenOpportunity(o)
      ).length;

      const overdueActivities = accountActivities.filter(
        (a) => new Date(a.date) < new Date() && !a.completed
      ).length;

      return {
        ...account,
        tier: resolveAccountTier(account),
        lastActivity,
        openDeals,
        overdueActivities,
        displayOwner: displayAccountOwner(account),
      };
    });
  }, [accounts, activities, contacts, opportunities, defaultAccountTier, tierOptions]);

  const { data: industries = [] } = useQuery({
    queryKey: ['industries'],
    queryFn: () => api.entities.Industry.list('order'),
    enabled: queriesEnabled && canReadCrmConfig,
  });

  const industryOptions = useMemo(() => {
    const fromConfig = namesFromConfigItems(industries);
    const fromData = [...new Set(enrichedAccounts.map((a) => a.industry).filter(Boolean))];
    return [...new Set([...fromConfig, ...fromData])].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  }, [industries, enrichedAccounts]);

  const ownerOptions = useMemo(() => {
    const fromAccounts = uniqueOwners(enrichedAccounts, ['owner']);
    const fromUsers = userDirectory.map((user) => userOwnerLabel(user)).filter(Boolean);
    return [...new Set([...fromAccounts, ...fromUsers])].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );
  }, [enrichedAccounts, userDirectory]);

  const filteredAccounts = useMemo(() => {
    return enrichedAccounts.filter((account) => {
      const matchSearchTerm = matchSearch(account, searchTerm, [
        'name',
        'industry',
        'email',
        'phone',
        'website',
      ]);
      const matchIndustry = matchFieldEquals(account.industry, filters.industry);
      const matchTier = filters.tier === 'all' || matchFieldEquals(account.tier, filters.tier);
      const matchOwner =
        filters.owner === 'all' || matchFieldEquals(account.displayOwner, filters.owner);
      const matchRevenue = revenueInRange(account.annual_revenue, filters.revenue);

      return matchSearchTerm && matchIndustry && matchTier && matchOwner && matchRevenue;
    });
  }, [enrichedAccounts, searchTerm, filters]);

  const kpis = useMemo(() => {
    const totalAccounts = enrichedAccounts.length;
    const activeAccounts = enrichedAccounts.filter((a) => a.status === 'active').length;
    const keyAccounts = enrichedAccounts.filter((a) => a.tier === topTierName).length;
    const totalRevenue = opportunities
      .filter((o) => o.stage === 'closed_won')
      .reduce((sum, o) => sum + (o.amount || 0), 0);
    const overdueAccounts = enrichedAccounts.filter((a) => a.overdueActivities > 0).length;

    return {
      totalAccounts,
      activeAccounts,
      keyAccounts,
      totalRevenue,
      overdueAccounts,
    };
  }, [enrichedAccounts, opportunities, topTierName]);

  const accountKpiTrends = useMemo(() => {
    const createdTrend = monthBucketCounts(accounts, 'created_date');
    const activeTrend = monthBucketCounts(
      accounts.filter((a) => a.status === 'active'),
      'created_date',
    );
    const keyTrend = monthBucketCounts(
      accounts.filter((a) => (a.tier || defaultAccountTier) === topTierName),
      'created_date',
    );
    const revenueTrend = monthBucketCounts(
      opportunities.filter((o) => o.stage === 'closed_won'),
      'close_date',
    );
    const totalDelta = formatTrendDelta(
      percentChange(createdTrend.at(-1) ?? 0, createdTrend.at(-2) ?? 0),
    );

    return {
      totalChart: sparklineHeights(createdTrend),
      activeChart: sparklineHeights(activeTrend),
      keyChart: sparklineHeights(keyTrend),
      revenueChart: sparklineHeights(revenueTrend),
      totalDelta,
      activeDelta: formatTrendDelta(
        percentChange(activeTrend.at(-1) ?? 0, activeTrend.at(-2) ?? 0),
      ),
      keyDelta: formatTrendDelta(percentChange(keyTrend.at(-1) ?? 0, keyTrend.at(-2) ?? 0)),
    };
  }, [accounts, opportunities, topTierName, defaultAccountTier]);

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setEditDialogOpen(true);
  };

  const handleViewInsights = (account) => {
    setSelectedAccount(account);
    setInsightsDialogOpen(true);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ owner: 'all', industry: 'all', revenue: 'all', tier: 'all' });
  };

  const exportToCSV = () => {
    if (accounts.length === 0) return;

    const headers = [
      'Name',
      'Industry',
      'Phone',
      'Email',
      'Website',
      'Annual Revenue',
      'Employees',
      'Account Status',
      'Tier',
    ];
    const rows = filteredAccounts.map((account) => [
      account.name || '',
      account.industry || '',
      account.phone || '',
      account.email || '',
      account.website || '',
      account.annual_revenue || '',
      account.employees || '',
      account.status || '',
      account.tier || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTierBadge = (tier) => {
    const colors = {
      Standard: 'bg-gray-100 text-gray-800',
      Premium: 'bg-blue-100 text-blue-800',
      Enterprise: 'bg-yellow-100 text-yellow-800',
      Key: 'bg-yellow-100 text-yellow-800',
      A: 'bg-green-100 text-green-800',
      B: 'bg-blue-100 text-blue-800',
      C: 'bg-gray-100 text-gray-800',
    };
    return colors[tier] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Accounts</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <PermissionGate permission="can_export_data">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={accounts.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </PermissionGate>
          <PermissionGate entity="Account">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Account
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <AccountKPICard
          title="Total Accounts"
          value={kpis.totalAccounts}
          trend={
            accountKpiTrends.totalDelta
              ? accountKpiTrends.totalDelta.startsWith('-')
                ? 'down'
                : 'up'
              : undefined
          }
          trendValue={accountKpiTrends.totalDelta || undefined}
          chartData={accountKpiTrends.totalChart}
          color="blue"
        />
        <AccountKPICard
          title="Active Accounts"
          value={kpis.activeAccounts}
          trend={
            accountKpiTrends.activeDelta
              ? accountKpiTrends.activeDelta.startsWith('-')
                ? 'down'
                : 'up'
              : undefined
          }
          trendValue={accountKpiTrends.activeDelta || undefined}
          chartData={accountKpiTrends.activeChart}
          color="green"
        />
        <AccountKPICard
          title="Key Accounts"
          value={kpis.keyAccounts}
          trend={
            accountKpiTrends.keyDelta
              ? accountKpiTrends.keyDelta.startsWith('-')
                ? 'down'
                : 'up'
              : undefined
          }
          trendValue={accountKpiTrends.keyDelta || undefined}
          chartData={accountKpiTrends.keyChart}
          color="cyan"
        />
        <AccountKPICard
          title="Total Revenue"
          value={`$${(kpis.totalRevenue / 1000000).toFixed(1)}M`}
          chartData={accountKpiTrends.revenueChart}
          color="purple"
        />
        <AccountKPICard
          title="Overdue Activities"
          value={kpis.overdueAccounts}
          color="red"
        />
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow mb-4 lg:mb-0">
            <div className="p-4 border-b">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <div className="relative flex-1 max-w-md space-y-1.5">
                  <Label htmlFor="accounts-search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="accounts-search"
                      placeholder="Search accounts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant={showFilters ? 'default' : 'outline'}
                  className="w-full sm:w-auto"
                  onClick={() => setShowFilters((open) => !open)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mb-4 lg:hidden">
              <AccountFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                industries={industryOptions}
                tiers={tierOptions}
                owners={ownerOptions}
                onClear={clearFilters}
              />
            </div>
          )}

          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No accounts found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAccounts.map((account) => (
                      <TableRow
                        key={account.id}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          account.tier === topTierName ? 'bg-yellow-50/30' : ''
                        } ${account.overdueActivities > 0 ? 'border-l-4 border-l-red-500' : ''}`}
                        onClick={() => handleViewInsights(account)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{account.name}</p>
                                {account.tier === topTierName && (
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                )}
                                {account.overdueActivities > 0 && (
                                  <Badge variant="destructive" className="text-xs">
                                    {account.overdueActivities} Overdue
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">{account.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{account.industry || '-'}</TableCell>
                        <TableCell>
                          {account.annual_revenue
                            ? `$${(account.annual_revenue / 1000000).toFixed(1)}M`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getTierBadge(account.tier)}>{account.tier}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6 bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center">
                              {ownerInitials(account.displayOwner)}
                            </Avatar>
                            <span className="text-sm">{account.displayOwner || '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {account.lastActivity
                              ? new Date(account.lastActivity).toLocaleDateString()
                              : 'No activity'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(account);
                                }}
                              >
                                {canManage ? 'Edit' : 'View'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewInsights(account);
                                }}
                              >
                                View Insights
                              </DropdownMenuItem>
                              {canManage && (
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteMutation.mutate(account.id);
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Right Sidebar Filters */}
        <div className="hidden lg:block w-80">
          <AccountFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            industries={industryOptions}
            tiers={tierOptions}
            owners={ownerOptions}
            onClear={clearFilters}
          />
        </div>
      </div>

      <AccountDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open && createMutation.isPending) return;
          setDialogOpen(open);
        }}
        onSubmit={(data) => {
          if (!canManage) {
            showError(new Error('You do not have permission to create accounts.'));
            return;
          }
          createMutation.mutate(data);
        }}
        isLoading={createMutation.isPending && dialogOpen}
        tiers={tierOptions}
        defaultTier={defaultAccountTier}
      />

      <EditAccountDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          if (!open && updateMutation.isPending) return;
          setEditDialogOpen(open);
        }}
        account={selectedAccount}
        onSubmit={(data) => updateMutation.mutate({ id: selectedAccount.id, data })}
        isLoading={updateMutation.isPending && editDialogOpen}
        readOnly={!canManage}
        tiers={tierOptions}
        defaultTier={defaultAccountTier}
      />

      <AccountInsightsDialog
        open={insightsDialogOpen}
        onOpenChange={setInsightsDialogOpen}
        account={selectedAccount}
        activities={activities}
        calendarEvents={calendarEvents}
        contacts={contacts}
        opportunities={opportunities}
      />
    </div>
  );
}
