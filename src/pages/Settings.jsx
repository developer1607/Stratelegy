import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showError, showInfo, showSuccess } from '@/lib/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Download, Trash2 } from 'lucide-react';
import ConfigListManager from '../components/settings/ConfigListManager';
import PortalUsersPanel from '../components/settings/PortalUsersPanel';
import EmailTemplatesPanel from '../components/settings/EmailTemplatesPanel';
import PortalReferencePanel from '../components/settings/PortalReferencePanel';
import { usePermissions } from '@/hooks/usePermissions';
import AccessDenied from '@/components/AccessDenied';
import { invalidateCrmConfig } from '@/lib/crmConfig';
import { downloadImportTemplate } from '@/lib/importTemplates';

export default function Settings() {
  const { isAdmin, isLoading } = usePermissions();
  const [resetConfirmation, setResetConfirmation] = useState('');
  const [salesTargetInput, setSalesTargetInput] = useState('');
  const [exportingEntity, setExportingEntity] = useState(null);
  const queryClient = useQueryClient();
  const adminQueriesEnabled = isAdmin && !isLoading;
  const refreshCrmConfig = () => invalidateCrmConfig(queryClient);

  const { data: contactSources = [] } = useQuery({
    queryKey: ['contactSources'],
    queryFn: () => api.entities.ContactSource.list('order'),
    enabled: adminQueriesEnabled,
  });

  const { data: leadStages = [] } = useQuery({
    queryKey: ['leadStages'],
    queryFn: () => api.entities.LeadStage.list('order'),
    enabled: adminQueriesEnabled,
  });

  const { data: activityTypes = [] } = useQuery({
    queryKey: ['activityTypes'],
    queryFn: () => api.entities.ActivityType.list('order'),
    enabled: adminQueriesEnabled,
  });

  const { data: accountTiers = [] } = useQuery({
    queryKey: ['accountTiers'],
    queryFn: () => api.entities.AccountTier.list('order'),
    enabled: adminQueriesEnabled,
  });

  const { data: industries = [] } = useQuery({
    queryKey: ['industries'],
    queryFn: () => api.entities.Industry.list('order'),
    enabled: adminQueriesEnabled,
  });

  const { data: defaultSettings } = useQuery({
    queryKey: ['defaultSettings'],
    queryFn: async () => {
      const settings = await api.entities.DefaultSettings.list();
      return settings[0] || null;
    },
    enabled: adminQueriesEnabled,
  });

  useEffect(() => {
    setSalesTargetInput(
      defaultSettings?.monthly_sales_target != null
        ? String(defaultSettings.monthly_sales_target)
        : ''
    );
  }, [defaultSettings?.monthly_sales_target]);

  const createSettingsMutation = useMutation({
    mutationFn: (data) => api.entities.DefaultSettings.create(data),
    onSuccess: refreshCrmConfig,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: ({ id, data }) => api.entities.DefaultSettings.update(id, data),
    onSuccess: refreshCrmConfig,
  });

  const handleUpdateSettings = async (field, value) => {
    if (defaultSettings?.id) {
      await updateSettingsMutation.mutateAsync({
        id: defaultSettings.id,
        data: { [field]: value },
      });
    } else {
      await createSettingsMutation.mutateAsync({ [field]: value });
    }
  };

  const handleResetData = async () => {
    if (resetConfirmation !== 'RESET') {
      showInfo('Type RESET to confirm.');
      return;
    }

    try {
      await Promise.all([
        api.entities.Contact.list().then((items) =>
          Promise.all(items.map((i) => api.entities.Contact.delete(i.id)))
        ),
        api.entities.Account.list().then((items) =>
          Promise.all(items.map((i) => api.entities.Account.delete(i.id)))
        ),
        api.entities.Lead.list().then((items) =>
          Promise.all(items.map((i) => api.entities.Lead.delete(i.id)))
        ),
        api.entities.Opportunity.list().then((items) =>
          Promise.all(items.map((i) => api.entities.Opportunity.delete(i.id)))
        ),
        api.entities.Activity.list().then((items) =>
          Promise.all(items.map((i) => api.entities.Activity.delete(i.id)))
        ),
        api.entities.CalendarEvent.list().then((items) =>
          Promise.all(items.map((i) => api.entities.CalendarEvent.delete(i.id)))
        ),
      ]);

      queryClient.invalidateQueries();
      setResetConfirmation('');
      showSuccess('All CRM data has been deleted.');
    } catch {
      showError(null, 'Failed to reset data');
    }
  };

  const exportData = async (entityName) => {
    setExportingEntity(entityName);
    try {
      const data = await api.entities[entityName].list();
      const csv = [
        Object.keys(data[0] || {}).join(','),
        ...data.map((row) =>
          Object.values(row)
            .map((v) => `"${v}"`)
            .join(',')
        ),
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entityName.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      showError(null, `Failed to export ${entityName.toLowerCase()} data`);
    } finally {
      setExportingEntity(null);
    }
  };

  const downloadTemplate = (type) => downloadImportTemplate(type);

  const configMutation = (promise) => promise.then(refreshCrmConfig);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDenied message="Settings are only available to administrators." />;
  }

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto">
            <TabsTrigger value="config">CRM Configuration</TabsTrigger>
            <TabsTrigger value="defaults">Defaults</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="reference">Portal reference</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="users">Portal Users</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ConfigListManager
                title="Contact Sources"
                items={contactSources}
                onAdd={(data) => configMutation(api.entities.ContactSource.create(data))}
                onUpdate={(id, data) => configMutation(api.entities.ContactSource.update(id, data))}
                onDelete={(id) => configMutation(api.entities.ContactSource.delete(id))}
              />
              <ConfigListManager
                title="Lead Stages"
                items={leadStages}
                onAdd={(data) => configMutation(api.entities.LeadStage.create(data))}
                onUpdate={(id, data) => configMutation(api.entities.LeadStage.update(id, data))}
                onDelete={(id) => configMutation(api.entities.LeadStage.delete(id))}
              />
              <ConfigListManager
                title="Activity Types"
                items={activityTypes}
                onAdd={(data) => configMutation(api.entities.ActivityType.create(data))}
                onUpdate={(id, data) => configMutation(api.entities.ActivityType.update(id, data))}
                onDelete={(id) => configMutation(api.entities.ActivityType.delete(id))}
              />
              <ConfigListManager
                title="Account Tiers"
                items={accountTiers}
                onAdd={(data) => configMutation(api.entities.AccountTier.create(data))}
                onUpdate={(id, data) => configMutation(api.entities.AccountTier.update(id, data))}
                onDelete={(id) => configMutation(api.entities.AccountTier.delete(id))}
              />
              <ConfigListManager
                title="Industries"
                items={industries}
                onAdd={(data) => configMutation(api.entities.Industry.create(data))}
                onUpdate={(id, data) => configMutation(api.entities.Industry.update(id, data))}
                onDelete={(id) => configMutation(api.entities.Industry.delete(id))}
              />
            </div>
          </TabsContent>

          <TabsContent value="defaults" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Default Values</CardTitle>
                <CardDescription>Set default values for new records</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Monthly Sales Target</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={salesTargetInput}
                    onChange={(e) => setSalesTargetInput(e.target.value)}
                    onBlur={() => {
                      if (salesTargetInput.trim() === '') return;
                      const value = parseFloat(salesTargetInput);
                      if (Number.isNaN(value)) return;
                      handleUpdateSettings('monthly_sales_target', value);
                    }}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">
                    Shown on the CRM dashboard as the monthly revenue goal.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Input
                    value={defaultSettings?.default_currency || 'AED'}
                    onChange={(e) => handleUpdateSettings('default_currency', e.target.value)}
                    placeholder="AED"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Lead Stage</Label>
                  <Input
                    value={defaultSettings?.default_lead_stage || 'new'}
                    onChange={(e) => handleUpdateSettings('default_lead_stage', e.target.value)}
                    placeholder="new"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Account Tier</Label>
                  <Input
                    value={defaultSettings?.default_account_tier || 'Standard'}
                    onChange={(e) => handleUpdateSettings('default_account_tier', e.target.value)}
                    placeholder="Standard"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Follow-up Days After Activity</Label>
                  <Input
                    type="number"
                    value={defaultSettings?.default_follow_up_days || 3}
                    onChange={(e) =>
                      handleUpdateSettings('default_follow_up_days', parseInt(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Calendar View</Label>
                  <Select
                    value={defaultSettings?.default_calendar_view || 'month'}
                    onValueChange={(value) => handleUpdateSettings('default_calendar_view', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>First Day of Week</Label>
                  <Select
                    value={defaultSettings?.first_day_of_week || 'monday'}
                    onValueChange={(value) => handleUpdateSettings('first_day_of_week', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <EmailTemplatesPanel />
          </TabsContent>

          <TabsContent value="reference" className="space-y-4">
            <PortalReferencePanel />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <PortalUsersPanel />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Templates</CardTitle>
                <CardDescription>Download CSV templates for bulk imports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate('contacts')}
                  className="w-full sm:w-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Contacts Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate('accounts')}
                  className="w-full sm:w-auto ml-0 sm:ml-2"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Accounts Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate('leads')}
                  className="w-full sm:w-auto ml-0 sm:ml-2"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Leads Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>Export your CRM data to CSV</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => exportData('Contact')}
                  disabled={exportingEntity === 'Contact'}
                  className="w-full sm:w-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exportingEntity === 'Contact' ? 'Exporting…' : 'Export Contacts'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportData('Account')}
                  disabled={exportingEntity === 'Account'}
                  className="w-full sm:w-auto ml-0 sm:ml-2"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exportingEntity === 'Account' ? 'Exporting…' : 'Export Accounts'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportData('Lead')}
                  disabled={exportingEntity === 'Lead'}
                  className="w-full sm:w-auto ml-0 sm:ml-2"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exportingEntity === 'Lead' ? 'Exporting…' : 'Export Leads'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => exportData('Activity')}
                  disabled={exportingEntity === 'Activity'}
                  className="w-full sm:w-auto ml-0 sm:ml-2"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {exportingEntity === 'Activity' ? 'Exporting…' : 'Export Activities'}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-red-600">
                  Permanently delete all CRM data. This cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Type "RESET" to confirm</Label>
                  <Input
                    value={resetConfirmation}
                    onChange={(e) => setResetConfirmation(e.target.value)}
                    placeholder="RESET"
                    className="max-w-xs"
                  />
                </div>
                <Button
                  variant="destructive"
                  onClick={handleResetData}
                  disabled={resetConfirmation !== 'RESET'}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset All Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
