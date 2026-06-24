# PlanNode

Collaborative workspace management application built with Next.js and Supabase. Supports multi-workspace setups, real-time notifications, user profiles, and full internationalization (English and Polish).

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Category        | Technology                              |
| --------------- | --------------------------------------- |
| Framework       | Next.js 16.2 (App Router)               |
| Language        | TypeScript 6                            |
| UI              | React 19, Tailwind CSS 4, Shadcn UI     |
| Components      | Radix UI, Lucide React                  |
| Forms           | React Hook Form 7 + Zod 4              |
| Backend/DB      | Supabase (PostgreSQL 17, Auth, Realtime)|
| i18n            | next-intl 4                             |
| Theming         | next-themes                             |
| Toasts          | Sonner                                  |
| Package Manager | pnpm 11                                 |

---

## Features

- **Authentication** — Email/password signup with email confirmation, login, forgot password, password reset
- **Profile Settings** — Update full name, email (with confirmation flow), password
- **Workspaces** — Multi-workspace support with active workspace selection
- **Notifications** — Real-time notifications via Supabase Realtime (postgres_changes)
- **Internationalization** — English and Polish, locale-prefixed routing (`/en/...`, `/pl/...`)
- **Dark Mode** — Light/dark/system theme with persistent preference
- **Role System** — `admin` and `user` roles with Row Level Security enforced at the DB level
- **Responsive Design** — Collapsible sidebar, mobile-friendly layout

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 11+ (`npm install -g pnpm`)
- **Supabase account** — [supabase.com](https://supabase.com) (or local Supabase CLI for local dev)
- **Supabase CLI** (optional, for local development) — [Installation guide](https://supabase.com/docs/guides/cli)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/plannode.git
cd plannode
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Fill in the required variables — see [Environment Variables](#environment-variables) below.

### 4. Set up Supabase

**Option A — Supabase cloud (recommended for getting started)**

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API** and copy your Project URL and anon key
3. Paste them into `.env.local`
4. Run the migrations:

```bash
supabase db push
```

**Option B — Local Supabase**

```bash
supabase start
```

This starts a local Supabase stack. Copy the printed URL and anon key into `.env.local`. Migrations in `supabase/migrations/` are applied automatically.

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable                              | Required | Description                                        |
| ------------------------------------- | -------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`            | Yes      | Supabase project URL                               |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`| Yes      | Supabase anon/publishable key                      |
| `RESEND_API_KEY`                      | No       | Resend API key for transactional emails            |
| `RESEND_FROM_EMAIL`                   | No       | Sender address for emails (e.g. `noreply@...`)     |

**Where to find them:**

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase dashboard → Project Settings → API
- `RESEND_API_KEY` — [resend.com](https://resend.com) → API Keys
- For local dev, `supabase start` prints all local values

---

## Database

The schema lives in `supabase/migrations/`. Migrations are applied in order by timestamp.

### Tables

**`profiles`** — User profile data, created automatically on signup

| Column       | Type        | Notes                              |
| ------------ | ----------- | ---------------------------------- |
| `id`         | uuid        | PK, references `auth.users(id)`    |
| `full_name`  | text        | NOT NULL                           |
| `email`      | text        | UNIQUE, NOT NULL, synced from auth |
| `role`       | user_role   | `'admin'` or `'user'`, default `'user'` |
| `locale`     | text        | User's preferred locale            |
| `created_at` | timestamptz |                                    |
| `updated_at` | timestamptz | Auto-updated via trigger           |

**`workspaces`** — Workspace definitions

**`notifications`** — In-app notifications with Supabase Realtime enabled

### Row Level Security

All tables use RLS. Users can only read and modify their own data. Admins have full access via the `is_admin()` DB function.

### Running migrations

```bash
# Against cloud project
supabase db push

# Against local instance
supabase db reset   # re-applies all migrations from scratch
```

---

## Available Scripts

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Start the Next.js development server     |
| `pnpm build`     | Build for production                     |
| `pnpm start`     | Start the production server              |
| `pnpm lint`      | Run ESLint                               |
| `pnpm typecheck` | TypeScript type checking (`tsc --noEmit`)|

---

## Project Structure

```
├── app/
│   └── [locale]/               # All routes prefixed with locale
│       ├── app/                # Protected application routes
│       │   ├── dashboard/
│       │   ├── notifications/
│       │   └── settings/
│       └── auth/               # Guest-only routes
│           ├── login/
│           ├── sign-up/
│           └── forgot-password/
├── components/
│   ├── auth/                   # Login, signup, password forms
│   ├── landing/                # Marketing page sections
│   ├── notifications/          # Notification list, indicator, realtime
│   ├── nav/                    # Sidebar and top navigation
│   ├── profile/                # Profile settings forms
│   ├── providers/              # Context providers, DashboardShell
│   └── ui/                     # Shadcn base components
├── actions/                    # Next.js server actions (mutations)
├── lib/
│   ├── data/                   # Server-side data fetching
│   └── supabase/               # Supabase clients (browser, server, middleware)
├── schema/                     # Zod validation schemas
├── types/                      # TypeScript types and DTOs
├── hooks/                      # Custom React hooks
├── messages/                   # i18n translation files (en.json, pl.json)
├── i18n/                       # next-intl routing config
├── const/                      # App-wide constants (routes, roles)
└── supabase/
    ├── migrations/             # SQL migration files
    └── config.toml             # Local Supabase config
```

---

## Architecture

### Routing and Middleware

Every route is wrapped under `[locale]` (e.g. `/en/app/dashboard`). The middleware in `proxy.ts` runs on every request and:

1. Refreshes the Supabase session (reads/writes cookies)
2. Applies next-intl locale detection and routing
3. Redirects unauthenticated users to `/[locale]/auth/login`
4. Redirects authenticated users away from guest-only routes

### Data Flow

```
Server Component
  └── lib/data/* (server Supabase client) → PostgreSQL
        └── props → Client Component
                      └── server actions → PostgreSQL
                            └── revalidatePath → re-render
```

- **Data fetching** — async server components calling `lib/data/` functions (server Supabase client)
- **Mutations** — Next.js server actions in `actions/`, call `revalidatePath` after writes
- **Real-time** — Client components subscribe to `postgres_changes` via browser Supabase client, call `router.refresh()` on events to re-render server components with fresh data

### Authentication

Supabase Auth with `@supabase/ssr` for session handling in Next.js:

- Sessions stored in secure httpOnly cookies
- `lib/supabase/server.ts` — server-side client (server components, actions)
- `lib/supabase/client.ts` — browser client (client components, realtime)
- `lib/supabase/proxy.ts` — middleware client for session refresh

### Internationalization

All UI strings live in `messages/en.json` and `messages/pl.json`. The active locale is part of the URL. Users can switch language from the sidebar; their preference is persisted to the `profiles.locale` column.

---

## Deployment

The project is ready for **Vercel** deployment.

### Vercel

1. Push the repository to GitHub
2. Import the project in [vercel.com](https://vercel.com)
3. Set environment variables in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `RESEND_API_KEY` (if using email)
   - `RESEND_FROM_EMAIL` (if using email)
4. Deploy — Vercel will run `pnpm build` automatically

### Supabase (production)

- Use a Supabase cloud project for production
- Apply migrations with `supabase db push` (requires linking your project: `supabase link --project-ref <ref>`)
- Enable Realtime for the `notifications` table in the Supabase dashboard → Database → Replication

---

## Troubleshooting

### `Invalid API key` / auth errors

Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` match your Supabase project. For local dev, verify `supabase status` shows the service is running.

### Emails not sending

Ensure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set. For local dev, Supabase Inbucket (port 54324) catches all auth emails — no real email service needed.

### Locale not detected

Clear cookies and try again. If using a custom domain in production, ensure the middleware matcher covers all routes.

### Type errors after pulling changes

```bash
pnpm typecheck
```

Run this first. Most type errors surface missing env variables or schema mismatches after migrations.

### Supabase local not starting

```bash
supabase stop
supabase start
```

If Docker is not running, start Docker Desktop first.
