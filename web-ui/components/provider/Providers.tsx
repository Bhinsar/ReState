'use client'

import { SessionProvider, useSession } from "next-auth/react"
import { useAuthStore } from "@/lib/store/authStore"
import { useEffect } from "react"
import { authResponse } from "@/services/auth/auth.Interface"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

/**
 * SyncAuth component ensures that when a user logs in via NextAuth (Google),
 * their user data is automatically synchronized to the Zustand useAuthStore.
 */
function SyncAuth() {
    const { data: session, status } = useSession()
    const setUser = useAuthStore((state) => state.setUser)

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            // We cast session.user because we've ensured it matches authResponse in the route callbacks
            setUser(session.user as authResponse)
        }
    }, [session, status, setUser])

    return null
}

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
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SyncAuth />
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </SessionProvider>
    )
}
