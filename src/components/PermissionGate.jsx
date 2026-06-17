import { usePermissions } from "@/hooks/usePermissions";
import { hasPermissionKey } from "@/lib/permissions";

/**
 * @typedef {object} PermissionGateProps
 * @property {string} [permission]
 * @property {string} [entity]
 * @property {string} [ticketAction]
 * @property {string} [pbxAction]
 * @property {boolean} [adminOnly]
 * @property {import('react').ReactNode} children
 * @property {import('react').ReactNode} [fallback]
 */

/**
 * Renders children only when the user has the required permission.
 * @param {PermissionGateProps} props
 */
export default function PermissionGate({
  permission,
  entity,
  ticketAction,
  pbxAction,
  adminOnly,
  children,
  fallback = null,
}) {
  const {
    permissions,
    isAdmin,
    canWriteEntity,
    canTicketAction,
    canPbxAction,
  } = usePermissions();

  let allowed = false;
  if (adminOnly) {
    allowed = isAdmin;
  } else if (pbxAction) {
    allowed = canPbxAction(pbxAction);
  } else if (ticketAction) {
    allowed = canTicketAction(ticketAction);
  } else if (entity) {
    allowed = canWriteEntity(entity);
  } else if (permission) {
    allowed = hasPermissionKey(permissions, permission);
  }

  if (!allowed) return fallback;
  return children;
}
