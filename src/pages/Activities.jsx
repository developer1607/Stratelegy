import React, { useState, useMemo } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Mail, Calendar as CalendarIcon, ClipboardCheck } from 'lucide-react';
import ActivityDialog from '../components/forms/ActivityDialog';
import ActivityKPICard from '../components/activities/ActivityKPICard';
import PriorityActivityItem from '../components/activities/PriorityActivityItem';
import ActivityTimeline from '../components/activities/ActivityTimeline';
import ActivityFilters from '../components/activities/ActivityFilters';
import ActivitiesAnalytics from '../components/activities/ActivitiesAnalytics';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { filterByDateRange, matchFieldIncludes, matchSearch, namesFromConfigItems, uniqueOwners } from '@/lib/listFilters';
import { monthBucketCounts, sparklineHeights } from '@/lib/kpiTrends';
import { showError, showSuccess } from '@/lib/toast';
import PermissionGate from '@/components/PermissionGate';
import { useCrmEntityCreate } from '@/hooks/useCrmEntityCreate';
import { usePermissions } from '@/hooks/usePermissions';

export default function Activities() {
  const { canWriteEntity } = usePermissions();
  const canManage = canWriteEntity('Activity');
  const [searchTerm, setSearchTerm] = useState('');
  const [activityType, setActivityType] = useState(null);
  const [priorityTab, setPriorityTab] = useState('overdue');
  const [filters, setFilters] = useState({
    types: [],
    owner: 'all',
    status: '7days',
  });
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => api.entities.Activity.list('-date'),
  });

  const { data: activityTypes = [] } = useQuery({
    queryKey: ['activityTypes'],
    queryFn: () => api.entities.ActivityType.list('order'),
  });

  const activityTypeOptions = useMemo(
    () => namesFromConfigItems(activityTypes),
    [activityTypes]
  );

  const ownerOptions = useMemo(
    () => uniqueOwners(activities, ['created_by', 'owner']),
    [activities]
  );

  const {
    dialogOpen,
    setDialogOpen,
    handleDialogOpenChange,
    submitCreate,
    isCreating,
  } = useCrmEntityCreate({
    entityName: 'Activity',
    invalidateKeys: [['activities'], ['contacts']],
    successMessage: 'Activity logged.',
    errorMessage: 'Failed to log activity.',
    onCreated: () => setActivityType(null),
  });

  const submitActivity = (data) =>
    submitCreate({ ...data, type: activityType || data.type });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.Activity.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      showSuccess('Activity updated.');
    },
    onError: (error) => showError(error, 'Failed to update activity.'),
  });

  const handleQuickLog = (type) => {
    setActivityType(type);
    setDialogOpen(true);
  };

  const handleMarkComplete = (id) => {
    if (!canManage) return;
    updateMutation.mutate({ id, data: { completed: true } });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ types: [], owner: 'all', status: '7days' });
  };

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchSearchTerm = matchSearch(activity, searchTerm, [
        'description',
        'related_to_name',
        'type',
      ]);

      const matchType = filters.types.length === 0 || filters.types.includes(activity.type);

      const matchOwner =
        filters.owner === 'all' ||
        matchFieldIncludes(activity.created_by || activity.owner, filters.owner);

      const matchStatus = filterByDateRange(activity.date, filters.status);

      return matchSearchTerm && matchType && matchOwner && matchStatus;
    });
  }, [activities, searchTerm, filters]);

  const kpis = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activitiesToday = filteredActivities.filter((a) => {
      const activityDate = new Date(a.date);
      return activityDate >= today && activityDate < tomorrow;
    }).length;

    const overdueActivities = filteredActivities.filter(
      (a) => new Date(a.date) < today && !a.completed
    ).length;

    const emailsSent = filteredActivities.filter((a) => a.type === 'Email').length;
    const callsLogged = filteredActivities.filter((a) => a.type === 'Call').length;
    const meetingsScheduled = filteredActivities.filter((a) => a.type === 'Meeting').length;
    const notesLogged = filteredActivities.filter((a) => a.type === 'Note').length;

    return {
      activitiesToday,
      overdueActivities,
      emailsSent,
      callsLogged,
      meetingsScheduled,
      notesLogged,
    };
  }, [filteredActivities]);

  const activityTrends = useMemo(() => {
    const volumeTrend = monthBucketCounts(filteredActivities, 'date');
    const emailTrend = monthBucketCounts(
      filteredActivities.filter((a) => a.type === 'Email'),
      'date',
    );
    const callTrend = monthBucketCounts(
      filteredActivities.filter((a) => a.type === 'Call'),
      'date',
    );
    const meetingTrend = monthBucketCounts(
      filteredActivities.filter((a) => a.type === 'Meeting'),
      'date',
    );
    const noteTrend = monthBucketCounts(
      filteredActivities.filter((a) => a.type === 'Note'),
      'date',
    );
    return {
      volumeChart: sparklineHeights(volumeTrend),
      emailChart: sparklineHeights(emailTrend),
      callChart: sparklineHeights(callTrend),
      meetingChart: sparklineHeights(meetingTrend),
      noteChart: sparklineHeights(noteTrend),
    };
  }, [filteredActivities]);

  const priorityActivities = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      overdue: filteredActivities.filter((a) => new Date(a.date) < today && !a.completed),
      dueToday: filteredActivities.filter((a) => {
        const activityDate = new Date(a.date);
        return activityDate >= today && activityDate < tomorrow && !a.completed;
      }),
      upcoming: filteredActivities.filter((a) => new Date(a.date) >= tomorrow && !a.completed),
      completed: filteredActivities.filter((a) => a.completed),
    };
  }, [filteredActivities]);

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Activities</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search activities…"
              className="pl-9 bg-white"
            />
          </div>
          <PermissionGate entity="Activity">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => handleQuickLog('Call')}>
                <Phone className="w-4 h-4 mr-2" />
                Log Call
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleQuickLog('Email')}>
                <Mail className="w-4 h-4 mr-2" />
                Log Email
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleQuickLog('Meeting')}>
                <CalendarIcon className="w-4 h-4 mr-2" />
                Log Meeting
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => handleQuickLog('Note')}
              >
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Log Task/Note
              </Button>
            </div>
          </PermissionGate>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <ActivityKPICard
          title="Activities Today"
          value={kpis.activitiesToday}
          chartData={activityTrends.volumeChart}
          color="blue"
        />
        <ActivityKPICard
          title="Overdue Activities"
          value={kpis.overdueActivities}
          subText="Due now"
          chartData={activityTrends.volumeChart}
          color="red"
        />
        <ActivityKPICard
          title="Emails Sent"
          value={kpis.emailsSent}
          chartData={activityTrends.emailChart}
          color="cyan"
        />
        <ActivityKPICard
          title="Calls Logged"
          value={kpis.callsLogged}
          chartData={activityTrends.callChart}
          color="green"
        />
        <ActivityKPICard
          title="Meetings Scheduled"
          value={kpis.meetingsScheduled}
          chartData={activityTrends.meetingChart}
          color="purple"
        />
        <ActivityKPICard
          title="Tasks/Notes"
          value={kpis.notesLogged}
          chartData={activityTrends.noteChart}
          color="green"
        />
      </div>

      <div className="flex gap-6">
        <div className="flex-1 space-y-6">
          {/* Priority Activities */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Priority Activities</h2>
              </div>
              <Tabs value={priorityTab} onValueChange={setPriorityTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overdue">
                    Overdue
                    {priorityActivities.overdue.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                        {priorityActivities.overdue.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="dueToday">Due Today</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                <TabsContent value="overdue" className="mt-4 space-y-2">
                  {priorityActivities.overdue.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No overdue activities</p>
                  ) : (
                    priorityActivities.overdue.map((activity) => (
                      <PriorityActivityItem
                        key={activity.id}
                        activity={activity}
                        onMarkComplete={handleMarkComplete}
                      />
                    ))
                  )}
                </TabsContent>
                <TabsContent value="dueToday" className="mt-4 space-y-2">
                  {priorityActivities.dueToday.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No activities due today</p>
                  ) : (
                    priorityActivities.dueToday.map((activity) => (
                      <PriorityActivityItem
                        key={activity.id}
                        activity={activity}
                        onMarkComplete={handleMarkComplete}
                      />
                    ))
                  )}
                </TabsContent>
                <TabsContent value="upcoming" className="mt-4 space-y-2">
                  {priorityActivities.upcoming.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No upcoming activities</p>
                  ) : (
                    priorityActivities.upcoming
                      .slice(0, 5)
                      .map((activity) => (
                        <PriorityActivityItem
                          key={activity.id}
                          activity={activity}
                          onMarkComplete={handleMarkComplete}
                        />
                      ))
                  )}
                </TabsContent>
                <TabsContent value="completed" className="mt-4 space-y-2">
                  {priorityActivities.completed.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No completed activities</p>
                  ) : (
                    priorityActivities.completed
                      .slice(0, 5)
                      .map((activity) => (
                        <PriorityActivityItem
                          key={activity.id}
                          activity={activity}
                          onMarkComplete={handleMarkComplete}
                        />
                      ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Activity Timeline</h2>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-gray-500">Loading activities...</div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No activities found</div>
            ) : (
              <ActivityTimeline activities={filteredActivities} />
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden lg:block w-80 space-y-6">
          <ActivityFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            activityTypes={activityTypeOptions}
            owners={ownerOptions}
            onClear={clearFilters}
          />

          <ActivitiesAnalytics activities={filteredActivities} />
        </div>
      </div>

      <ActivityDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        onSubmit={submitActivity}
        isLoading={isCreating}
        defaultType={activityType}
      />
    </div>
  );
}
