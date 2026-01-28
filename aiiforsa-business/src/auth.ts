import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { loginUser } from './actions';

/**
 * NextAuth v5 configuration for Business Portal
 * Restricted to BUSINESS role users only
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const { data, error, success } = await loginUser({
                        email: credentials.email as string,
                        password: credentials.password as string,
                    });
                    if (!success || error || !data) {
                        return null;
                    }

                    // Only allow BUSINESS role users to access this portal
                    if (data.user.role !== 'BUSINESS') {
                        return null;
                    }

                    return {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.name,
                        role: data.user.role,
                        companyId: data.user.companyId,
                        hasCompanyProfile: data.user.hasCompanyProfile,
                        accessToken: data.accessToken,
                        refreshToken: data.refreshToken || '',
                    };
                } catch {
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: '/login',
        error: '/error',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
                token.role = user.role;
                token.companyId = user.companyId;
                token.hasCompanyProfile = user.hasCompanyProfile;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
                session.user.role = token.role as 'USER' | 'BUSINESS' | 'ADMIN';
                session.user.companyId = token.companyId as
                    | string
                    | null
                    | undefined;
                session.user.hasCompanyProfile = token.hasCompanyProfile as
                    | boolean
                    | undefined;
                session.user.accessToken = token.accessToken as string;
                session.user.refreshToken = token.refreshToken as string;
            }
            return session;
        },
    },
    session: {
        strategy: 'jwt',
    },
    trustHost: true,
    debug: process.env.NODE_ENV === 'development',
});
