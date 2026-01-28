import { NextResponse } from 'next/server';
import type { ResourceResponse } from '../../../../types/learning-resource';
import { fetchResourcesByCategory } from '../../career-insights';

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h
const cache: Map<string, { ts: number; data: ResourceResponse }> = new Map();

export async function GET(request: Request, context: any) {
    // context.params can be a plain object or a Promise depending on Next.js internals;
    // await it to be safe.
    const params = context && context.params ? await context.params : undefined;
    const category: string | undefined = params?.category;

    if (!category) {
        return NextResponse.json({ items: [] } as ResourceResponse, {
            status: 400,
        });
    }

    // Return cached if fresh
    const cached = cache.get(category);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return NextResponse.json(cached.data);
    }

    // Fetch fresh data
    const items = await fetchResourcesByCategory(category);

    const payload: ResourceResponse = { items };
    cache.set(category, { ts: Date.now(), data: payload });
    return NextResponse.json(payload);
}
