import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

enum RegisterStep {
    GMAIL = "GMAIL",
    REGISTERED = "REGISTERED",
    EMAIL_VERIFIED = "EMAIL_VERIFIED",
}

const STEP_COOKIE = "step";
const PUBLIC_ROUTES = ["/", "/explore"];
const AUTH_ROUTES = ["/login", "/sign-up"];
const VERIFY_ROUTE = "/verify-email";
const REGISTER_ROUTE = "/register-user";

export async function middleware(request: NextRequest) {
    const {pathname} = request.nextUrl;
    const token = request.cookies.get("accessToken")?.value;
    const step = request.cookies.get(STEP_COOKIE)?.value as RegisterStep | undefined;

    const isGmailUser = step === RegisterStep.GMAIL;
    const isRegisteredNotVerified = step === RegisterStep.REGISTERED;
    const isVerified = step === RegisterStep.EMAIL_VERIFIED;

    const isPublicRoute = PUBLIC_ROUTES.some(r => pathname === r || (r !== "/" && pathname.startsWith(r + "/")));
    const isAuthRoute = AUTH_ROUTES.some(r => pathname === r || pathname.startsWith(r));
    const isVerifyRoute = pathname.startsWith(VERIFY_ROUTE);
    const isRegisterRoute = pathname.startsWith(REGISTER_ROUTE);

    // ── 1. NO TOKEN ──────────────────────────────────────────────────────────
    if (!token) {
        if (isPublicRoute || isAuthRoute) return NextResponse.next();
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // ── 2. HAS TOKEN — STEP-BASED ROUTING ───────────────────────────────────

    // GMAIL user: must complete profile before anything else
    if (isGmailUser) {
        if (isAuthRoute) return NextResponse.redirect(new URL(REGISTER_ROUTE, request.url));
        if (!isRegisterRoute) return NextResponse.redirect(new URL(REGISTER_ROUTE, request.url));
        return NextResponse.next();
    }

    // REGISTERED but not verified: must verify email
    if (isRegisteredNotVerified) {
        if (isAuthRoute) return NextResponse.redirect(new URL(VERIFY_ROUTE, request.url));
        if (!isVerifyRoute) return NextResponse.redirect(new URL(VERIFY_ROUTE, request.url));
        return NextResponse.next();
    }

    // FULLY VERIFIED user
    if (isVerified) {
        // Kick them away from auth/register/verify pages
        if (isAuthRoute || isRegisterRoute || isVerifyRoute) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    // ── 3. TOKEN EXISTS BUT NO STEP COOKIE YET ───────────────────────────────
    // This is the gap window right after Google login before step cookie is set.
    // Only block auth routes, let everything else through.
    if (isAuthRoute) return NextResponse.redirect(new URL("/", request.url));

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};