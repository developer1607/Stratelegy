import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Simple prev/next pagination bar for data tables.
 */
export default function TablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  isLoading = false,
  className = '',
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const start = total === 0 ? 0 : safePage * pageSize + 1;
  const end = Math.min((safePage + 1) * pageSize, total);

  return (
    <div className={`flex items-center justify-between gap-4 px-2 py-3 ${className}`}>
      <p className="text-sm text-muted-foreground">
        {total === 0 ? 'No results' : `Showing ${start}–${end} of ${total.toLocaleString()}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading || safePage <= 0}
          onClick={() => onPageChange(safePage - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <span className="text-sm text-muted-foreground min-w-[5rem] text-center">
          {total === 0 ? 'No pages' : `Page ${safePage + 1} of ${totalPages}`}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isLoading || safePage >= totalPages - 1}
          onClick={() => onPageChange(safePage + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
