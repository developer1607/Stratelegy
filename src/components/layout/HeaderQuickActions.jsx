import React from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import NotificationBell from "@/components/layout/NotificationBell";

export default function HeaderQuickActions({ user, canViewSupportTickets }) {
  if (!user?.id && !canViewSupportTickets) {
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      {canViewSupportTickets && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hidden sm:flex"
              asChild
            >
              <Link
                to={createPageUrl("SupportTickets")}
                aria-label="Support tickets"
              >
                <Mail className="w-5 h-5" />
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Support tickets</TooltipContent>
        </Tooltip>
      )}

      <NotificationBell user={user} />
    </TooltipProvider>
  );
}
