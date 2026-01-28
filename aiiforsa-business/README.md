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

# AII-Forsa — Business Portal

One-line description: AII-Forsa Business Portal is a Next.js-based web application for businesses to manage job postings, review applications, and handle company profiles.

[![build status](https://img.shields.io/badge/build-pending-lightgrey)](https://example.com) [![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**Note: This portal is restricted to BUSINESS role users only.**

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

Below are the routes and features available in the Business Portal.

### Authentication
- Login — `/login`
  - Source: `src/app/(auth)/login/page.tsx` (form: `src/components/auth/LoginForm.tsx`)
  - Purpose: Authenticate business users using NextAuth-backed sessions. Only users with BUSINESS role can access the portal.
  - Behavior: Validates credentials and role, creates a session cookie via NextAuth, then redirects to `/dashboard`. Non-business users are denied access.

- Register — `/register`
  - Source: `src/app/(auth)/register/page.tsx` (form: `src/components/auth/RegisterForm.tsx`)
  - Purpose: Create a new business account. Collects company and contact information.
  - Behavior: Submits to the API/auth backend, shows validation and success feedback.

- Forgot password — `/forgot-password`
  - Source: `src/app/(auth)/forgot-password/page.tsx` (form: `src/components/auth/ForgotPasswordForm.tsx`)
  - Purpose: Allow business users to request a password reset email.
  - Behavior: Sends a reset request to the backend with a secure reset link.

- Reset password — `/reset-password`
  - Source: `src/app/(auth)/reset-password/page.tsx` (form: `src/components/auth/ResetPasswordForm.tsx`)
  - Purpose: Accept a secure token from an email and allow the user to set a new password.
  - Behavior: Verifies the token, updates the password via the API.

- Auth error page — `/error`
  - Source: `src/app/(auth)/error/page.tsx`
  - Purpose: Show user-friendly messages for common auth errors (unauthorized access, invalid token, expired session).

### Business Portal Features

- Dashboard — `/dashboard`
  - Source: `src/app/(business)/dashboard/page.tsx`
  - Purpose: Central hub for business users showing overview of job postings, applications, and key metrics.
  - Behavior: Displays summary cards, recent activity, and quick actions for job management.

- Jobs Management — `/jobs`
  - Source: `src/app/(business)/jobs/page.tsx`
  - Purpose: Create, edit, and manage job postings. View all active and archived positions.
  - Behavior: CRUD operations for job listings with filtering and search capabilities.

- Applications — `/applications`
  - Source: `src/app/(business)/applications/page.tsx`
  - Purpose: Review and manage job applications submitted by candidates.
  - Behavior: View applicant details, filter by status, approve/reject applications.

- Company Profile — `/company/profile`
  - Source: `src/app/(business)/company/profile/page.tsx`
  - Purpose: Manage company information, contact details, and business description.
  - Behavior: Edit and update company profile data.

- Company Branding — `/company/branding`
  - Source: `src/app/(business)/company/branding/page.tsx`
  - Purpose: Customize company branding including logo, colors, and visual identity.
  - Behavior: Upload and manage branding assets.

- Settings — `/settings`
  - Source: `src/app/(business)/settings/page.tsx`
  - Purpose: Configure business portal preferences and account settings.
  - Behavior: Update notification preferences, security settings, and integrations.

- Statistics — `/stats`
  - Source: `src/app/(business)/stats/page.tsx`
  - Purpose: View analytics and metrics for job postings and applications.
  - Behavior: Display charts, graphs, and reports on hiring performance.

- Agenda — `/agenda`
  - Source: `src/app/(business)/agenda/page.tsx`
  - Purpose: Schedule and manage interviews, meetings, and important dates.
  - Behavior: Calendar view with event management capabilities.

### API
- NextAuth (auth API routes) — `/api/auth/*` — `src/app/api/auth/[...nextauth]/route.ts`
  - Purpose: Server-side authentication endpoints (sign-in, token handling, callbacks). NextAuth settings control session strategy and providers. Only BUSINESS role users are authorized.

### Shared UI & components
- Purpose: Reusable components live under `src/components` and include form controls, buttons, dialogs, and business-specific UI elements.
- Examples: `src/components/ui/*`, `src/components/business/*`, `src/components/auth/*` provide the primitives and higher-level pieces used across pages.

### Access Control
- **Role-Based Access**: Only users with `BUSINESS` role can access the portal
- **Authentication**: Enforced at middleware level and in page layouts
- **Authorization**: Session verification checks for business role on every protected route

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



