import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { loginUser } from './actions';

/**
 * NextAuth v5 configuration
 * Clean and modern setup following best practices
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
    // Ensure Auth.js has a secret even if env loading is finicky in some contexts
    secret: process.env.NEXTAUTH_SECRET,
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

                    return {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.name,
                        role: data.user.role,
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
                session.user.role = token.role as string;
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
