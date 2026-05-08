'use client'

import { SessionProvider, useSession } from "next-auth/react"
import { useAuthStore } from "@/lib/store/authStore"
import { useEffect } from "react"
import { authResponse } from "@/services/auth/auth.Interface"

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

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SyncAuth />
            {children}
        </SessionProvider>
    )
}
