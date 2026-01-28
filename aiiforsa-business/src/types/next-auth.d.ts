import { DefaultSession } from 'next-auth';
import 'next-auth/jwt';

/**
 * Extend NextAuth types to include custom fields
 */
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: 'USER' | 'BUSINESS' | 'ADMIN';
            companyId?: string | null;
            hasCompanyProfile?: boolean;
            accessToken: string;
            refreshToken: string;
        } & DefaultSession['user'];
        accessToken: string;
    }

    interface User {
        id: string;
        email: string;
        name: string;
        role: 'USER' | 'BUSINESS' | 'ADMIN';
        companyId?: string | null;
        hasCompanyProfile?: boolean;
        accessToken: string;
        refreshToken: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: 'USER' | 'BUSINESS' | 'ADMIN';
        companyId?: string | null;
        hasCompanyProfile?: boolean;
        accessToken: string;
        refreshToken: string;
    }
}
