import React, { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { pbxApi } from '@/api/pbx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Settings,
  RefreshCw,
  Power,
  Mail,
  Loader2,
} from 'lucide-react';

async function settleSelected(items, worker) {
  const results = await Promise.allSettled(items.map(worker));
  const failed = results.filter((r) => r.status === 'rejected').length;
  return { total: results.length, failed, ok: results.length - failed };
}

function reportBatch(label, { total, failed, ok }) {
  if (!total) {
    toast.error(`No eligible endpoints for ${label}`);
    return;
  }
  if (failed === 0) toast.success(`${label}: ${ok} of ${total} succeeded`);
  else if (ok === 0) toast.error(`${label}: all ${total} failed`);
  else toast.warning(`${label}: ${ok} succeeded, ${failed} failed`);
}

/**
 * Header gear bulk Actions for Endpoint Control.
 * Menu matches SkySwitch-style Actions; wired to PBX APIs where available.
 */
export default function BulkEndpointActions({
  domain,
  selectedRows,
  disabled = false,
  onSuccess,
}) {
  const [overridesOpen, setOverridesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [overridesText, setOverridesText] = useState('');
  const [settingsForm, setSettingsForm] = useState({
    site: '',
    department: '',
    notes: '',
    email: '',
  });

  const selectedWithMac = useMemo(
    () =>
      selectedRows.filter((row) => {
        const mac = row.mac_address || row.mac;
        return mac && String(mac).trim();
      }),
    [selectedRows]
  );

  const uniqueMacs = useMemo(() => {
    const macs = selectedWithMac
      .map((row) => String(row.mac_address || row.mac).trim())
      .filter(Boolean);
    return [...new Set(macs)];
  }, [selectedWithMac]);

  const extensionUsers = useMemo(() => {
    return [
      ...new Set(
        selectedRows
          .filter((row) => row.user && !row.is_phone_inventory)
          .map((row) => String(row.user))
      ),
    ];
  }, [selectedRows]);

  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!uniqueMacs.length) throw new Error('Select endpoints that have a MAC address');
      return settleSelected(uniqueMacs, (mac) => pbxApi.resyncPhone(mac, domain));
    },
    onSuccess: (summary) => {
      reportBatch('Sync Phone Endpoints', summary);
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message || 'Sync failed'),
  });

  const rebootMutation = useMutation({
    mutationFn: async () => {
      if (!uniqueMacs.length) throw new Error('Select endpoints that have a MAC address');
      // NetSapiens reboot/resync for provisioned phones is device update with check-sync=yes
      // (same API as Sync). See apiDocumentationPBX.md "Resync Phone".
      return settleSelected(uniqueMacs, (mac) => pbxApi.resyncPhone(mac, domain));
    },
    onSuccess: (summary) => {
      reportBatch('Reboot Endpoints (check-sync)', summary);
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message || 'Reboot request failed'),
  });

  const overridesMutation = useMutation({
    mutationFn: async () => {
      if (!uniqueMacs.length) throw new Error('Select endpoints that have a MAC address');
      return settleSelected(uniqueMacs, (mac) =>
        pbxApi.updatePhoneOverrides(mac, domain, overridesText)
      );
    },
    onSuccess: (summary) => {
      reportBatch('Bulk Update Overrides', summary);
      setOverridesOpen(false);
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message || 'Overrides update failed'),
  });

  const settingsMutation = useMutation({
    mutationFn: async () => {
      if (!extensionUsers.length) {
        throw new Error('Select one or more extensions (not phone-only rows)');
      }
      const body = {};
      if (settingsForm.site.trim()) body.site = settingsForm.site.trim();
      if (settingsForm.department.trim()) body.department = settingsForm.department.trim();
      if (settingsForm.notes.trim()) body.notes = settingsForm.notes.trim();
      if (settingsForm.email.trim()) body.email = settingsForm.email.trim();
      if (!Object.keys(body).length) {
        throw new Error('Enter at least one field to update');
      }
      return settleSelected(extensionUsers, (user) =>
        pbxApi.updateEndpointSubscriber(domain, user, body)
      );
    },
    onSuccess: (summary) => {
      reportBatch('Update Endpoint Settings', summary);
      setSettingsOpen(false);
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message || 'Settings update failed'),
  });

  const actionPending =
    syncMutation.isPending ||
    rebootMutation.isPending ||
    overridesMutation.isPending ||
    settingsMutation.isPending;

  const selectionCount = selectedRows.length;
  const hasSelection = selectionCount > 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={!hasSelection || disabled || actionPending}
            className={`inline-flex h-7 w-7 items-center justify-center rounded ${
              hasSelection
                ? 'text-gray-700 hover:bg-gray-200'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={
              hasSelection
                ? 'Actions for selected endpoints'
                : 'Select one or more endpoints'
            }
          >
            {actionPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Settings className="h-4 w-4" aria-hidden />
            )}
            <span className="sr-only">Actions</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={!uniqueMacs.length || actionPending}
            className="text-red-600 focus:text-red-700"
            onClick={() => {
              if (
                !window.confirm(
                  `Send check-sync (reboot/resync) to ${uniqueMacs.length} phone(s)? Devices may reboot to pull config.`
                )
              ) {
                return;
              }
              rebootMutation.mutate();
            }}
          >
            <Power className="h-4 w-4 mr-2 text-red-600" />
            Reboot Endpoints
            {uniqueMacs.length ? ` (${uniqueMacs.length})` : ''}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!extensionUsers.length || actionPending}
            onClick={() => {
              setSettingsForm({ site: '', department: '', notes: '', email: '' });
              setSettingsOpen(true);
            }}
          >
            <Settings className="h-4 w-4 mr-2 text-blue-600" />
            Update Endpoint Settings
            {extensionUsers.length ? ` (${extensionUsers.length})` : ''}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!uniqueMacs.length || actionPending}
            onClick={() => {
              const shared = selectedWithMac[0]?.overrides;
              const allSame =
                selectedWithMac.length > 0 &&
                selectedWithMac.every((row) => (row.overrides || '') === (shared || ''));
              setOverridesText(allSame ? shared || '' : '');
              setOverridesOpen(true);
            }}
          >
            <Settings className="h-4 w-4 mr-2 text-blue-600" />
            Bulk Update Overrides
            {uniqueMacs.length ? ` (${uniqueMacs.length})` : ''}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={!uniqueMacs.length || actionPending}
            onClick={() => syncMutation.mutate()}
          >
            <RefreshCw className="h-4 w-4 mr-2 text-blue-600" />
            Sync Phone Endpoints
            {uniqueMacs.length ? ` (${uniqueMacs.length})` : ''}
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled
            onSelect={(e) => e.preventDefault()}
            title="PBX welcome email is not exposed by the available APIs"
          >
            <Mail className="h-4 w-4 mr-2 text-emerald-600" />
            Send Welcome Email
            <span className="ml-auto text-[10px] text-gray-400">N/A</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={overridesOpen} onOpenChange={setOverridesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update Overrides</DialogTitle>
            <DialogDescription>
              Apply provisioning overrides to {uniqueMacs.length} selected phone
              {uniqueMacs.length === 1 ? '' : 's'} (MAC update API).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="bulk-overrides">Overrides</Label>
            <Textarea
              id="bulk-overrides"
              rows={8}
              value={overridesText}
              onChange={(e) => setOverridesText(e.target.value)}
              placeholder="key=value pairs / vendor override text"
              className="font-mono text-xs"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOverridesOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={overridesMutation.isPending}
              onClick={() => overridesMutation.mutate()}
            >
              {overridesMutation.isPending ? 'Saving…' : 'Apply overrides'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Endpoint Settings</DialogTitle>
            <DialogDescription>
              Update subscriber fields for {extensionUsers.length} selected extension
              {extensionUsers.length === 1 ? '' : 's'}. Leave a field blank to skip it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label htmlFor="bulk-site">Site</Label>
              <Input
                id="bulk-site"
                value={settingsForm.site}
                onChange={(e) => setSettingsForm((f) => ({ ...f, site: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="bulk-dept">Department</Label>
              <Input
                id="bulk-dept"
                value={settingsForm.department}
                onChange={(e) => setSettingsForm((f) => ({ ...f, department: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="bulk-email">Email</Label>
              <Input
                id="bulk-email"
                type="email"
                value={settingsForm.email}
                onChange={(e) => setSettingsForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="bulk-notes">Notes</Label>
              <Textarea
                id="bulk-notes"
                rows={3}
                value={settingsForm.notes}
                onChange={(e) => setSettingsForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={settingsMutation.isPending}
              onClick={() => settingsMutation.mutate()}
            >
              {settingsMutation.isPending ? 'Saving…' : 'Update settings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
