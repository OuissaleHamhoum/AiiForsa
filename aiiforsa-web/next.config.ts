import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    turbopack: {
        root: __dirname,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'dev.to',
            },
            {
                protocol: 'https',
                hostname: 'media2.dev.to',
            },
            {
                protocol: 'https',
                hostname: 'dev-to-uploads.s3.amazonaws.com',
            },
            {
                protocol: 'https',
                hostname: 'githubusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'avatars.githubusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'img.youtube.com',
            },
            {
                protocol: 'https',
                hostname: 'i.ytimg.com',
            },
            {
                protocol: 'https',
                hostname: 'ytimg.com',
            },
            {
                protocol: 'https',
                hostname: 'udemy.com',
            },
            {
                protocol: 'https',
                hostname: 'coursera.org',
            },
            {
                protocol: 'https',
                hostname: 'about.coursera.org',
            },
            {
                protocol: 'https',
                hostname: 'd3njjcbhbojbot.cloudfront.net',
            },
            {
                protocol: 'https',
                hostname: 'example.com',
            },
        ],
    },
};

export default nextConfig;
