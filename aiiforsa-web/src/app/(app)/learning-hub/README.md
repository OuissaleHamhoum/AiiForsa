Learning Resource Hub

This folder contains a lightweight Learning Hub page and a simple aggregation API route.

Environment variables (optional):

- GITHUB_TOKEN: GitHub token to increase search rate limits for projects.
- YT_API_KEY: YouTube Data API key to fetch playlists.

How it works:

- The client page at `/learning-hub` calls the server route `/api/resources/:category`.
- The server route aggregates Dev.to, GitHub and YouTube (when key provided). Courses and certifications are currently sample/fallback data.
- Responses are cached in-memory for 24h in the server route.

To run locally:

1. Add env vars to your `.env.local` if you need API keys (optional).
2. Start the Next.js dev server: `pnpm dev` or `npm run dev` (use the project's preferred package manager).

Notes & next steps:

- This is a frontend-first implementation. If you want a full NestJS + Postgres backend with cron jobs and persisted bookmarks, I can scaffold a `backend/` folder and a Prisma schema next.
- Bookmarking is currently stored in `localStorage` under `lh_bookmarks`.
