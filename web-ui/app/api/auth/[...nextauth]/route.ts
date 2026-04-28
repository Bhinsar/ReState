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

    pages: {
        signIn: "/login",
        error: "/login",
    },

    cookies: {
        pkceCodeVerifier: {
            name: "next-auth.pkce.code_verifier",
            options: { httpOnly: true, sameSite: "lax", path: "/", secure: false },
        },
        state: {
            name: "next-auth.state",
            options: { httpOnly: true, sameSite: "lax", path: "/", secure: false },
        },
    },

    callbacks: {
        async signIn({ account }) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Client-Type": "web",
                    },
                    body: JSON.stringify({ id_token: account?.id_token }),
                });

                if (!res.ok) {
                    const data = await res.json() as { message?: string };  // ✅ fix 1: no-explicit-any
                    throw new Error(data.message ?? "Google login failed");
                }

                const setCookieHeader = res.headers.getSetCookie();
                const cookieStore = await cookies();  // ✅ fix 2: await cookies()

                setCookieHeader.forEach((cookie) => {
                    const [nameValue] = cookie.split(";");
                    const [name, value] = nameValue.split("=");
                    cookieStore.set(name.trim(), value.trim(), {
                        httpOnly: true,
                        secure: false,
                        sameSite: "lax",
                        path: "/",
                    });
                });

                return true;
            } catch (error: unknown) {                                  // ✅ fix 3: unknown not any
                if (error instanceof Error) {
                    throw new Error(error.message);
                }
                throw new Error("Something went wrong");
            }
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };