import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { createUserDetailUrl } from '@/lib/userManagementUrls';
import { useAuth } from '@/lib/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { usePortalUserAdmin } from '@/hooks/usePortalUserAdmin';
import UserEditPanel from '@/components/settings/UserEditPanel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Shield, ShieldAlert } from 'lucide-react';
import { hasCrmModuleAccess, hasSupportModuleAccess, hasPbxModuleAccess } from '@/lib/permissions';

export default function UserDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get('id');
  const returnTo = searchParams.get('returnTo') || 'UserManagement';
  const backUrl = createPageUrl(returnTo);

  const { isLoadingAuth, isAuthenticated } = useAuth();
  const { isAdmin, isLoading: isPermissionsLoading } = usePermissions();
  const { users, isLoading, loadError, getRawRecord, getEffectivePermissions, rolesById } =
    usePortalUserAdmin();

  const user = users.find((row) => row.id === userId) || null;

  if (isLoadingAuth || isPermissionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Loading user…</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 gap-4">
        <ShieldAlert className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Access Restricted</h2>
        <p className="text-muted-foreground">You need admin privileges to edit portal users.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 gap-4 px-4 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load user</h2>
        <p className="text-muted-foreground max-w-md">{loadError.message || 'An API request failed.'}</p>
        <Button variant="outline" asChild>
          <Link to={backUrl}>Back to users</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-32 gap-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">Loading user…</p>
      </div>
    );
  }

  if (!userId || !user) {
    return (
      <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto space-y-4">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link to={backUrl}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to users
            </Link>
          </Button>
          <div className="rounded-lg border bg-white p-8 text-center text-muted-foreground">
            User not found. They may have been deleted or the link is invalid.
          </div>
        </div>
      </div>
    );
  }

  const raw = getRawRecord(user.id);
  const perms = { ...getEffectivePermissions(user.id), isAdmin: false };
  const isUserAdmin = user.role === 'admin';
  const assignedRole = raw?.role_id ? rolesById[raw.role_id] : null;
  const isCustom = Boolean(raw?.use_custom_permissions);

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link to={backUrl}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to users
          </Link>
        </Button>

        <div className="rounded-xl border bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg shrink-0">
                {user.full_name?.charAt(0)?.toUpperCase() ||
                  user.email?.charAt(0)?.toUpperCase() ||
                  '?'}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 truncate">
                  {user.full_name || 'Portal user'}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1 truncate mt-0.5">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isUserAdmin ? (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              ) : (
                <>
                  <Badge variant="outline">{assignedRole?.name || 'No role'}</Badge>
                  {isCustom && <Badge variant="secondary">Custom</Badge>}
                  {user.mfa_email_enabled && (
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      Email MFA
                    </Badge>
                  )}
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
                </>
              )}
            </div>
          </div>
        </div>

        <UserEditPanel user={user} onDeleted={() => navigate(backUrl)} />
      </div>
    </div>
  );
}