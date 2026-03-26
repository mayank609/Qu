import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { notificationAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const NotificationDropdown = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifRes, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationAPI.getAll({ limit: 10 }),
    enabled: !!user,
  });

  const notifications = notifRes?.data?.data?.notifications || [];
  const unreadCount = notifRes?.data?.data?.unreadCount || 0;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationAPI.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  useEffect(() => {
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5001", {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on("notification", (newNotif) => {
      queryClient.setQueryData(['notifications'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            notifications: [newNotif, ...old.data.notifications].slice(0, 10),
            unreadCount: (old.data.unreadCount || 0) + 1
          }
        };
      });
      // Optionally show a toast for high-priority types
    });

    return () => {
      socket.disconnect();
    };
  }, [token, queryClient]);

  const handleNotifClick = (notif: any) => {
    if (!notif.isRead) markReadMutation.mutate(notif._id);
    if (notif.link) navigate(notif.link);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary text-[10px] font-bold text-primary-foreground rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 mr-4 bg-card border-border" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-bold">Notifications</h3>
          {unreadCount > 0 && (
            <button 
              onClick={() => markAllReadMutation.mutate()}
              className="text-[10px] text-primary hover:underline font-medium"
            >
              Mark all read
            </button>
          )}
        </div>
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground text-pretty">
              You're all caught up! No recent notifications.
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notif: any) => (
                <div 
                  key={notif._id}
                  onClick={() => handleNotifClick(notif)}
                  className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${!notif.isRead ? "bg-primary/5" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                        "w-2 h-2 mt-1.5 rounded-full shrink-0",
                        !notif.isRead ? "bg-primary" : "bg-transparent"
                    )} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold leading-tight">{notif.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                      <p className="text-[10px] text-muted-foreground pt-1">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t border-border text-center">
          <button className="text-xs text-muted-foreground hover:text-foreground">View all history</button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
