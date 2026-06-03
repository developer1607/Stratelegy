import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function PbxListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  children,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
      {onSearchChange ? (
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 bg-white"
          />
        </div>
      ) : (
        <div />
      )}
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}
