import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

enum RegisterStep {
    GMAIL = "GMAIL",
    REGISTERED = "REGISTERED",
    EMAIL_VERIFIED = "EMAIL_VERIFIED",
}

const STEP_COOKIE = "step";
const PUBLIC_ROUTES = ["/", "/about", "/contact"];
const AUTH_ROUTES = ["/login", "/sign-up"];
const VERIFY_ROUTE = "/verify-email";
const REGISTER_ROUTE = "/register-user";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get("accessToken")?.value;
    const step = request.cookies.get(STEP_COOKIE)?.value as RegisterStep | undefined;

    const isVerified = step === RegisterStep.EMAIL_VERIFIED;
    const isGmailUser = step === RegisterStep.GMAIL;
    const isRegisteredNotVerified = step === RegisterStep.REGISTERED;

    const isPublic = PUBLIC_ROUTES.some(
        (r) => pathname === r || (r !== "/" && pathname.startsWith(r))
    );
    const isAuth = AUTH_ROUTES.some((r) => pathname.startsWith(r));
    const isVerifyRoute = pathname.startsWith(VERIFY_ROUTE);
    const isRegisterRoute = pathname.startsWith(REGISTER_ROUTE);

    // ── 1. No token → logged out ──────────────────────────────────
    if (!token) {
        if (isPublic || isAuth) return NextResponse.next();
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // ── 2. Already on the route they should be on → let through ───
    // Prevents redirect loops
    if (isGmailUser && isRegisterRoute) return NextResponse.next();
    if (isRegisteredNotVerified && isVerifyRoute) return NextResponse.next();

    // ── 3. Block auth pages for logged-in users ────────────────────
    if (isAuth) {
        if (isGmailUser) return NextResponse.redirect(new URL(REGISTER_ROUTE, request.url));
        if (isRegisteredNotVerified) return NextResponse.redirect(new URL(VERIFY_ROUTE, request.url));
        return NextResponse.redirect(new URL("/", request.url));
    }

    // ── 4. Verification wall ───────────────────────────────────────
    // Only block non-public routes for unverified users
    if (!isVerified && !isPublic) {
        if (isGmailUser) return NextResponse.redirect(new URL(REGISTER_ROUTE, request.url));
        return NextResponse.redirect(new URL(VERIFY_ROUTE, request.url));
    }

    // ── 5. Verified users → block register/verify routes ──────────
    if (isVerified && (isRegisterRoute || isVerifyRoute)) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    // ── 6. Allow everything else ───────────────────────────────────
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};