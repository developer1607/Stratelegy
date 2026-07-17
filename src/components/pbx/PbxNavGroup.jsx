import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

function filterVisible(items, canAccessPage, isAdmin) {
  return items.filter((item) => {
    if (item.adminOnly) return isAdmin;
    return canAccessPage(item.path);
  });
}

export default function PbxNavGroup({
  item,
  canAccessPage,
  isAdmin,
  currentPageName,
  navLinkClass,
}) {
  if (item.children?.length) {
    const visible = filterVisible(item.children, canAccessPage, isAdmin);
    if (!visible.length) return null;

    const isActive = visible.some((child) => child.path === currentPageName);

    return (
      <Collapsible defaultOpen={isActive} className="mb-1">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2.5 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white font-medium">
          <span className="flex items-center gap-3">
            <item.icon className="w-5 h-5" />
            {item.name}
          </span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform [[data-state=open]_&]:rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-0.5 pb-1 pl-3">
          {visible.map((child) => (
            <Link
              key={child.path}
              to={createPageUrl(child.path)}
              className={navLinkClass(child.path)}
            >
              <child.icon className="w-5 h-5" />
              <span className="font-medium">{child.name}</span>
            </Link>
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  if (!item.path) return null;
  if (item.adminOnly && !isAdmin) return null;
  if (!canAccessPage(item.path)) return null;

  return (
    <Link to={createPageUrl(item.path)} className={navLinkClass(item.path)}>
      <item.icon className="w-5 h-5" />
      <span className="font-medium">{item.name}</span>
    </Link>
  );
}
