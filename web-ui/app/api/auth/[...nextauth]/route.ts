import { authResponse } from "@/services/auth/auth.Interface";
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],

    secret: process.env.NEXTAUTH_SECRET,

    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async signIn({ user, account }) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Client-Type": "web",
                    },
                    body: JSON.stringify({ id_token: account?.id_token }),
                });

                const jsonResponse = await res.json();
                const responseData = jsonResponse.data;

                if (!res.ok) {
                    throw new Error(jsonResponse.message ?? "Google login failed");
                }

                // Set cookies from backend response
                const setCookieHeader = res.headers.getSetCookie();
                const cookieStore = await cookies();

                setCookieHeader.forEach((cookie) => {
                    const parts = cookie.split(";");
                    const [nameValue] = parts;
                    if (!nameValue) return;
                    const [name, value] = nameValue.split("=");
                    
                    const options: any = {
                        path: "/",
                        httpOnly: cookie.toLowerCase().includes("httponly"),
                        secure: true,
                        sameSite: "none",
                    };

                    const maxAgePart = parts.find(p => p.trim().toLowerCase().startsWith("max-age"));
                    if (maxAgePart) {
                        options.maxAge = parseInt(maxAgePart.split("=")[1]);
                    }

                    cookieStore.set(name.trim(), value.trim(), options);
                });

                const data = responseData as authResponse;
                // Attach backend user data to the NextAuth user object to pass it to the jwt callback
                (user as any).backendUser = data;

                return true;
            } catch (error: unknown) {
                if (error instanceof Error) {
                    throw new Error(error.message);
                }
                throw new Error("Something went wrong");
            }
        },
        async jwt({ token, user }) {
            if (user) {
                token.backendUser = (user as any).backendUser;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.backendUser) {
                session.user = token.backendUser as any;
            }
            return session;
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };