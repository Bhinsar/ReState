"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useAuthStore } from "@/lib/store/authStore";
import { useEffect } from "react";
import { authResponse } from "@/services/auth/auth.Interface";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { registerFCMToken, listenToForegroundNotifications } from "@/services/fcm/fcm.Service";
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
