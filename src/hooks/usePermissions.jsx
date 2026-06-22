import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "@/api/client";
import { useAuth } from "@/lib/AuthContext";
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
} from "@/lib/permissions";
import {
  isPbxDomainReadOnly,
  isPbxDomainRestricted,
} from "@shared/pbxDomainAccess.js";

// Share a single UserPermissions realtime stream across all consumers.
// usePermissions() is called by every PermissionGate, page, and the layout;
// opening one SSE connection per consumer saturates the browser's per-origin
// HTTP connection limit and makes other requests (create, notifications) hang.
const permissionEventSubscribers = new Set();
let unsubscribePermissionStream = null;

function subscribeToPermissionEvents(callback) {
  permissionEventSubscribers.add(callback);
  return () => {
    permissionEventSubscribers.delete(callback);
    if (permissionEventSubscribers.size === 0 && unsubscribePermissionStream) {
      unsubscribePermissionStream();
      unsubscribePermissionStream = null;
    }
  };
}

function ensurePermissionStream(isAdmin) {
  if (!isAdmin || unsubscribePermissionStream) return;
  unsubscribePermissionStream = api.entities.UserPermissions.subscribe((event) => {
    for (const cb of [...permissionEventSubscribers]) cb(event);
  });
}

export function usePermissions() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: storedPermissions,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["layout-user-permissions", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const response = await api.functions.invoke("getMyPermissions");
      return response.data?.permissions || null;
    },
    enabled: !!user && isAuthenticated,
    staleTime: 0,
    refetchOnMount: "always",
  });

  const permissions = resolvePermissions(user, storedPermissions);
  const isAdmin = permissions.isAdmin;

  useEffect(() => {
    if (!user || !isAdmin) return;
    ensurePermissionStream(isAdmin);
    const unsubscribe = subscribeToPermissionEvents((event) => {
      if (
        event.data?.user_id === user.id ||
        event.old_data?.user_id === user.id
      ) {
        refetch();
        queryClient.invalidateQueries({
          queryKey: ["layout-user-permissions", user.id],
        });
      }
    });
    return unsubscribe;
  }, [user, isAdmin, refetch, queryClient]);

  return {
    permissions,
    isLoading: isLoading && !!user,
    isAdmin,
    canAccessPage: (pageName) => canAccessPage(permissions, pageName),
    canReadEntity: (entityName) => canReadEntity(permissions, entityName),
    canWriteEntity: (entityName) => canWriteEntity(permissions, entityName),
    canTicketAction: (action) => canTicketAction(permissions, action),
    canPbxAction: (action) => canPbxAction(permissions, action),
    canExport: permissions.can_export_data || permissions.isAdmin,
    hasCrmAccess: hasCrmModuleAccess(permissions),
    hasSupportAccess: hasSupportModuleAccess(permissions),
    hasPbxAccess: hasPbxModuleAccess(permissions),
    isPbxDomainReadOnly: isPbxDomainReadOnly(permissions),
    isPbxDomainRestricted: isPbxDomainRestricted(permissions),
    defaultHomePage: getDefaultHomePage(permissions),
    refetchPermissions: refetch,
  };
}
