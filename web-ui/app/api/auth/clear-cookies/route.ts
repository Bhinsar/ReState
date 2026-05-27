import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * POST /api/auth/clear-cookies
 *
 * Clears all auth-related httpOnly cookies that were originally set by the
 * Next.js server (in the NextAuth signIn callback). The Spring Boot backend
 * cannot clear these because they live on the frontend domain — only this
 * Next.js server-side route can delete them.
 */
export async function POST() {
    const cookieStore = await cookies();

    const clearOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none" as const,
        path: "/",
        maxAge: 0,
    };

    cookieStore.set("accessToken", "", clearOptions);
    cookieStore.set("refreshToken", "", clearOptions);
    cookieStore.set("step", "", clearOptions);

    return NextResponse.json({ success: true });
}
