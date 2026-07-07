import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { showError, showInfo, showSuccess } from '@/lib/toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  UserCog,
  Plus,
  Mail,
  Shield,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  UserPlus,
  Send,
  Pencil,
} from 'lucide-react';
import { hasCrmModuleAccess, hasSupportModuleAccess, hasPbxModuleAccess } from '@/lib/permissions';
import { useAuth } from '@/lib/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { usePortalUserAdmin } from '@/hooks/usePortalUserAdmin';
import PasswordRequirements from '@/components/PasswordRequirements';
import UserRecordSearch from '@/components/settings/UserRecordSearch';
import { formatPasswordErrors, validatePassword } from '@/lib/passwordValidation';
import { createUserDetailUrl } from '@/lib/userManagementUrls';
import { domainsMatch } from '@shared/pbxDomainAccess.js';

export default function UserManagement({ embedded = false }) {
  const navigate = useNavigate();
  const { isLoadingAuth, isAuthenticated } = useAuth();
  const { isAdmin, isLoading: isPermissionsLoading } = usePermissions();
  const returnTo = embedded ? 'Settings' : 'UserManagement';

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSystemRole, setInviteSystemRole] = useState('user');
  const [invitePortalRoleId, setInvitePortalRoleId] = useState('');
  const [inviting, setInviting] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
    systemRole: 'user',
    portalRoleId: '',
    pbxDomainAccess: 'all',
    pbxDomains: [],
  });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: {},
  });
  const queryClient = useQueryClient();

  const {
    users,
    portalRoles,
    permissionGroups,
    systemModuleRoles,
    rolesById,
    pbxDomainCatalog,
    togglePbxDomain,
    isLoading,
    loadError,
    getRawRecord,
    getEffectivePermissions,
  } = usePortalUserAdmin();

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (b.role === 'admin' && a.role !== 'admin') return 1;
      return (a.full_name || a.email || '').localeCompare(b.full_name || b.email || '', undefined, {
        sensitivity: 'base',
      });
    });
  }, [users]);

  const defaultPortalRoleId = systemModuleRoles[0]?.id || '';
  const pbxRoleId = portalRoles.find((role) => role.slug === 'pbx')?.id || '';
  const pbxDomainRoleId = portalRoles.find((role) => role.slug === 'pbx_domain')?.id || '';

  const selectedAddRole = addForm.portalRoleId ? rolesById[addForm.portalRoleId] : null;
  const showPbxDomainAccess =
    addForm.systemRole === 'user' &&
    (selectedAddRole?.slug === 'pbx' || selectedAddRole?.slug === 'pbx_domain');

  const resolveCreateRoleAndDomains = () => {
    if (!showPbxDomainAccess) {
      return {
        portalRoleId: addForm.portalRoleId || undefined,
        pbxDomains: null,
      };
    }
    if (addForm.pbxDomainAccess === 'all') {
      return {
        portalRoleId: pbxRoleId || addForm.portalRoleId,
        pbxDomains: [],
      };
    }
    return {
      portalRoleId: pbxDomainRoleId || addForm.portalRoleId,
      pbxDomains: addForm.pbxDomains,
    };
  };

  useEffect(() => {
    if (defaultPortalRoleId && !addForm.portalRoleId) {
      setAddForm((f) => ({ ...f, portalRoleId: defaultPortalRoleId }));
    }
    if (defaultPortalRoleId && !invitePortalRoleId) {
      setInvitePortalRoleId(defaultPortalRoleId);
    }
  }, [defaultPortalRoleId, addForm.portalRoleId, invitePortalRoleId]);

  const openUserDetail = (user) => {
    navigate(createUserDetailUrl(user.id, returnTo));
  };

  const createRoleMutation = useMutation({
    mutationFn: (payload) => api.roles.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalRoles'] });
      setRoleDialogOpen(false);
      setEditingRoleId(null);
      showSuccess('Portal role created.');
    },
    onError: (error) => showError(error, 'Failed to create role'),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, payload }) => api.roles.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalRoles'] });
      queryClient.invalidateQueries({ queryKey: ['userPermissions'] });
      setRoleDialogOpen(false);
      setEditingRoleId(null);
      showSuccess('Portal role updated.');
    },
    onError: (error) => showError(error, 'Failed to update role'),
  });

  const openEditRoleDialog = (role) => {
    setEditingRoleId(role.id);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      permissions: { ...(role.permissions || {}) },
    });
    setRoleDialogOpen(true);
  };

  const handleRolePermissionToggle = (key, value) => {
    setRoleForm((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: value },
    }));
  };

  const handleRoleMasterToggle = (group, value) => {
    const updates = { [group.masterKey]: value };
    if (value) {
      for (const key of group.allKeys || []) updates[key] = true;
    }
    setRoleForm((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, ...updates },
    }));
  };

  const handleSaveRole = () => {
    if (!roleForm.name.trim()) {
      showInfo('Role name is required.');
      return;
    }
    const payload = {
      name: roleForm.name.trim(),
      description: roleForm.description.trim() || undefined,
      permissions: roleForm.permissions,
    };
    if (editingRoleId) {
      updateRoleMutation.mutate({ id: editingRoleId, payload });
    } else {
      createRoleMutation.mutate(payload);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const result = await api.users.inviteUser(
        inviteEmail,
        inviteSystemRole,
        inviteSystemRole === 'user' ? invitePortalRoleId : undefined
      );
      setInviteEmail('');
      setInviteSystemRole('user');
      setInvitePortalRoleId(defaultPortalRoleId);
      setInviteOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccess(
        result.email_sent
          ? `Invite email sent to ${result.email}.`
          : `Invite created for ${result.email}. The welcome email could not be sent — share the invite link manually.`
      );
    } catch (err) {
      showError(err, 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  const resetAddForm = () => {
    setAddForm({
      email: '',
      full_name: '',
      password: '',
      confirmPassword: '',
      systemRole: 'user',
      portalRoleId: defaultPortalRoleId,
      pbxDomainAccess: 'all',
      pbxDomains: [],
    });
    setAddError('');
  };

  const handleAddUser = async () => {
    setAddError('');
    const { email, full_name, password, confirmPassword, systemRole, portalRoleId } = addForm;
    if (!email?.trim()) {
      setAddError('Email is required');
      return;
    }
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      setAddError(formatPasswordErrors(passwordCheck.errors));
      return;
    }
    if (password !== confirmPassword) {
      setAddError('Passwords do not match');
      return;
    }
    if (
      showPbxDomainAccess &&
      addForm.pbxDomainAccess === 'specific' &&
      addForm.pbxDomains.length === 0
    ) {
      setAddError('Select at least one PBX domain, or choose All domains.');
      return;
    }
    setAdding(true);
    try {
      const { portalRoleId, pbxDomains } = resolveCreateRoleAndDomains();
      const { user } = await api.users.createUser({
        email: email.trim(),
        password,
        full_name: full_name.trim() || undefined,
        role: systemRole,
        portal_role_id: systemRole === 'user' ? portalRoleId : undefined,
        pbx_domains: pbxDomains,
      });
      resetAddForm();
      setAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userPermissions'] });
      if (user?.id) navigate(createUserDetailUrl(user.id, returnTo));
    } catch (err) {
      setAddError(err.message || 'Failed to create user');
    } finally {
      setAdding(false);
    }
  };

  if (isLoadingAuth || isPermissionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Loading portal users...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 gap-4">
        <ShieldAlert className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Access Restricted</h2>
        <p className="text-muted-foreground">You need admin privileges to view this page.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 gap-4 px-4 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load user management</h2>
        <p className="text-muted-foreground max-w-md">
          {loadError.message || 'An API request failed.'}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Loading portal users...</p>
      </div>
    );
  }

  const wrapperClass = embedded ? '' : 'p-4 sm:p-8 bg-gray-50 min-h-screen';

  return (
    <div className={wrapperClass}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            {!embedded && (
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UserCog className="w-6 h-6 text-primary" />
                Portal Users & Permissions
              </h1>
            )}
            {embedded && (
              <h2 className="text-lg font-semibold text-gray-900">Portal users & permissions</h2>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Portal User
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  resetAddForm();
                  setAddOpen(true);
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create portal account
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setInviteOpen(true)}>
                <Send className="w-4 h-4 mr-2" />
                Send invite link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900">Module roles</p>
              <p className="text-xs text-gray-500 mt-1">
                CRM, Support, and PBX — pick one per user, then adjust individual permissions on the
                user detail page. Choose <span className="font-medium">Administrator</span> when
                creating an account for full access without toggles.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-600">
              {systemModuleRoles.map((role) => (
                <div
                  key={role.id}
                  className="rounded border bg-white px-3 py-2 flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800">{role.name}</span>
                    </div>
                    {role.description ? (
                      <p className="mt-0.5 leading-snug">{role.description}</p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => openEditRoleDialog(role)}
                    title="View role permissions"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="py-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-900">Find user</p>
              <p className="text-xs text-gray-500 mt-1">
                Search by name or email to open a user&apos;s detail page.
              </p>
            </div>
            <UserRecordSearch users={sortedUsers} onSelectUser={openUserDetail} />
          </CardContent>
        </Card>

        <div className="space-y-3">
          {sortedUsers.map((user) => {
            const raw = getRawRecord(user.id);
            const perms = { ...getEffectivePermissions(user.id), isAdmin: false };
            const isUserAdmin = user.role === 'admin';
            const assignedRole = raw?.role_id ? rolesById[raw.role_id] : null;
            const isCustom = Boolean(raw?.use_custom_permissions);
            const detailUrl = createUserDetailUrl(user.id, returnTo);

            return (
              <Card key={user.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <Link
                  to={detailUrl}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                      {user.full_name?.charAt(0)?.toUpperCase() ||
                        user.email?.charAt(0)?.toUpperCase() ||
                        '?'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {user.full_name || '—'}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!isUserAdmin && (
                      <div className="hidden md:flex items-center gap-1.5">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${hasCrmModuleAccess(perms) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}
                        >
                          CRM
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${hasSupportModuleAccess(perms) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}
                        >
                          Support
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${hasPbxModuleAccess(perms) ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-400'}`}
                        >
                          PBX
                        </span>
                      </div>
                    )}
                    {isUserAdmin ? (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    ) : (
                      <>
                        <Badge variant="outline" className="hidden sm:inline-flex">
                          {assignedRole?.name || 'No role'}
                        </Badge>
                        {isCustom && (
                          <Badge variant="secondary" className="hidden sm:inline-flex">
                            Custom
                          </Badge>
                        )}
                        {user.mfa_email_enabled && (
                          <Badge
                            variant="outline"
                            className="hidden sm:inline-flex border-green-300 text-green-700"
                          >
                            Email MFA
                          </Badge>
                        )}
                      </>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>
              </Card>
            );
          })}

          {sortedUsers.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-gray-400">No users found.</CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) resetAddForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Portal User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Full Name</Label>
              <Input
                placeholder="Jane Smith"
                value={addForm.full_name}
                onChange={(e) => setAddForm((f) => ({ ...f, full_name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={addForm.email}
                onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Strong password required"
                value={addForm.password}
                onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                className="mt-1"
              />
              <PasswordRequirements password={addForm.password} className="mt-2" />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={addForm.confirmPassword}
                onChange={(e) => setAddForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
                className="mt-1"
              />
            </div>
            <div>
              <Label>System access</Label>
              <Select
                value={addForm.systemRole}
                onValueChange={(systemRole) => setAddForm((f) => ({ ...f, systemRole }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Portal user</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {addForm.systemRole === 'user' && (
              <div>
                <Label>Portal role</Label>
                <Select
                  value={addForm.portalRoleId}
                  onValueChange={(portalRoleId) => {
                    const role = rolesById[portalRoleId];
                    setAddForm((f) => ({
                      ...f,
                      portalRoleId,
                      pbxDomainAccess:
                        role?.slug === 'pbx_domain'
                          ? 'specific'
                          : role?.slug === 'pbx'
                            ? 'all'
                            : f.pbxDomainAccess,
                      pbxDomains: role?.slug === 'pbx' ? [] : f.pbxDomains,
                    }));
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemModuleRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {showPbxDomainAccess && (
              <div className="rounded-lg border bg-gray-50 p-3 space-y-3">
                <div>
                  <Label>PBX domain access</Label>
                  <p className="text-xs text-gray-500 mt-1">
                    All domains uses full PBX access. Specific domains limits the user to selected
                    SkySwitch domains.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pbx-domain-access"
                      checked={addForm.pbxDomainAccess === 'all'}
                      onChange={() =>
                        setAddForm((f) => ({
                          ...f,
                          pbxDomainAccess: 'all',
                          pbxDomains: [],
                          portalRoleId: pbxRoleId || f.portalRoleId,
                        }))
                      }
                    />
                    All domains
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="pbx-domain-access"
                      checked={addForm.pbxDomainAccess === 'specific'}
                      onChange={() =>
                        setAddForm((f) => ({
                          ...f,
                          pbxDomainAccess: 'specific',
                          portalRoleId: pbxDomainRoleId || f.portalRoleId,
                        }))
                      }
                    />
                    Specific domains
                  </label>
                </div>
                {addForm.pbxDomainAccess === 'specific' ? (
                  pbxDomainCatalog.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No domains loaded. Check SkySwitch connection or assign domains after creation.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {pbxDomainCatalog.map((entry) => {
                        const name = entry.domain || entry;
                        const selected = addForm.pbxDomains.some((d) => domainsMatch(d, name));
                        return (
                          <button
                            key={name}
                            type="button"
                            className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                              selected
                                ? 'bg-purple-100 border-purple-300 text-purple-900'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                            onClick={() =>
                              setAddForm((f) => ({
                                ...f,
                                pbxDomains: togglePbxDomain(f.pbxDomains, name),
                              }))
                            }
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  )
                ) : null}
              </div>
            )}
            {addError && <p className="text-sm text-red-600">{addError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={!addForm.email || !addForm.password || adding}
            >
              {adding ? 'Creating...' : 'Create Portal User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={roleDialogOpen}
        onOpenChange={(open) => {
          setRoleDialogOpen(open);
          if (!open) setEditingRoleId(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRoleId
                ? portalRoles.find((r) => r.id === editingRoleId)?.is_system
                  ? 'View portal role'
                  : 'Edit portal role'
                : 'Create portal role'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Name</Label>
              <Input
                value={roleForm.name}
                onChange={(e) => setRoleForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Sales Rep"
                className="mt-1"
                disabled={
                  editingRoleId && portalRoles.find((r) => r.id === editingRoleId)?.is_system
                }
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={roleForm.description}
                onChange={(e) => setRoleForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional summary for admins"
                className="mt-1"
                disabled={
                  editingRoleId && portalRoles.find((r) => r.id === editingRoleId)?.is_system
                }
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {permissionGroups.map((group) => {
                const isSystemRole =
                  editingRoleId && portalRoles.find((r) => r.id === editingRoleId)?.is_system;
                const hasFullModuleAccess = group.masterKey
                  ? Boolean(roleForm.permissions[group.masterKey])
                  : false;
                return (
                  <div key={group.id} className="rounded-lg border p-3 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <span className="font-medium text-sm">{group.label}</span>
                      {group.masterKey && !isSystemRole ? (
                        <Switch
                          checked={Boolean(roleForm.permissions[group.masterKey])}
                          onCheckedChange={(val) => handleRoleMasterToggle(group, val)}
                        />
                      ) : null}
                    </div>
                    {group.masterKey && !isSystemRole ? (
                      <p className="text-[10px] text-gray-500 mb-2 leading-snug">
                        {hasFullModuleAccess
                          ? 'Full module access — all permissions enabled.'
                          : 'Pick individual permissions, or enable full access.'}
                      </p>
                    ) : null}
                    <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                      {group.sections?.map((section) => (
                        <div key={section.label}>
                          <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">
                            {section.label}
                          </p>
                          <div className="space-y-1.5">
                            {section.permissions.map((perm) => (
                              <div
                                key={perm.key}
                                className="flex items-center justify-between gap-2"
                              >
                                <Label className="text-xs font-normal text-gray-600 leading-snug">
                                  {perm.label}
                                </Label>
                                <Switch
                                  checked={Boolean(roleForm.permissions[perm.key])}
                                  disabled={isSystemRole}
                                  onCheckedChange={(val) =>
                                    handleRolePermissionToggle(perm.key, val)
                                  }
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            {!(editingRoleId && portalRoles.find((r) => r.id === editingRoleId)?.is_system) && (
              <Button
                onClick={handleSaveRole}
                disabled={
                  !roleForm.name.trim() ||
                  createRoleMutation.isPending ||
                  updateRoleMutation.isPending
                }
              >
                {createRoleMutation.isPending || updateRoleMutation.isPending
                  ? 'Saving...'
                  : editingRoleId
                    ? 'Save role'
                    : 'Create role'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Portal User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                className="mt-1"
              />
            </div>
            <div>
              <Label>System access</Label>
              <Select value={inviteSystemRole} onValueChange={setInviteSystemRole}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Portal user</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {inviteSystemRole === 'user' && (
              <div>
                <Label>Portal role</Label>
                <Select value={invitePortalRoleId} onValueChange={setInvitePortalRoleId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {systemModuleRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInvite} disabled={!inviteEmail || inviting}>
              {inviting ? 'Sending...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
