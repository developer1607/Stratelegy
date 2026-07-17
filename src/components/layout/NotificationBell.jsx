import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Check,
  CheckCheck,
  MoreHorizontal,
  Trash2,
  MailOpen,
} from "lucide-react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const NOTIFICATION_QUERY_KEY = ["notifications"];

function formatRelativeTime(iso) {
  if (!iso) return "";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

function NotificationItem({
  notification,
  onOpen,
  onMarkRead,
  onMarkUnread,
  onDelete,
}) {
  const isUnread = !notification.read_at;

  return (
    <div
      className={cn(
        "group relative flex gap-3 px-4 py-3 border-b border-gray-50 transition-colors",
        isUnread ? "bg-orange-50/40 hover:bg-orange-50/70" : "hover:bg-gray-50",
      )}
    >
      <button
        type="button"
        onClick={() => onOpen(notification)}
        className="flex gap-3 min-w-0 flex-1 text-left"
      >
        <span
          className={cn(
            "mt-1.5 w-2 h-2 rounded-full shrink-0",
            isUnread ? "bg-[#F07020]" : "bg-transparent",
          )}
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="text-sm font-medium text-gray-900 line-clamp-1">
            {notification.title}
          </span>
          {notification.body && (
            <span className="text-xs text-gray-500 line-clamp-2 mt-0.5 block">
              {notification.body}
            </span>
          )}
          <span className="text-[11px] text-gray-400 mt-1 block">
            {formatRelativeTime(notification.created_date)}
          </span>
        </span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Notification actions"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {isUnread ? (
            <DropdownMenuItem onClick={() => onMarkRead(notification)}>
              <Check className="w-4 h-4 mr-2" />
              Mark as read
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => onMarkUnread(notification)}>
              <MailOpen className="w-4 h-4 mr-2" />
              Mark as unread
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={() => onDelete(notification)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function NotificationBell({ user }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const unreadOnly = filter === "unread";

  const { data, isLoading } = useQuery({
    queryKey: [...NOTIFICATION_QUERY_KEY, filter],
    queryFn: () => api.notifications.list({ unreadOnly, limit: 40 }),
    enabled: Boolean(user?.id),
    staleTime: 30_000,
    refetchInterval: open ? 60_000 : 120_000,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unread_count ?? 0;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY });
  };

  const markReadMutation = useMutation({
    mutationFn: ({ id, read }) => api.notifications.markRead(id, read),
    onSuccess: invalidate,
    onError: (e) => toast.error(e.message || "Update failed"),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onSuccess: () => {
      invalidate();
      toast.success("All read");
    },
    onError: (e) => toast.error(e.message || "Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.notifications.delete(id),
    onSuccess: invalidate,
    onError: (e) => toast.error(e.message || "Delete failed"),
  });

  const deleteAllReadMutation = useMutation({
    mutationFn: () => api.notifications.deleteAllRead(),
    onSuccess: (result) => {
      invalidate();
      if (result.deleted > 0) {
        toast.success(`Cleared ${result.deleted}`);
      }
    },
    onError: (e) => toast.error(e.message || "Clear failed"),
  });

  const handleOpen = async (notification) => {
    if (!notification.read_at) {
      await markReadMutation.mutateAsync({ id: notification.id, read: true });
    }
    setOpen(false);
    if (notification.link_path) {
      navigate(notification.link_path);
    }
  };

  if (!user?.id) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hidden sm:flex relative"
          aria-label={
            unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "Notifications"
          }
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-[#F07020] text-white text-[10px] font-semibold flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 sm:w-[22rem] p-0">
        <div className="px-4 py-3 border-b border-gray-100 flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : "You are all caught up"}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs px-2"
                disabled={markAllReadMutation.isPending}
                onClick={() => markAllReadMutation.mutate()}
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Read all
              </Button>
            )}
          </div>
        </div>

        <div className="flex border-b border-gray-100 px-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "flex-1 text-xs font-medium py-2 border-b-2 transition-colors",
              filter === "all"
                ? "border-[#F07020] text-[#F07020]"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={cn(
              "flex-1 text-xs font-medium py-2 border-b-2 transition-colors",
              filter === "unread"
                ? "border-[#F07020] text-[#F07020]"
                : "border-transparent text-gray-500 hover:text-gray-700",
            )}
          >
            Unread{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </button>
        </div>

        <ScrollArea className="h-[min(22rem,50vh)]">
          {isLoading && (
            <p className="text-sm text-gray-500 text-center py-10">Loading…</p>
          )}
          {!isLoading && notifications.length === 0 && (
            <div className="text-center py-10 px-4">
              <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {unreadOnly
                  ? "No unread notifications"
                  : "No notifications yet"}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Ticket updates and comments will appear here
              </p>
            </div>
          )}
          {!isLoading &&
            notifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onOpen={handleOpen}
                onMarkRead={(item) =>
                  markReadMutation.mutate({ id: item.id, read: true })
                }
                onMarkUnread={(item) =>
                  markReadMutation.mutate({ id: item.id, read: false })
                }
                onDelete={(item) => deleteMutation.mutate(item.id)}
              />
            ))}
        </ScrollArea>

        {filter === "all" && notifications.some((n) => n.read_at) && (
          <div className="border-t border-gray-100 px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 text-xs text-gray-500"
              disabled={deleteAllReadMutation.isPending}
              onClick={() => deleteAllReadMutation.mutate()}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Clear read notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
