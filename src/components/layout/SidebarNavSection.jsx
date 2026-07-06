import React, { useEffect, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SidebarNavSection({
  label,
  isActive = false,
  children,
  className,
}) {
  const [open, setOpen] = useState(isActive);

  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive, label]);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className={cn('mb-1', className)}>
      <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2 mt-2 mb-1 rounded-lg text-xs text-[#F07020] uppercase tracking-widest font-semibold hover:bg-white/5 transition-colors">
        <span>{label}</span>
        <ChevronRight
          className={cn('h-3.5 w-3.5 shrink-0 transition-transform', open && 'rotate-90')}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 pb-1">{children}</CollapsibleContent>
    </Collapsible>
  );
}
