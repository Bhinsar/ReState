// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

enum RegisterStep {
    GMAIL = "GMAIL",
    REGISTERED = "REGISTERED",
    EMAIL_VERIFIED = "EMAIL_VERIFIED",
}

const STEP_COOKIE   = "registerStep"
const PUBLIC_ROUTES = ["/", "/about", "/contact"];
const AUTH_ROUTES   = ["/login", "/sign-up"];
const VERIFY_ROUTE  = "/verify-email";
const REGISTER_ROUTE = "/register-user";


export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("accessToken")?.value;
    const step  = request.cookies.get(STEP_COOKIE)?.value as RegisterStep | undefined;

    const isVerified              = step === RegisterStep.EMAIL_VERIFIED;
    const isGmailUser             = step === RegisterStep.GMAIL;
    const isRegisteredNotVerified = step === RegisterStep.REGISTERED;

    const isPublic = PUBLIC_ROUTES.some((r) => pathname === r || (r !== "/" && pathname.startsWith(r)));
    const isAuth = AUTH_ROUTES.some((r) => pathname.startsWith(r));

    // ── 1. No token → logged out ──────────────────
    if (!token) {
        if (isPublic || isAuth) return NextResponse.next();
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // ── 2. Logged-in: Handle specific Auth-related utility routes ──
    if (pathname.startsWith(VERIFY_ROUTE)) {
        if (isVerified) return NextResponse.redirect(new URL("/", request.url));
        return NextResponse.next();
    }

    if (pathname.startsWith(REGISTER_ROUTE)) {
        if (isVerified) return NextResponse.redirect(new URL("/", request.url));
        if (isGmailUser) return NextResponse.next();
        return NextResponse.redirect(new URL("/", request.url));
    }

    // ── 3. Logged-in: Block Auth Pages (Login/Register) ──
    if (isAuth) {
        if (isGmailUser) return NextResponse.redirect(new URL(REGISTER_ROUTE, request.url));
        if (isRegisteredNotVerified) return NextResponse.redirect(new URL(VERIFY_ROUTE, request.url));
        return NextResponse.redirect(new URL("/", request.url));
    }

    // ── 4. Logged-in: Verification Wall (CRITICAL MOVE) ──
    // We check this BEFORE allowing Public routes,
    // because an unverified user should be forced to verify even if they try to hit "/"
    if (!isVerified) {
        if (isGmailUser) return NextResponse.redirect(new URL(REGISTER_ROUTE, request.url));
        if (isRegisteredNotVerified) return NextResponse.redirect(new URL(VERIFY_ROUTE, request.url));
        return NextResponse.redirect(new URL(VERIFY_ROUTE, request.url));
    }

    // ── 5. Logged-in & Verified: Allow everything else ──
    return NextResponse.next();
}
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};