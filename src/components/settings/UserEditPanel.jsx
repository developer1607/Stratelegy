import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PasswordRequirements from '@/components/PasswordRequirements';
import { useAuth } from '@/lib/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { hasCrmModuleAccess, hasSupportModuleAccess, hasPbxModuleAccess } from '@/lib/permissions';
import { TICKET_DEPARTMENTS, TICKET_CATEGORIES } from '@/lib/ticketConstants';
import { parseRoutingList, toggleRoutingItem } from '@/lib/userRouting';
import { parsePbxDomains, domainsMatch } from '@shared/pbxDomainAccess.js';
import { usePortalUserAdmin } from '@/hooks/usePortalUserAdmin';
import {
  Shield,
  KeyRound,
  RotateCcw,
  Briefcase,
  HeadphonesIcon,
  Phone,
  Trash2,
} from 'lucide-react';

export default function UserEditPanel({ user, onDeleted }) {
  const { user: currentUser } = useAuth();
  const { isAdmin } = usePermissions();
  const admin = usePortalUserAdmin();

  const {
    permissionGroups,
    pbxDomainCatalog,
    systemModuleRoles,
    getRawRecord,
    getEffectivePermissions,
    togglePbxDomain,
    getResetPasswordForm,
    setResetPasswordField,
    handleResetPassword,
    handleRoleChange,
    handleToggle,
    handleMasterToggle,
    handleBatchToggle,
    handleResetToRole,
    resetPasswordMutation,
    updateMfaMutation,
    supportRoutingMutation,
    pbxDomainsMutation,
    deleteUserMutation,
    updatePermissionMutation,
    assignRoleMutation,
  } = admin;

  const raw = getRawRecord(user.id);
  const perms = { ...getEffectivePermissions(user.id), isAdmin: false };
  const isUserAdmin = user.role === 'admin';
  const assignedRole = raw?.role_id ? admin.rolesById[raw.role_id] : null;
  const roleSelectValue = raw?.role_id || 'none';

  const handleDelete = () => {
    const label = user.full_name || user.email;
    if (!window.confirm(`Delete user "${label}"? They will lose access immediately.`)) return;
    deleteUserMutation.mutate(user.id, { onSuccess: () => onDeleted?.() });
  };

  return (
    <div className="space-y-4">
      {currentUser?.id && user.id !== currentUser.id && (
        <div className="p-4 rounded-lg border bg-white space-y-3">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm text-gray-900">Reset password</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">New password</Label>
              <Input
                type="password"
                autoComplete="new-password"
                value={getResetPasswordForm(user.id).password}
                onChange={(e) => setResetPasswordField(user.id, 'password', e.target.value)}
                placeholder="Strong password required"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Confirm password</Label>
              <Input
                type="password"
                autoComplete="new-password"
                value={getResetPasswordForm(user.id).confirmPassword}
                onChange={(e) => setResetPasswordField(user.id, 'confirmPassword', e.target.value)}
                placeholder="Re-enter password"
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleResetPassword(user);
                  }
                }}
              />
            </div>
          </div>
          <PasswordRequirements password={getResetPasswordForm(user.id).password} />
          {getResetPasswordForm(user.id).error && (
            <p className="text-sm text-red-600">{getResetPasswordForm(user.id).error}</p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={resetPasswordMutation.isPending || !getResetPasswordForm(user.id).password}
            onClick={() => handleResetPassword(user)}
          >
            {resetPasswordMutation.isPending ? 'Updating...' : 'Update password'}
          </Button>
        </div>
      )}

      {!isUserAdmin && (
        <div className="p-4 rounded-lg border bg-white space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm text-gray-900">Email MFA</span>
          </div>
          <p className="text-xs text-gray-600">
            Sign-in codes are sent to the user&apos;s account email only — not SMS or phone. Users
            can also enable MFA on their profile unless you require it.
          </p>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm">Enabled</Label>
              <p className="text-xs text-gray-500">User must enter an email code when signing in</p>
            </div>
            <Switch
              checked={Boolean(user.mfa_email_enabled)}
              disabled={updateMfaMutation.isPending}
              onCheckedChange={(checked) =>
                updateMfaMutation.mutate({
                  userId: user.id,
                  enabled: checked,
                  forced: user.mfa_email_forced,
                })
              }
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm">Required (admin lock)</Label>
              <p className="text-xs text-gray-500">User cannot disable MFA on their profile</p>
            </div>
            <Switch
              checked={Boolean(user.mfa_email_forced)}
              disabled={updateMfaMutation.isPending || !user.mfa_email_enabled}
              onCheckedChange={(forced) =>
                updateMfaMutation.mutate({ userId: user.id, enabled: true, forced })
              }
            />
          </div>
        </div>
      )}

      {isUserAdmin ? (
        <p className="text-sm text-gray-600 p-4 rounded-lg border bg-white">
          Administrator accounts have full access to all modules. Portal roles and permission toggles
          do not apply.
        </p>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-4 rounded-lg border bg-white">
            <div className="flex-1">
              <Label className="text-xs uppercase tracking-wide text-gray-500">Portal role</Label>
              <Select
                value={roleSelectValue}
                onValueChange={(roleId) => {
                  if (roleId !== 'none') handleRoleChange(user, roleId);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a portal role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>
                    Select a portal role
                  </SelectItem>
                  {systemModuleRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!raw?.role_id || assignRoleMutation.isPending}
              onClick={() => handleResetToRole(user)}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to role
            </Button>
          </div>

          {hasSupportModuleAccess(perms) && (
            <div className="p-4 rounded-lg border bg-white space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Ticket routing</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Optional filters for auto-assign and assignee lists. Leave empty to handle any
                  ticket.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Departments</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {TICKET_DEPARTMENTS.map((dept) => {
                      const selected = parseRoutingList(user.departments).includes(dept.value);
                      return (
                        <button
                          key={dept.value}
                          type="button"
                          className={`px-2 py-1 rounded text-xs border ${
                            selected
                              ? 'bg-green-100 border-green-300 text-green-800'
                              : 'bg-gray-50 border-gray-200 text-gray-600'
                          }`}
                          onClick={() => {
                            const next = toggleRoutingItem(
                              parseRoutingList(user.departments),
                              dept.value
                            );
                            supportRoutingMutation.mutate({
                              userId: user.id,
                              departments: next.join(','),
                              categories: user.categories || '',
                            });
                          }}
                        >
                          {dept.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Categories</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {TICKET_CATEGORIES.map((cat) => {
                      const selected = parseRoutingList(user.categories).includes(cat.value);
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          className={`px-2 py-1 rounded text-xs border ${
                            selected
                              ? 'bg-blue-100 border-blue-300 text-blue-800'
                              : 'bg-gray-50 border-gray-200 text-gray-600'
                          }`}
                          onClick={() => {
                            const next = toggleRoutingItem(
                              parseRoutingList(user.categories),
                              cat.value
                            );
                            supportRoutingMutation.mutate({
                              userId: user.id,
                              departments: user.departments || '',
                              categories: next.join(','),
                            });
                          }}
                        >
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(assignedRole?.slug === 'pbx_domain' || perms.can_access_pbx_domain_scoped) && (
            <div className="p-4 rounded-lg border bg-white space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-900">PBX domains</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Assign one or more SkySwitch domains this user can access. They will only see data
                  for selected domains across PBX screens.
                </p>
              </div>
              {pbxDomainCatalog.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No domains loaded. Check SkySwitch connection or assign domains after PBX is
                  configured.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {pbxDomainCatalog.map((entry) => {
                    const name = entry.domain || entry;
                    const selected = parsePbxDomains(raw?.pbx_domains).some((d) =>
                      domainsMatch(d, name)
                    );
                    return (
                      <button
                        key={name}
                        type="button"
                        className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                          selected
                            ? 'bg-purple-100 border-purple-300 text-purple-900'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                        disabled={pbxDomainsMutation.isPending}
                        onClick={() => {
                          const next = togglePbxDomain(raw?.pbx_domains, name);
                          pbxDomainsMutation.mutate({ userId: user.id, domains: next });
                        }}
                      >
                        {name}
                      </button>
                    );
                  })}
                </div>
              )}
              {parsePbxDomains(raw?.pbx_domains).length === 0 && (
                <p className="text-xs text-amber-700">
                  Select at least one domain — this user cannot access PBX data until a domain is
                  assigned.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {permissionGroups.map((group) => {
              const hasFullModuleAccess = group.masterKey ? Boolean(perms[group.masterKey]) : false;
              return (
                <div key={group.id} className="rounded-lg border p-4 bg-white">
                  <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {group.icon === 'crm' ? (
                        <Briefcase className="w-4 h-4 text-blue-600" />
                      ) : group.icon === 'pbx' ? (
                        <Phone className="w-4 h-4 text-purple-600" />
                      ) : (
                        <HeadphonesIcon className="w-4 h-4 text-green-600" />
                      )}
                      <span className="font-semibold text-sm text-gray-800">{group.label}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {group.screenKeys?.length ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={updatePermissionMutation.isPending}
                            onClick={() => handleBatchToggle(user, group.screenKeys, true)}
                          >
                            All screens
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={updatePermissionMutation.isPending}
                            onClick={() => handleBatchToggle(user, group.screenKeys, false)}
                          >
                            No screens
                          </Button>
                        </>
                      ) : null}
                      {group.actionKeys?.length ? (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={updatePermissionMutation.isPending}
                            onClick={() => handleBatchToggle(user, group.actionKeys, true)}
                          >
                            All actions
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            disabled={updatePermissionMutation.isPending}
                            onClick={() => handleBatchToggle(user, group.actionKeys, false)}
                          >
                            No actions
                          </Button>
                        </>
                      ) : null}
                      {group.masterKey ? (
                        <Switch
                          checked={Boolean(perms[group.masterKey])}
                          disabled={updatePermissionMutation.isPending}
                          onCheckedChange={(val) => handleMasterToggle(user, group, val)}
                        />
                      ) : null}
                    </div>
                  </div>
                  {group.masterKey ? (
                    <p className="text-[11px] text-gray-500 mb-3 leading-snug">
                      {hasFullModuleAccess
                        ? 'Full module access is on — all screens and actions below are enabled.'
                        : 'Turn on full access for everything, or pick individual screens and actions below.'}
                    </p>
                  ) : null}
                  <div className="space-y-4 pl-1 max-h-[420px] overflow-y-auto pr-1">
                    {group.sections?.map((section) => (
                      <div key={section.label}>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          {section.label}
                        </p>
                        <div className="space-y-2">
                          {section.permissions.map((perm) => (
                            <div
                              key={perm.key}
                              className="flex items-center justify-between gap-2"
                            >
                              <Label className="text-xs font-normal text-gray-600 cursor-pointer leading-snug">
                                {perm.label}
                              </Label>
                              <Switch
                                checked={Boolean(perms[perm.key])}
                                disabled={updatePermissionMutation.isPending}
                                onCheckedChange={(val) => handleToggle(user, perm.key, val)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {isAdmin && currentUser?.id && user.id !== currentUser.id && (
        <div className="p-4 rounded-lg border border-red-200 bg-red-50/50 space-y-3">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-600" />
            <span className="font-medium text-sm text-gray-900">Delete user</span>
          </div>
          <p className="text-sm text-gray-600">
            Permanently remove {user.full_name || user.email} from the portal. This cannot be
            undone.
          </p>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={deleteUserMutation.isPending}
            onClick={handleDelete}
          >
            {deleteUserMutation.isPending ? 'Deleting...' : 'Delete user'}
          </Button>
        </div>
      )}
    </div>
  );
}
