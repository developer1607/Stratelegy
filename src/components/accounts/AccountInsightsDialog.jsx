import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Phone, Calendar, TrendingUp, Users, Target } from 'lucide-react';
import {
  contactMatchesAccount,
  opportunityMatchesAccount,
  isOpenOpportunity,
  activitiesForAccount,
  calendarEventsForAccount,
} from '@/lib/accountLinking';
import RelatedRecordLink from '@/components/crm/RelatedRecordLink';
import {
  formDialogContent,
  formDialogHeader,
  formDialogBody,
  formDialogStatGrid,
} from '@/lib/formDialog';

export default function AccountInsightsDialog({
  account,
  open,
  onOpenChange,
  activities = [],
  calendarEvents = [],
  contacts = [],
  opportunities = [],
}) {
  if (!account) return null;

  const accountContacts = contacts.filter((c) => contactMatchesAccount(c, account));
  const accountOpps = opportunities.filter((o) => opportunityMatchesAccount(o, account));
  const openDeals = accountOpps.filter(isOpenOpportunity);
  const accountActivities = activitiesForAccount(account, activities, {
    contacts,
    opportunities,
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const accountEvents = calendarEventsForAccount(account, calendarEvents, {
    contacts,
    opportunities,
  }).sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

  const recentTimeline = useMemo(() => {
    const items = [
      ...accountActivities.map((item) => ({
        kind: 'activity',
        id: item.id,
        sortDate: new Date(item.date),
        item,
      })),
      ...accountEvents.map((item) => ({
        kind: 'event',
        id: item.id,
        sortDate: new Date(item.start_date),
        item,
      })),
    ];
    return items
      .filter((entry) => !Number.isNaN(entry.sortDate.getTime()))
      .sort((a, b) => b.sortDate - a.sortDate);
  }, [accountActivities, accountEvents]);

  const totalRevenue = accountOpps
    .filter((o) => o.stage === 'closed_won')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={formDialogContent('lg')}>
        <DialogHeader className={formDialogHeader}>
          <div className="flex flex-col gap-3 pr-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <DialogTitle className="truncate text-xl">{account.name}</DialogTitle>
              <p className="text-sm text-gray-500">{account.industry}</p>
            </div>
            <Badge
              className={
                account.status === 'active'
                  ? 'w-fit bg-green-100 text-green-800'
                  : 'w-fit bg-gray-100 text-gray-800'
              }
            >
              {account.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className={formDialogBody}>
        <div className={`${formDialogStatGrid} mb-6`}>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">${(totalRevenue / 1000000).toFixed(1)}M</div>
              <div className="text-xs text-gray-500">Total Revenue</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{openDeals.length}</div>
              <div className="text-xs text-gray-500">Open Deals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold">{accountContacts.length}</div>
              <div className="text-xs text-gray-500">Contacts</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="activities">
          <TabsList className="grid h-auto w-full grid-cols-1 gap-1 sm:grid-cols-3">
            <TabsTrigger value="activities" className="text-xs sm:text-sm">
              Activities & Events
            </TabsTrigger>
            <TabsTrigger value="contacts" className="text-xs sm:text-sm">
              Contacts
            </TabsTrigger>
            <TabsTrigger value="deals" className="text-xs sm:text-sm">
              Open Deals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activities" className="space-y-3 mt-4">
            {recentTimeline.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No recent activities or events</p>
            ) : (
              recentTimeline.slice(0, 8).map((entry) => {
                if (entry.kind === 'event') {
                  const event = entry.item;
                  return (
                    <div key={`event-${event.id}`} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-cyan-100 text-cyan-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.related_to_name && (
                            <span className="mr-2">
                              <RelatedRecordLink
                                type={event.related_to_type}
                                name={event.related_to_name}
                                showIcon={false}
                                className="mr-2"
                              />
                            </span>
                          )}
                          {new Date(event.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {event.event_type || 'event'}
                      </Badge>
                    </div>
                  );
                }

                const activity = entry.item;
                return (
                <div key={`activity-${activity.id}`} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type === 'Email'
                        ? 'bg-blue-100 text-blue-600'
                        : activity.type === 'Call'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-purple-100 text-purple-600'
                    }`}
                  >
                    {activity.type === 'Email' ? (
                      <Mail className="w-5 h-5" />
                    ) : activity.type === 'Call' ? (
                      <Phone className="w-5 h-5" />
                    ) : (
                      <Calendar className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.related_to_name && (
                        <span className="mr-2">
                          <RelatedRecordLink
                            type={activity.related_to_type}
                            name={activity.related_to_name}
                            showIcon={false}
                            className="mr-2"
                          />
                        </span>
                      )}
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="contacts" className="space-y-3 mt-4">
            {accountContacts.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No contacts found</p>
            ) : (
              accountContacts.map((contact) => (
                <div key={contact.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
                  <Avatar className="flex h-10 w-10 shrink-0 items-center justify-center bg-blue-100 text-sm font-semibold text-blue-600">
                    {contact.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.position || 'Contact'}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-gray-500">{contact.email}</p>
                    <p className="text-xs text-gray-500">{contact.phone}</p>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="deals" className="space-y-3 mt-4">
            {openDeals.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No open deals</p>
            ) : (
              openDeals.map((opp) => (
                  <div
                    key={opp.id}
                    className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">{opp.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Close Date: {new Date(opp.close_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">${(opp.amount || 0).toLocaleString()}</p>
                      <Badge className="mt-1 text-xs">{opp.stage}</Badge>
                    </div>
                  </div>
                ))
            )}
          </TabsContent>
        </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
