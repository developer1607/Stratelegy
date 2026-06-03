import { usePermissions } from '@/hooks/usePermissions';
import { canPbxAction } from '@/lib/permissions';

export function usePbxPermissions() {
  const { permissions, isAdmin } = usePermissions();
  return {
    canManageRouting: canPbxAction(permissions, 'manageRouting'),
    canManageRouteByAni: canPbxAction(permissions, 'manageRouteByAni'),
    canManageE911: canPbxAction(permissions, 'manageE911'),
    canManageEndpoints: canPbxAction(permissions, 'manageEndpoints'),
    canMakeCall: canPbxAction(permissions, 'makeCall'),
    canManageReports: canPbxAction(permissions, 'manageReports'),
    isAdmin,
  };
}
