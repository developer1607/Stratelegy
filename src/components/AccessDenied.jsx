import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { usePermissions } from '@/hooks/usePermissions';

export default function AccessDenied({ message = '' }) {
  const { defaultHomePage } = usePermissions();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 gap-4 text-center">
      <ShieldAlert className="w-14 h-14 text-muted-foreground" />
      <h2 className="text-xl font-semibold text-gray-900">Access restricted</h2>
      <p className="text-muted-foreground max-w-md">
        {message || 'You do not have permission to view this page. Contact your administrator to request access.'}
      </p>
      {defaultHomePage && (
        <Button asChild>
          <Link to={createPageUrl(defaultHomePage)}>Go to your dashboard</Link>
        </Button>
      )}
    </div>
  );
}
