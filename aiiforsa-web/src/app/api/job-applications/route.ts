import { handleRequest } from '@/lib/server-request';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route to create a job application using server-side auth
 * POST /api/job-applications
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const result = await handleRequest<any>(
            'POST',
            '/job-applications',
            body,
            true,
        );

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: result.error.status || 500 },
            );
        }

        return NextResponse.json({ data: result.data }, { status: 201 });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('API /job-applications error', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 },
        );
    }
}
