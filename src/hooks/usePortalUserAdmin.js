import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { pbxApi } from '@/api/pbx';
import { showError, showInfo, showSuccess } from '@/lib/toast';
import { computeEffectivePermissions } from '@/lib/portalPermissions';
import { formatPasswordErrors, validatePassword } from '@/lib/passwordValidation';
import { parsePbxDomains, domainsMatch } from '@shared/pbxDomainAccess.js';
import { useAuth } from '@/lib/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

export function usePortalUserAdmin() {
  const { isLoadingAuth } = useAuth();
  const { isAdmin } = usePermissions();
  const queryClient = useQueryClient();
  const enabled = isAdmin && !isLoadingAuth;

  const [resetPasswordByUser, setResetPasswordByUser] = useState({});

  const {
    data: users = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.entities.User.list(),
    enabled,
  });

  const {
    data: portalRoles = [],
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ['portalRoles'],
    queryFn: () => api.roles.list(),
    enabled,
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
    enabled,
  });

  const { data: permissionDefs, error: defsError } = useQuery({
    queryKey: ['permissionDefinitions'],
    queryFn: () => api.permissions.definitions(),
    enabled,
  });

  const { data: pbxDomainCatalog = [] } = useQuery({
    queryKey: ['pbx-domains-admin-catalog'],
    queryFn: () => pbxApi.domains(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  const rolesById = Object.fromEntries(portalRoles.map((role) => [role.id, role]));
  const systemModuleRoles = portalRoles.filter((role) => role.is_system);
  const permissionGroups = permissionDefs?.groups || [];

  const assignRoleMutation = useMutation({
    mutationFn: ({ userId, roleId }) => api.users.assignPortalRole(userId, roleId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userPermissions'] }),
    onError: (error) => showError(error, 'Failed to assign role'),
  });

  const updatePermissionMutation = useMutation({
    mutationFn: ({ userId, updates }) => api.users.updatePermissions(userId, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userPermissions'] }),
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

  const supportRoutingMutation = useMutation({
    mutationFn: ({ userId, departments, categories }) =>
      api.users.updateSupportRouting(userId, { departments, categories }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
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

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => api.users.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userPermissions'] });
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
    updatePermissionMutation.mutate({ userId: user.id, updates: { [key]: value } });
  };

  const handleMasterToggle = (user, group, value) => {
    const updates = { [group.masterKey]: value };
    if (value) {
      for (const key of group.allKeys || []) updates[key] = true;
    }
    updatePermissionMutation.mutate({ userId: user.id, updates });
  };

  const handleBatchToggle = (user, keys, value) => {
    if (!keys?.length) return;
    updatePermissionMutation.mutate({
      userId: user.id,
      updates: Object.fromEntries(keys.map((key) => [key, value])),
    });
  };

  const handleResetToRole = (user) => {
    const record = getRawRecord(user.id);
    if (!record?.role_id) {
      showInfo('Assign a portal role first.');
      return;
    }
    assignRoleMutation.mutate({ userId: user.id, roleId: record.role_id });
  };

  return {
    users,
    portalRoles,
    allPermissions,
    permissionGroups,
    pbxDomainCatalog,
    rolesById,
    systemModuleRoles,
    isLoading: usersLoading || rolesLoading || permsLoading,
    loadError: usersError || rolesError || permsError || defsError,
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
    assignRoleMutation,
    updatePermissionMutation,
    resetPasswordMutation,
    updateMfaMutation,
    supportRoutingMutation,
    pbxDomainsMutation,
    deleteUserMutation,
  };
}
