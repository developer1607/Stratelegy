import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';

export default function PbxNavGroup({
  label,
  items,
  canAccessPage,
  isAdmin,
  currentPageName,
  navLinkClass,
}) {
  const visible = items.filter((item) => {
    if (item.adminOnly) return isAdmin;
    return canAccessPage(item.path);
  });

  if (!visible.length) return null;

  if (visible.length === 1) {
    const item = visible[0];
    return (
      <Link to={createPageUrl(item.path)} className={navLinkClass(item.path)}>
        <item.icon className="w-5 h-5" />
        <span className="font-medium">{item.name}</span>
      </Link>
    );
  }

  const isActive = visible.some((item) => item.path === currentPageName);

  return (
    <Collapsible defaultOpen={isActive} className="mb-1">
      <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2 text-xs uppercase tracking-wider text-white/50 hover:text-white/80 font-semibold">
        <span>{label}</span>
        <ChevronRight className="h-3.5 w-3.5 transition-transform [[data-state=open]_&]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-0.5 pb-2">
        {visible.map((item) => (
          <Link key={item.path} to={createPageUrl(item.path)} className={navLinkClass(item.path)}>
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
