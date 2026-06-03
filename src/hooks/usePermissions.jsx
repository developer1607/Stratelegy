import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '@/api/client';
import { useAuth } from '@/lib/AuthContext';
import {
  resolvePermissions,
  canAccessPage,
  canReadEntity,
  canWriteEntity,
  canTicketAction,
  canPbxAction,
  getDefaultHomePage,
  hasCrmModuleAccess,
  hasSupportModuleAccess,
  hasPbxModuleAccess,
} from '@/lib/permissions';

export function usePermissions() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: storedPermissions, isLoading, refetch } = useQuery({
    queryKey: ['layout-user-permissions', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const response = await api.functions.invoke('getMyPermissions');
      return response.data?.permissions || null;
    },
    enabled: !!user && isAuthenticated,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (!user) return;
    const unsubscribe = api.entities.UserPermissions.subscribe((event) => {
      if (event.data?.user_id === user.id || event.old_data?.user_id === user.id) {
        refetch();
        queryClient.invalidateQueries({ queryKey: ['layout-user-permissions', user.id] });
      }
    });
    return unsubscribe;
  }, [user, refetch, queryClient]);

  const permissions = resolvePermissions(user, storedPermissions);

  return {
    permissions,
    isLoading: isLoading && !!user,
    isAdmin: permissions.isAdmin,
    canAccessPage: (pageName) => canAccessPage(permissions, pageName),
    canReadEntity: (entityName) => canReadEntity(permissions, entityName),
    canWriteEntity: (entityName) => canWriteEntity(permissions, entityName),
    canTicketAction: (action) => canTicketAction(permissions, action),
    canPbxAction: (action) => canPbxAction(permissions, action),
    canExport: permissions.can_export_data || permissions.isAdmin,
    hasCrmAccess: hasCrmModuleAccess(permissions),
    hasSupportAccess: hasSupportModuleAccess(permissions),
    hasPbxAccess: hasPbxModuleAccess(permissions),
    defaultHomePage: getDefaultHomePage(permissions),
    refetchPermissions: refetch,
  };
}
