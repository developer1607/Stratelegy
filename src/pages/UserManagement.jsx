import React, { useState, useEffect, useMemo } from 'react';
import { api } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  ChevronUp,
  ShieldAlert,
  Briefcase,
  HeadphonesIcon,
  Phone,
  UserPlus,
  Send,
  RotateCcw,
  KeyRound,
  Pencil,
  Trash2,
} from 'lucide-react';
import { computeEffectivePermissions } from '@/lib/portalPermissions';
import { hasCrmModuleAccess, hasSupportModuleAccess, hasPbxModuleAccess } from '@/lib/permissions';
import { useAuth } from '@/lib/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import PasswordRequirements from '@/components/PasswordRequirements';
import { formatPasswordErrors, validatePassword } from '@/lib/passwordValidation';
import { TICKET_DEPARTMENTS, TICKET_CATEGORIES } from '@/lib/ticketConstants';
import { parseRoutingList, toggleRoutingItem } from '@/lib/userRouting';
import { pbxApi } from '@/api/pbx';
import { parsePbxDomains, domainsMatch } from '@shared/pbxDomainAccess.js';

export default function UserManagement({ embedded = false }) {
  const { user: currentUser, isLoadingAuth, isAuthenticated } = useAuth();
  const { isAdmin, isLoading: isPermissionsLoading } = usePermissions();
  const [expandedUser, setExpandedUser] = useState(null);
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
  });
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [resetPasswordByUser, setResetPasswordByUser] = useState({});
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: {},
  });
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.entities.User.list(),
    enabled: isAdmin && !isLoadingAuth,
  });

  const {
    data: portalRoles = [],
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ['portalRoles'],
    queryFn: () => api.roles.list(),
    enabled: isAdmin && !isLoadingAuth,
  });

  const {
    data: allPermissions = [],
    isLoading: permsLoading,
    error: permsError,
  } = useQuery({
    queryKey: ['userPermissions'],
    queryFn: () => api.entities.UserPermissions.filter({}),
    staleTime: 0,
    refetchOnMount: 'always',
    enabled: isAdmin && !isLoadingAuth,
  });

  const { data: permissionDefs, error: defsError } = useQuery({
    queryKey: ['permissionDefinitions'],
    queryFn: () => api.permissions.definitions(),
    enabled: isAdmin && !isLoadingAuth,
  });

  const permissionGroups = permissionDefs?.groups || [];

  const rolesById = useMemo(
    () => Object.fromEntries(portalRoles.map((role) => [role.id, role])),
    [portalRoles]
  );

  const systemModuleRoles = useMemo(
    () => portalRoles.filter((role) => role.is_system),
    [portalRoles]
  );

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

  useEffect(() => {
    if (defaultPortalRoleId && !addForm.portalRoleId) {
      setAddForm((f) => ({ ...f, portalRoleId: defaultPortalRoleId }));
    }
    if (defaultPortalRoleId && !invitePortalRoleId) {
      setInvitePortalRoleId(defaultPortalRoleId);
    }
  }, [defaultPortalRoleId, addForm.portalRoleId, invitePortalRoleId]);

  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }) => api.users.assignPortalRole(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPermissions'] });
    },
    onError: (error) => showError(error, 'Failed to assign role'),
  });

  const updatePermissionMutation = useMutation({
    mutationFn: ({ userId, updates }) => api.users.updatePermissions(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPermissions'] });
    },
    onError: (error) => showError(error, 'Failed to update permission'),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ userId, password }) => api.users.setPassword(userId, password),
    onSuccess: (_data, { userId }) => {
      setResetPasswordByUser((prev) => ({
        ...prev,
        [userId]: { password: '', confirmPassword: '', error: '' },
      }));
      showSuccess('Password updated.');
    },
    onError: (error, { userId }) => {
      setResetPasswordByUser((prev) => ({
        ...prev,
        [userId]: {
          ...(prev[userId] || { password: '', confirmPassword: '' }),
          error: error.message || 'Failed to reset password',
        },
      }));
    },
  });

  const updateMfaMutation = useMutation({
    mutationFn: ({ userId, enabled, forced }) => api.users.updateMfa(userId, { enabled, forced }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showSuccess('Email MFA settings updated.');
    },
    onError: (error) => showError(error, 'Failed to update email MFA'),
  });

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

  const deleteRoleMutation = useMutation({
    mutationFn: (id) => api.roles.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalRoles'] });
      showSuccess('Portal role deleted.');
    },
    onError: (error) => showError(error, 'Failed to delete role'),
  });

  const supportRoutingMutation = useMutation({
    mutationFn: ({ userId, departments, categories }) =>
      api.users.updateSupportRouting(userId, { departments, categories }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => showError(error, 'Failed to update ticket routing'),
  });

  const pbxDomainsMutation = useMutation({
    mutationFn: ({ userId, domains }) => api.users.updatePbxDomains(userId, domains),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPermissions'] });
      showSuccess('PBX domains updated.');
    },
    onError: (error) => showError(error, 'Failed to update PBX domains'),
  });

  const { data: pbxDomainCatalog = [] } = useQuery({
    queryKey: ['pbx-domains-admin-catalog'],
    queryFn: () => pbxApi.domains(),
    enabled: isAdmin && !isLoadingAuth,
    staleTime: 5 * 60 * 1000,
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => api.users.delete(userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userPermissions'] });
      if (expandedUser === userId) setExpandedUser(null);
      showSuccess('User deleted.');
    },
    onError: (error) => showError(error, 'Failed to delete user'),
  });

  const getResetPasswordForm = (userId) =>
    resetPasswordByUser[userId] || { password: '', confirmPassword: '', error: '' };

  const setResetPasswordField = (userId, field, value) => {
    setResetPasswordByUser((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || { password: '', confirmPassword: '', error: '' }),
        [field]: value,
        error: '',
      },
    }));
  };

  const handleResetPassword = (user) => {
    const form = getResetPasswordForm(user.id);
    const passwordCheck = validatePassword(form.password);
    if (!passwordCheck.valid) {
      setResetPasswordField(user.id, 'error', formatPasswordErrors(passwordCheck.errors));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setResetPasswordField(user.id, 'error', 'Passwords do not match');
      return;
    }
    resetPasswordMutation.mutate({ userId: user.id, password: form.password });
  };

  const getRawRecord = (userId) => allPermissions.find((p) => p.user_id === userId) || null;

  const togglePbxDomain = (list, domainName) => {
    const current = parsePbxDomains(list);
    const exists = current.some((d) => domainsMatch(d, domainName));
    if (exists) return current.filter((d) => !domainsMatch(d, domainName));
    return [...current, domainName];
  };

  const getEffectivePermissions = (userId) => {
    const record = getRawRecord(userId);
    return computeEffectivePermissions(record, rolesById);
  };

  const handleRoleChange = (user, roleId) => {
    if (!roleId) return;
    assignRoleMutation.mutate({ userId: user.id, roleId });
  };

  const handleToggle = (user, key, value) => {
    updatePermissionMutation.mutate({
      userId: user.id,
      updates: { [key]: value },
    });
  };

  const handleMasterToggle = (user, group, value) => {
    const updates = { [group.masterKey]: value };
    if (value) {
      for (const key of group.allKeys || []) {
        updates[key] = true;
      }
    }
    updatePermissionMutation.mutate({ userId: user.id, updates });
  };

  const handleBatchToggle = (user, keys, value) => {
    if (!keys?.length) return;
    const updates = Object.fromEntries(keys.map((key) => [key, value]));
    updatePermissionMutation.mutate({ userId: user.id, updates });
  };

  const openCreateRoleDialog = () => {
    setEditingRoleId(null);
    setRoleForm({ name: '', description: '', permissions: {} });
    setRoleDialogOpen(true);
  };

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
      for (const key of group.allKeys || []) {
        updates[key] = true;
      }
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

  const handleResetToRole = (user) => {
    const record = getRawRecord(user.id);
    if (!record?.role_id) {
      showInfo('Assign a portal role first.');
      return;
    }
    assignRoleMutation.mutate({ userId: user.id, roleId: record.role_id });
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
    setAdding(true);
    try {
      const { user } = await api.users.createUser({
        email: email.trim(),
        password,
        full_name: full_name.trim() || undefined,
        role: systemRole,
        portal_role_id: systemRole === 'user' ? portalRoleId : undefined,
      });
      resetAddForm();
      setAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userPermissions'] });
      if (user?.id) setExpandedUser(user.id);
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

  const loadError = usersError || rolesError || permsError || defsError;
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

  if (usersLoading || permsLoading || rolesLoading) {
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
                CRM, Support, and PBX — pick one per user, then adjust individual permissions below.
                Choose <span className="font-medium">Administrator</span> when creating an account for
                full access without toggles.
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

        <div className="space-y-3">
          {sortedUsers.map((user) => {
            const raw = getRawRecord(user.id);
            const perms = { ...getEffectivePermissions(user.id), isAdmin: false };
            const isExpanded = expandedUser === user.id;
            const isUserAdmin = user.role === 'admin';
            const assignedRole = raw?.role_id ? rolesById[raw.role_id] : null;
            const isCustom = Boolean(raw?.use_custom_permissions);
            const roleSelectValue = raw?.role_id || 'none';

            return (
              <Card key={user.id} className="overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedUser(isExpanded ? null : user.id)}
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
                        {!isUserAdmin && user.mfa_email_enabled && (
                          <Badge
                            variant="outline"
                            className="hidden sm:inline-flex border-green-300 text-green-700"
                          >
                            Email MFA
                          </Badge>
                        )}
                      </>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div
                    className="border-t border-gray-100 px-4 pb-5 pt-4 bg-gray-50/50 space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
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
                              onChange={(e) =>
                                setResetPasswordField(user.id, 'password', e.target.value)
                              }
                              placeholder="Strong password required"
                              className="mt-1"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Confirm password</Label>
                            <Input
                              type="password"
                              autoComplete="new-password"
                              value={getResetPasswordForm(user.id).confirmPassword}
                              onChange={(e) =>
                                setResetPasswordField(user.id, 'confirmPassword', e.target.value)
                              }
                              placeholder="Re-enter password"
                              className="mt-1"
                              onClick={(e) => e.stopPropagation()}
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
                          <p className="text-sm text-red-600">
                            {getResetPasswordForm(user.id).error}
                          </p>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            resetPasswordMutation.isPending ||
                            !getResetPasswordForm(user.id).password
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResetPassword(user);
                          }}
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
                          Sign-in codes are sent to the user&apos;s account email only — not SMS or
                          phone. Users can also enable MFA on their profile unless you require it.
                        </p>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <Label className="text-sm">Enabled</Label>
                            <p className="text-xs text-gray-500">
                              User must enter an email code when signing in
                            </p>
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
                            <p className="text-xs text-gray-500">
                              User cannot disable MFA on their profile
                            </p>
                          </div>
                          <Switch
                            checked={Boolean(user.mfa_email_forced)}
                            disabled={updateMfaMutation.isPending || !user.mfa_email_enabled}
                            onCheckedChange={(forced) =>
                              updateMfaMutation.mutate({
                                userId: user.id,
                                enabled: true,
                                forced,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    {isUserAdmin ? (
                      <p className="text-sm text-gray-600 p-4 rounded-lg border bg-white">
                        Administrator accounts have full access to all modules. Portal roles and
                        permission toggles do not apply.
                      </p>
                    ) : (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-end gap-3 p-4 rounded-lg border bg-white">
                          <div className="flex-1">
                            <Label className="text-xs uppercase tracking-wide text-gray-500">
                              Portal role
                            </Label>
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
                                Optional filters for auto-assign and assignee lists. Leave empty to
                                handle any ticket.
                              </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-xs text-gray-500">Departments</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {TICKET_DEPARTMENTS.map((dept) => {
                                    const selected = parseRoutingList(user.departments).includes(
                                      dept.value
                                    );
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
                                    const selected = parseRoutingList(user.categories).includes(
                                      cat.value
                                    );
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

                        {(assignedRole?.slug === 'pbx_domain' ||
                          perms.can_access_pbx_domain_scoped) && (
                          <div className="p-4 rounded-lg border bg-white space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900">PBX domains</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Assign one or more SkySwitch domains this user can access. They
                                will only see data for selected domains across PBX screens.
                              </p>
                            </div>
                            {pbxDomainCatalog.length === 0 ? (
                              <p className="text-sm text-gray-500">
                                No domains loaded. Check SkySwitch connection or assign domains
                                after PBX is configured.
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
                                        pbxDomainsMutation.mutate({
                                          userId: user.id,
                                          domains: next,
                                        });
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
                                Select at least one domain — this user cannot access PBX data
                                until a domain is assigned.
                              </p>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                          {permissionGroups.map((group) => {
                            const hasFullModuleAccess = group.masterKey
                              ? Boolean(perms[group.masterKey])
                              : false;
                            return (
                              <div
                                key={group.id}
                                className="rounded-lg border p-4 bg-white"
                              >
                                <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                                  <div className="flex items-center gap-2">
                                    {group.icon === 'crm' ? (
                                      <Briefcase className="w-4 h-4 text-blue-600" />
                                    ) : group.icon === 'pbx' ? (
                                      <Phone className="w-4 h-4 text-purple-600" />
                                    ) : (
                                      <HeadphonesIcon className="w-4 h-4 text-green-600" />
                                    )}
                                    <span className="font-semibold text-sm text-gray-800">
                                      {group.label}
                                    </span>
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
                                          onClick={() =>
                                            handleBatchToggle(user, group.screenKeys, true)
                                          }
                                        >
                                          All screens
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="h-7 text-xs"
                                          disabled={updatePermissionMutation.isPending}
                                          onClick={() =>
                                            handleBatchToggle(user, group.screenKeys, false)
                                          }
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
                                          onClick={() =>
                                            handleBatchToggle(user, group.actionKeys, true)
                                          }
                                        >
                                          All actions
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="h-7 text-xs"
                                          disabled={updatePermissionMutation.isPending}
                                          onClick={() =>
                                            handleBatchToggle(user, group.actionKeys, false)
                                          }
                                        >
                                          No actions
                                        </Button>
                                      </>
                                    ) : null}
                                    {group.masterKey ? (
                                      <Switch
                                        checked={Boolean(perms[group.masterKey])}
                                        disabled={updatePermissionMutation.isPending}
                                        onCheckedChange={(val) =>
                                          handleMasterToggle(user, group, val)
                                        }
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
                                              onCheckedChange={(val) =>
                                                handleToggle(user, perm.key, val)
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
                      </>
                    )}

                    {isAdmin && currentUser?.id && user.id !== currentUser.id && (
                      <div className="p-4 rounded-lg border border-red-200 bg-red-50/50 space-y-3">
                        <div className="flex items-center gap-2">
                          <Trash2 className="w-4 h-4 text-red-600" />
                          <span className="font-medium text-sm text-gray-900">Delete user</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Permanently remove {user.full_name || user.email} from the portal. This
                          cannot be undone.
                        </p>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={deleteUserMutation.isPending}
                          onClick={(e) => {
                            e.stopPropagation();
                            const label = user.full_name || user.email;
                            if (
                              window.confirm(
                                `Delete user "${label}"? They will lose access immediately.`
                              )
                            ) {
                              deleteUserMutation.mutate(user.id);
                            }
                          }}
                        >
                          {deleteUserMutation.isPending ? 'Deleting...' : 'Delete user'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
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
                  onValueChange={(portalRoleId) => setAddForm((f) => ({ ...f, portalRoleId }))}
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
                  editingRoleId &&
                  portalRoles.find((r) => r.id === editingRoleId)?.is_system
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
                  editingRoleId &&
                  portalRoles.find((r) => r.id === editingRoleId)?.is_system
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
            {!(
              editingRoleId && portalRoles.find((r) => r.id === editingRoleId)?.is_system
            ) && (
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
