/* eslint-disable no-console */
import type { LearningResource } from '../../types/learning-resource';

/**
 * Career Insights API Integration
 * Fetches learning resources from external APIs (Dev.to, GitHub, YouTube, Udemy, Coursera)
 */

export async function fetchDevTo(): Promise<LearningResource[]> {
    try {
        const res = await fetch('https://dev.to/api/articles?per_page=12');
        if (!res.ok) {
            const text = await res.text().catch(() => '<no body>');
            console.error(
                '[DevTo] API error:',
                res.status,
                res.statusText,
                text,
            );
            return [];
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
            console.warn('[DevTo] Unexpected response format:', typeof data);
            return [];
        }
        return data.map((a: any) => ({
            id: `devto-${a.id}`,
            title: a.title || 'Untitled Article',
            description: a.description || a.body_markdown?.slice(0, 200) || '',
            source: 'dev.to',
            url: a.url || 'https://dev.to',
            tags: a.tag_list || [],
            thumbnail: a.cover_image || undefined,
        }));
    } catch (err) {
        console.error('[DevTo] Fetch exception:', err);
        return [];
    }
}

export async function fetchGithubProjects(): Promise<LearningResource[]> {
    try {
        const q = encodeURIComponent('stars:>500');
        const url = `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=12`;
        const headers: any = { Accept: 'application/vnd.github+json' };
        if (process.env.GITHUB_TOKEN) {
            headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
        }
        const res = await fetch(url, { headers });
        if (!res.ok) {
            const text = await res.text().catch(() => '<no body>');
            console.error(
                '[GitHub] API error:',
                res.status,
                res.statusText,
                text,
            );
            return [];
        }
        const data = await res.json();
        if (!data.items || !Array.isArray(data.items)) {
            console.warn('[GitHub] No items in response:', data);
            return [];
        }
        return data.items.map((r: any) => ({
            id: `gh-${r.id}`,
            title: r.full_name || r.name || 'Unknown Repo',
            description: r.description || '',
            source: 'github',
            url: r.html_url || `https://github.com/${r.full_name}`,
            tags: [r.language].filter(Boolean),
            stars: r.stargazers_count || 0,
        }));
    } catch (err) {
        console.error('[GitHub] Fetch exception:', err);
        return [];
    }
}

export async function fetchYoutubeVideos(): Promise<LearningResource[]> {
    if (!process.env.YT_API_KEY) {
        console.warn('[YouTube] YT_API_KEY not set; skipping YouTube fetch');
        return [];
    }

    try {
        const q = encodeURIComponent('programming tutorials');
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=12&q=${q}&key=${process.env.YT_API_KEY}`;
        const res = await fetch(url);
        if (!res.ok) {
            const text = await res.text().catch(() => '<no body>');
            console.error(
                '[YouTube] API error:',
                res.status,
                res.statusText,
                text,
            );
            return [];
        }
        const data = await res.json();
        if (
            !data.items ||
            !Array.isArray(data.items) ||
            data.items.length === 0
        ) {
            console.warn(
                '[YouTube] No items returned. Check quota/key/API status.',
            );
            return [];
        }
        return data.items.map((p: any) => {
            const videoId =
                p.id?.videoId || (typeof p.id === 'string' ? p.id : undefined);
            return {
                id: `yt-${videoId || p.etag || Math.random().toString(36).slice(2, 9)}`,
                title: p.snippet?.title || 'YouTube Video',
                description: p.snippet?.description || '',
                source: 'youtube',
                url: videoId
                    ? `https://www.youtube.com/watch?v=${videoId}`
                    : 'https://www.youtube.com/',
                thumbnail:
                    p.snippet?.thumbnails?.medium?.url ||
                    p.snippet?.thumbnails?.default?.url,
            };
        });
    } catch (err) {
        console.error('[YouTube] Fetch exception:', err);
        return [];
    }
}

export async function fetchUdemy(): Promise<LearningResource[]> {
    const clientId = process.env.UDEMY_CLIENT_ID;
    const clientSecret = process.env.UDEMY_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        console.warn(
            '[Udemy] Credentials not provided; returning fallback sample course',
        );
        return [
            {
                id: 'course-udemy-sample',
                title: 'Sample Udemy Course',
                description:
                    'Set UDEMY_CLIENT_ID and UDEMY_CLIENT_SECRET in .env.local to fetch real courses',
                source: 'udemy',
                url: 'https://www.udemy.com/',
                tags: ['web', 'sample'],
            },
        ];
    }

    try {
        const auth = Buffer.from(`${clientId}:${clientSecret}`).toString(
            'base64',
        );
        const url = 'https://www.udemy.com/api-2.0/courses/?page_size=12';
        const res = await fetch(url, {
            headers: {
                Authorization: `Basic ${auth}`,
                Accept: 'application/json, text/plain, */*',
            },
        });
        if (!res.ok) {
            const text = await res.text().catch(() => '<no body>');
            console.error(
                '[Udemy] API error:',
                res.status,
                res.statusText,
                text,
            );
            return [];
        }
        const data = await res.json();
        const courses = data.results || data.courses || [];
        if (!Array.isArray(courses)) {
            console.warn('[Udemy] Unexpected response format:', data);
            return [];
        }
        return courses.map((c: any) => ({
            id: `udemy-${c.id || c.course_id || Math.random().toString(36).slice(2, 9)}`,
            title: c.title || c.name || 'Udemy Course',
            description: c.short_description || c.description || '',
            source: 'udemy',
            url: c.url
                ? c.url.startsWith('http')
                    ? c.url
                    : `https://www.udemy.com${c.url}`
                : 'https://www.udemy.com/',
            tags: c.primary_subcategory
                ? [c.primary_subcategory.title].filter(Boolean)
                : [],
            thumbnail: c.image_240x135 || c.image || undefined,
            duration: c.content_length || undefined,
        }));
    } catch (err) {
        console.error('[Udemy] Fetch exception:', err);
        return [];
    }
}

export async function fetchCourseraCertifications(): Promise<
    LearningResource[]
> {
    try {
        const url =
            'https://api.coursera.org/api/courses.v1?fields=photoUrl,description,primaryDomain&limit=12';
        const res = await fetch(url);
        if (!res.ok) {
            const text = await res.text().catch(() => '<no body>');
            console.error(
                '[Coursera] API error:',
                res.status,
                res.statusText,
                text,
            );
            return [
                {
                    id: 'cert-coursera-sample',
                    title: 'Sample Coursera Certification',
                    description:
                        'Coursera API may require additional config or keys; this is a fallback entry',
                    source: 'coursera',
                    url: 'https://www.coursera.org/',
                    tags: [],
                },
            ];
        }
        const data = await res.json();
        const elements = data.elements || [];
        if (!Array.isArray(elements) || elements.length === 0) {
            console.warn('[Coursera] No elements returned:', data);
            return [
                {
                    id: 'cert-coursera-sample',
                    title: 'Sample Coursera Certification',
                    description: 'No courses found; check Coursera API status',
                    source: 'coursera',
                    url: 'https://www.coursera.org/',
                    tags: [],
                },
            ];
        }
        return elements.map((c: any) => ({
            id: `coursera-${c.id || Math.random().toString(36).slice(2, 9)}`,
            title: c.name || c.fullName || c.slug || 'Coursera Course',
            description: c.description || '',
            source: 'coursera',
            url: c.slug
                ? `https://www.coursera.org/learn/${c.slug}`
                : 'https://www.coursera.org/',
            thumbnail: c.photoUrl || undefined,
            tags: c.primaryDomain ? [c.primaryDomain] : [],
        }));
    } catch (err) {
        console.error('[Coursera] Fetch exception:', err);
        return [
            {
                id: 'cert-coursera-sample',
                title: 'Sample Coursera Certification',
                description:
                    'Coursera fetch failed; check network or API status',
                source: 'coursera',
                url: 'https://www.coursera.org/',
                tags: [],
            },
        ];
    }
}

/**
 * Fetch resources by category
 */
export async function fetchResourcesByCategory(
    category: string,
): Promise<LearningResource[]> {
    switch (category) {
        case 'blogs':
            return fetchDevTo();
        case 'projects':
            return fetchGithubProjects();
        case 'videos':
            return fetchYoutubeVideos();
        case 'courses':
            return fetchUdemy();
        case 'certifications':
            return fetchCourseraCertifications();
        default:
            console.warn(`[CareerInsights] Unknown category: ${category}`);
            return [];
    }
}
