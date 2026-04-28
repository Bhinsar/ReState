import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

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
    const {pathname} = request.nextUrl;
    const token = request.cookies.get("accessToken")?.value;
    const step = request.cookies.get(STEP_COOKIE)?.value as RegisterStep | undefined;

    const isGmailUser = step === RegisterStep.GMAIL;
    const isRegisteredNotVerified = step === RegisterStep.REGISTERED;
    const isVerified = step === RegisterStep.EMAIL_VERIFIED;

    const isVerifyRoute = pathname.startsWith(VERIFY_ROUTE);
    const isRegisterRoute = pathname.startsWith(REGISTER_ROUTE);

    // 1. If no token, they must be on Auth or Public routes
    if (!token) {
        const isPublic = PUBLIC_ROUTES.some(r => pathname === r || (r !== "/" && pathname.startsWith(r)));
        const isAuth = AUTH_ROUTES.some(r => pathname.startsWith(r));

        if (isPublic || isAuth) return NextResponse.next();
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if(token){
        const isAuth = AUTH_ROUTES.some(r => pathname === r || (r !== "/" && pathname.startsWith(r)));
        const isVerify = pathname.startsWith(VERIFY_ROUTE);
        const isRegister = pathname.startsWith(REGISTER_ROUTE);
        if(isAuth || isVerify || isRegister)return NextResponse.redirect(new URL("/", request.url));
    }

    // 2. STRICTOR LOCKDOWN: Check steps before anything else

    // If they are a GMAIL user, they MUST be on REGISTER_ROUTE
    if (isGmailUser) {
        if (!isRegisterRoute) {
            return NextResponse.redirect(new URL(REGISTER_ROUTE, request.url));
        }
        return NextResponse.next(); // Stay on Register page
    }

    // If they are REGISTERED but not verified, they MUST be on VERIFY_ROUTE
    if (isRegisteredNotVerified) {
        if (!isVerifyRoute) {
            return NextResponse.redirect(new URL(VERIFY_ROUTE, request.url));
        }
        return NextResponse.next(); // Stay on Verify page
    }

    // 3. LOGIC FOR VERIFIED USERS
    if (isVerified) {
        // Prevent verified users from going back to registration/verification pages
        if (isRegisterRoute || isVerifyRoute || AUTH_ROUTES.some(r => pathname.startsWith(r))) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};