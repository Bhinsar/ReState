"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/store/authStore";
import { useEffect, useRef } from "react";
import { authResponse } from "@/services/auth/auth.Interface";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { registerFCMToken, listenToForegroundNotifications } from "@/services/fcm/fcm.Service";
import { NotificationService } from "@/services/notifications/notification.Service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Initialize QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch on mount if data exists
      refetchOnReconnect: true, // Refetch on reconnect
      retry: 1, // Retry failed requests once
      staleTime: 2 * 60 * 1000, // Data is fresh for 2 minutes
      gcTime: 5 * 60 * 1000, // Cache data for 5 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * SyncAuth component ensures that when a user logs in via NextAuth (Google),
 * their user data is automatically synchronized to the Zustand useAuthStore,
 * FCM push notifications are registered, and foreground listeners are set up.
 */
function SyncAuth() {
  const { data: session, status } = useSession();
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  // Deduplication cache and tracking
  const prevUnreadCountRef = useRef<number | undefined>(undefined);
  const toastedKeys = useRef<Set<string>>(new Set());

  // Query to fetch unread notification count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unreadCount"],
    queryFn: () => NotificationService.unreadCount(),
    enabled: status === "authenticated",
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 5000,
  });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const asyncFunc = async () => {
      if (status === "authenticated" && session?.user) {
        // We cast session.user because we've ensured it matches authResponse in the route callbacks
        setUser(session.user as authResponse);
        await registerFCMToken();
        
        // Listen to foreground push notifications
        const unsub = listenToForegroundNotifications((payload) => {
          // 1. Invalidate both notifications list and unread count to trigger UI updates
          queryClient.invalidateQueries({ queryKey: ["notifications"] });

          // 2. Display premium toast notification
          const title = payload.notification?.title || payload.data?.title || "New Notification";
          const body = payload.notification?.body || payload.data?.body || "";
          const propertyId = payload.data?.propertyId;

          const notificationId = payload.data?.id || payload.data?.notificationId;
          const msgKey = notificationId || `${title}_${body}`;
          if (toastedKeys.current.has(msgKey)) return;
          toastedKeys.current.add(msgKey);
          if (toastedKeys.current.size > 100) {
            const firstKey = toastedKeys.current.values().next().value;
            if (firstKey !== undefined) toastedKeys.current.delete(firstKey);
          }

          toast.info(title, {
            description: body,
            duration: 5000,
            action: propertyId ? {
              label: "View",
              onClick: () => {
                router.push(`/properties/${propertyId}`);
              }
            } : undefined
          });
        });

        if (unsub) {
          unsubscribe = unsub;
        }
      }
    };
    asyncFunc();

    // Set up message listener for background notifications broadcasted by the Service Worker
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'PUSH_NOTIFICATION_RECEIVED') {
        // Invalidate queries so that the unread badge and list update immediately
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      }
    };

    if (typeof window !== "undefined" && 'serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (typeof window !== "undefined" && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, [session, status, setUser, router]);

  // Passive toast detection when unreadCount increases
  useEffect(() => {
    if (status !== "authenticated") {
      prevUnreadCountRef.current = undefined;
      return;
    }

    // On initial mount/load of the unreadCount, set the initial reference without displaying toasts
    if (prevUnreadCountRef.current === undefined) {
      prevUnreadCountRef.current = unreadCount;
      return;
    }

    if (unreadCount > prevUnreadCountRef.current) {
      const fetchAndToastNewNotifications = async () => {
        try {
          const res = await NotificationService.getAllNotifications();
          const notifications = res.data || [];
          const diff = unreadCount - (prevUnreadCountRef.current ?? 0);
          
          // Get the newest unread notifications.
          // Assuming response list is sorted newest first, the first `diff` unread notifications are the new ones.
          const newNotifications = notifications
            .filter(n => !n.isRead)
            .slice(0, Math.max(diff, 1));

          newNotifications.reverse().forEach((notification) => {
            const msgKey = notification.id || `${notification.title}_${notification.body}`;
            if (toastedKeys.current.has(msgKey)) return;
            toastedKeys.current.add(msgKey);
            if (toastedKeys.current.size > 100) {
              const firstKey = toastedKeys.current.values().next().value;
              if (firstKey !== undefined) toastedKeys.current.delete(firstKey);
            }

            toast.info(notification.title, {
              description: notification.body,
              duration: 5000,
              action: notification.propertyId ? {
                label: "View",
                onClick: () => {
                  router.push(`/properties/${notification.propertyId}`);
                }
              } : undefined
            });
          });

          // Invalidate both notifications list and unread count to trigger UI updates
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        } catch (error) {
          console.error("Error fetching new notifications for toast:", error);
        }
      };

      fetchAndToastNewNotifications();
    }

    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount, status, router]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <SyncAuth />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}
