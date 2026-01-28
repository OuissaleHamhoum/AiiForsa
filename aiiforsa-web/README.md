This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

# AII-Forsa — Web

One-line description: AII-Forsa is a Next.js-based job application & interview assistant web app with authentication, applied-job management (grid/kanban/calendar), interview workflows and a resume builder.

[![build status](https://img.shields.io/badge/build-pending-lightgrey)](https://example.com) [![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## Table of contents

- Features
- Quick start
- Environment
- Project structure
- Routes (auto-generated)
- Development scripts
- Testing & linting
- Deployment
- Contributing
- Maintainers & license

## Features

Below are the public routes with a short explanation of what each feature does, who it's for, and how to use it.

### Authentication

- Login — `/login`
    - Source: `src/app/(auth)/login/page.tsx` (form: `src/components/auth/LoginForm.tsx`)
    - Purpose: Authenticate returning users using NextAuth-backed sessions. Users sign in with email/password or external providers (if configured server-side).
    - Behavior: Validates credentials, creates a session cookie via NextAuth, then redirects to `/` (dashboard). Error messages are shown for invalid credentials or server errors.

- Register — `/register`
    - Source: `src/app/(auth)/register/page.tsx` (form: `src/components/auth/RegisterForm.tsx`)
    - Purpose: Create a new user account. Collects name, email, password and any onboarding choices.
    - Behavior: Submits to the API/auth backend, shows validation and success feedback, and typically redirects to login or auto-signs-in depending on backend flow.

- Forgot password — `/forgot-password`
    - Source: `src/app/(auth)/forgot-password/page.tsx` (form: `src/components/auth/ForgotPasswordForm.tsx`)
    - Purpose: Allow users to request a password reset email.
    - Behavior: Sends a reset request to the backend; the backend is expected to deliver an email with a secure reset link or token.

- Reset password — `/reset-password`
    - Source: `src/app/(auth)/reset-password/page.tsx` (form: `src/components/auth/ResetPasswordForm.tsx`)
    - Purpose: Accept a secure token from an email and allow the user to set a new password.
    - Behavior: Verifies the token, updates the password via the API, and provides success/failure feedback.

- Auth error page — `/error`
    - Source: `src/app/(auth)/error/page.tsx`
    - Purpose: Show user-friendly messages for common auth errors (invalid token, expired session, provider errors).

### Main app

- Home / Dashboard — `/`
    - Source: `src/app/(app)/page.tsx` (layouts: `src/app/layout.tsx`, `src/app/(app)/layout.tsx`)
    - Purpose: Central landing page for authenticated users. Presents a summary of recent activity (applied jobs, upcoming interviews, quick actions) and links into the main workflows.
    - Behavior: Redirects unauthenticated users to `/login` (if auth gating is configured). Pulls data from the API and shows cards, lists or widgets.

- Profile — `/profile`
    - Source: `src/app/(app)/profile/page.tsx`
    - Purpose: View and edit your account information (name, email, role, ID). The profile page uses the same application layout and sidebar so users keep access to navigation while viewing their profile.

### Applied Jobs (job application management)

The Applied Jobs section helps users track the jobs they've applied to and manage application stages.

- Applied Jobs list — `/applied-jobs`
    - Source: `src/app/(app)/applied-jobs/page.tsx`, layout: `src/app/(app)/applied-jobs/layout.tsx`
    - Purpose: A consolidated list of job applications with filtering and quick actions (view details, edit, archive).

- Grid view — `/applied-jobs/grid`
    - Source: `src/app/(app)/applied-jobs/grid/page.tsx`
    - Purpose: Visual grid/cards layout for browsing applications; useful for glancing at status and company branding.

- Kanban view — `/applied-jobs/kanban`
    - Source: `src/app/(app)/applied-jobs/kanban/page.tsx`
    - Purpose: Stage-based workflow board (e.g., Applied → Interview → Offer → Rejected). Drag-and-drop support lets users move applications between stages and persist changes.

- Calendar view — `/applied-jobs/calendar`
    - Source: `src/app/(app)/applied-jobs/calendar/page.tsx` (context: `src/app/(app)/applied-jobs/context/AppliedJobsContext.tsx`)
    - Purpose: Calendar scheduling view to track interview dates, follow-ups, and deadlines. Integrates with application entries and shows events per date.

Common behaviors for Applied Jobs

- Filtering, sorting, and quick edit actions are available across views. The Kanban and Grid views typically use local state + API sync and optimistic UI patterns for responsive interactions.

### Job Matching & Database Management

AI-powered job matching using ChromaDB vector database for semantic search and CV-job matching.

- Job Matching — `/jobs`
    - Source: `src/app/(app)/jobs/page.tsx` (component: `src/components/jobs/JobMatcher.tsx`)
    - Purpose: Upload CV or paste content to find matching jobs using AI semantic search. Shows relevance scores and job details.
    - Behavior: Processes CV text through vector embeddings, queries ChromaDB for similar jobs, displays ranked results with match scores.

- Admin Job Management — `/admin/jobs`
    - Source: `src/app/(app)/admin/jobs/page.tsx` (component: `src/components/jobs/JobManager.tsx`)
    - Purpose: Admin interface to manage jobs in the ChromaDB vector database. Add, view, and delete jobs with full metadata.
    - Behavior: CRUD operations on vector database with auto-sync to relational database. Includes comprehensive job form with skills, salary, location, etc.

### Interview flow

This section supports conducting interviews, capturing session data, and generating reports/analysis.

- Overview — `/interview`
    - Source: `src/app/(app)/interview/page.tsx`
    - Purpose: Entry point to interview tooling — schedule sessions, view upcoming interviews and start analysis.

- Analysis — `/interview/analysis`
    - Source: `src/app/(app)/interview/analysis/page.tsx`
    - Purpose: Run or view automated analysis for completed interview sessions (e.g., skill scoring, sentiment, highlights). This may call backend AI/analysis services.

- Results — `/interview/results`
    - Source: `src/app/(app)/interview/results/page.tsx` (component: `src/components/interview/InterviewReports.tsx`)
    - Purpose: Display human-readable reports, transcripts and scores produced from interview sessions. Reports can be exported or attached to applications.

- Session — `/interview/session`
    - Source: `src/app/(app)/interview/session/page.tsx`
    - Purpose: Live interview session UI where interviews are recorded, notes are taken, or a candidate's responses are captured. May integrate with recording or real-time services.

### Resume Builder

Create, edit, and export resumes tailored for job applications.

- Index — `/resume-builder`
    - Source: `src/app/(app)/resume-builder/page.tsx`
    - Purpose: Landing and list of saved resumes with preview and quick actions (edit, duplicate, export).

- New — `/resume-builder/new` and `/resume-builder/new-resume`
    - Source: `src/app/(app)/resume-builder/new/page.tsx`, `src/app/(app)/resume-builder/new-resume/page.tsx`
    - Purpose: Guided creation flows or templates for building a new resume; may include onboarding, templates, and sections.

- By id — `/resume-builder/[resumeId]`
    - Source: `src/app/(app)/resume-builder/[resumeId]/page.tsx`
    - Purpose: Edit or preview a specific resume. Offers WYSIWYG-style editing, content sections, preview panel, and export to PDF or shareable link.

### API

- NextAuth (auth API routes) — `/api/auth/*` — `src/app/api/auth/[...nextauth]/route.ts`
    - Purpose: Server-side authentication endpoints (sign-in, token handling, callbacks). NextAuth settings control session strategy and providers.

### Shared UI & components

- Purpose: Reusable components live under `src/components` and include form controls, buttons, dialogs, calendars, and resume-builder building blocks.
- Examples: `src/components/ui/*`, `src/components/resume-builder/*`, `src/components/interview/*` provide the primitives and higher-level pieces used across pages.

If you'd like, I can add short usage examples (API payloads, example requests, or screenshots) for any of the above features. I can also generate a 'how-to' developer doc for implementing a new page or component following the project's patterns.

## Quick start

Prerequisites

- Node.js v18+ recommended
- npm, pnpm or yarn

Clone, install, prepare environment, and run

```powershell
git clone <repo-url>
cd c:\Users\anisb\OneDrive\Desktop\AII-Forsa\aiiforsa-web

# Install dependencies (choose one)
npm i
# or
# pnpm install
# or
# yarn install

# Copy environment example -> .env.local (PowerShell)
# If the repo provides an `.env.example`, run:
If (Test-Path .\.env.example) { Copy-Item .\.env.example .\.env.local -Force }
# Otherwise, create `.env.local` and add the variables shown in the Environment section below.

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment

Copy `.env.local.example` or create `.env.local` in the project root and set the following keys (example values, do NOT put real secrets here):

```
NEXT_PUBLIC_API_URL=http://localhost:4050/api/v1
AUTH_SECRET=change-me-in-production
AUTH_URL=http://localhost:3000
NODE_ENV=development
```

The repository currently contains `.env.local` with placeholder values. Do not commit secrets.

## Project structure and route groups

- `src/app` — Next.js App Router pages and nested layouts. Note: this project uses route groups (folders named in parentheses) such as `(auth)` and `(app)`. Those folder names are only for organizing source — they do not appear in the final public URL. Example:
    - `src/app/(auth)/login/page.tsx` -> public path: `/login`

- `src/components` — shared UI primitives, auth forms, resume builder components, interview reports, layout components, and providers.

Key files

- `src/components/providers/Providers.tsx` — global React providers
- `src/components/layouts/AppSidebar.tsx` — main app sidebar
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth backend route

This repository also includes `routes.json` (auto-generated) mapping public URLs to the implementing source files.

## Development scripts (from package.json)

- `npm run dev` — start dev server (uses turbopack)
- `npm run build` — production build
- `npm run start` — start built app
- `npm run lint` — run eslint
- `npm run lint:fix` — run eslint --fix
- `npm run type-check` — run TypeScript type check
- `npm run format` — run Prettier formatting
- `npm run clean` — remove build artifacts

## Testing & linting

There is no test runner script configured in `package.json`. Use the following checks during development:

- Type check: `npm run type-check`
- Lint: `npm run lint`
- Format: `npm run format`

If you want, I can add a `test` script (Jest / Vitest) and basic unit tests.

## Deployment

Recommended: Vercel (first-class Next.js support). Also works with any Node host that supports Next.js.

Basic steps for Vercel

1. Push to GitHub
2. Connect repo in Vercel and set environment variables in the Vercel dashboard
3. Vercel will run `npm run build` and deploy

General

- Ensure `NEXT_PUBLIC_API_URL` points to the backend API in production and `AUTH_SECRET` is set to a secure value.

## Contributing

Suggested PR checklist

- Fork and branch from `main` (feature/your-feature)
- Run `npm run type-check` and `npm run lint`
- Run `npm run format`
- Keep changes small and focused; include tests if possible
- Open PR with a short description and link to relevant issue

Pre-PR automated checks recommended (CI)

- Type check, lint, build

## Maintainters & license

Add maintainer contact and a `LICENSE` file. This README includes an `MIT` badge placeholder — replace with your chosen license and commit a `LICENSE` file.

## Changelog

Add a `CHANGELOG.md` or use GitHub Releases for changelog notes.

---

Generated files

- `routes.json` — machine-readable mapping of public routes to source files.
