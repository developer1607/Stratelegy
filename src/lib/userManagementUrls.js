import { createPageUrl } from '@/utils';

/** Link to portal user detail editor. */
export function createUserDetailUrl(userId, returnTo = 'UserManagement') {
  const params = new URLSearchParams({ id: userId });
  if (returnTo) params.set('returnTo', returnTo);
  return `${createPageUrl('UserDetail')}?${params.toString()}`;
}
