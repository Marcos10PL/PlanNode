# PlanNode

Collaborative workspace management application built with Next.js and Supabase. Supports multi-workspace setups with role-based team management, invitations, real-time notifications, user profiles, and full internationalization (English and Polish).

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

| Category        | Technology                               |
| ---------------- | ----------------------------------------- |
| Framework       | Next.js 16.2 (App Router)                 |
| Language        | TypeScript 6                              |
| UI              | React 19, Tailwind CSS 4, Shadcn UI       |
| Components      | Radix UI, Lucide React                    |
| Forms           | React Hook Form 7 + Zod 4                 |
| Backend/DB      | Supabase (PostgreSQL 17, Auth, Realtime)  |
| Email           | Resend                                    |
| i18n            | next-intl 4                               |
| Theming         | next-themes                               |
| Toasts          | Sonner                                    |
| Package Manager | pnpm 11                                   |

---

## Features

- **Authentication** — Email/password signup with email confirmation, login, forgot password, password reset
- **Profile Settings** — Update full name, email (with confirmation flow), password, and preferred locale
- **Workspaces** — Create, edit, delete workspaces; multi-workspace support with active workspace selection (persisted in a cookie)
- **Team Management** — Invite members by email, assign roles (`owner`, `admin`, `member`, `guest`), update roles, remove members, leave a workspace
- **Invitations** — Token-based invite links (`/invite/[token]`), accept/decline flow with email-match and expiry checks
- **Notifications** — Real-time in-app notifications via Supabase Realtime (`postgres_changes`), backed by transactional emails (Resend) for workspace invitations
- **App Config** — Server-driven config values (e.g. max workspaces per user) stored in `app_config` and read at runtime
- **Internationalization** — English and Polish, locale-prefixed routing (`/en/...`, `/pl/...`)
- **Dark Mode** — Light/dark/system theme with persistent preference
- **Role System** — Two independent role layers: platform-level `admin`/`user` (`profiles.role`) and per-workspace `owner`/`admin`/`member`/`guest` (`workspace_members.role`), both enforced via Row Level Security
- **Responsive Design** — Collapsible sidebar, mobile-friendly layout

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 11+ (`npm install -g pnpm`)
- **Supabase account** — [supabase.com](https://supabase.com) (or local Supabase CLI for local dev)
- **Supabase CLI** (optional, for local development) — [Installation guide](https://supabase.com/docs/guides/cli)
- **Docker** (only if running Supabase locally via the CLI)

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
2. Go to **Project Settings → API** and copy your Project URL and anon/publishable key
3. Paste them into `.env.local`
4. Link the project and push the schema:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

5. Enable Realtime for the `notifications` table (Dashboard → Database → Replication) — this is also declared in `supabase/schemas/notifications.sql`, so `db push` handles it automatically for new projects.

**Option B — Local Supabase**

```bash
supabase start
```

This starts a local Supabase stack (Postgres, Auth, Realtime, Storage, Inbucket for email testing). Copy the printed URL and anon/publishable key into `.env.local`. Migrations in `supabase/migrations/` are applied automatically on `start`/`reset`.

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable                               | Required | Description                                     |
| --------------------------------------- | -------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`              | Yes      | Supabase project URL                              |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`  | Yes      | Supabase anon/publishable key                     |
| `RESEND_API_KEY`                       | No       | Resend API key, used to send invitation emails    |
| `RESEND_FROM_EMAIL`                    | No       | Sender address for emails (e.g. `noreply@...`)    |

**Where to find them:**

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase dashboard → Project Settings → API
- `RESEND_API_KEY` — [resend.com](https://resend.com) → API Keys
- For local dev, `supabase start` (or `supabase status`) prints all local values; emails are caught by Inbucket instead of sent for real, so `RESEND_API_KEY` is optional locally

---

## Database

The schema is defined declaratively in `supabase/schemas/*.sql` (the source of truth, loaded in the order listed in `supabase/config.toml`) and shipped as timestamped migrations in `supabase/migrations/`. When changing the schema, edit the relevant file under `supabase/schemas/`, then generate a migration with `pnpm migration:diff <name>` and apply it locally with `supabase db reset` (or `db push` for a remote project).

### Tables

**`profiles`** (`schemas/profiles.sql`) — user profile data, created automatically on signup via a trigger on `auth.users`

| Column       | Type        | Notes                                        |
| ------------ | ----------- | --------------------------------------------- |
| `id`         | uuid        | PK, references `auth.users(id)`               |
| `full_name`  | text        | NOT NULL                                      |
| `email`      | text        | UNIQUE, NOT NULL, synced from `auth.users`     |
| `role`       | user_role   | `'admin'` or `'user'`, default `'user'`       |
| `locale`     | locale      | `'pl'` or `'en'`, default `'pl'`              |
| `created_at` | timestamptz |                                                |
| `updated_at` | timestamptz | auto-updated via trigger                      |

**`workspaces`** (`schemas/workspaces.sql`) — workspace definitions, one owner per workspace (`owner_id`)

**`workspace_members`** (`schemas/workspaces.sql`) — join table between `profiles` and `workspaces`; `role` is one of `owner`, `admin`, `member`, `guest`

**`workspace_invitations`** (`schemas/workspaces.sql`) — pending/accepted/declined invites, identified by a unique `token`, scoped by `(workspace_id, email)` while `pending`, with `expires_at`

**`notifications`** (`schemas/notifications.sql`) — in-app notifications with Supabase Realtime enabled (added to the `supabase_realtime` publication); rows are created via the `create_notification()` SECURITY DEFINER function so any authenticated user can notify another user without direct INSERT access

**`email_templates`** (`schemas/email_templates.sql`) — HTML templates (subject + body + variable placeholders) used when sending transactional emails, editable by admins

**`app_config`** (`schemas/app_config.sql`) — key/value store (`jsonb`) for runtime-configurable values such as `max_workspaces_per_user`; readable by all authenticated users, writable only via `service_role`

### Row Level Security

Every table has RLS enabled. Two independent authorization layers are enforced at the database level, not just in the app:

- **Platform role** (`profiles.role`) — `admin` users bypass most restrictions via the `is_admin()` helper function
- **Workspace role** (`workspace_members.role`) — membership and role are checked with `is_workspace_member()` / `get_workspace_member_role()` helper functions; only `owner`/`admin` members can manage invitations, members, and workspace settings. Invited-but-not-yet-joined users can still see the invitation itself and the target workspace's name (via a dedicated policy) so the invite page can render before they accept.

### Running migrations

```bash
# Generate a migration from schema changes (diffs supabase/schemas against the local DB)
pnpm migration:diff <migration_name>

# Apply against the local instance (re-applies all migrations + seed from scratch)
supabase db reset

# Apply against a linked cloud project
pnpm migration:push
```

### Regenerating types

After any schema change, regenerate the TypeScript types used by `types/supabase.ts`:

```bash
pnpm generate-types
```

---

## Available Scripts

| Command                | Description                                          |
| ----------------------- | ----------------------------------------------------- |
| `pnpm dev`              | Start the Next.js development server                  |
| `pnpm build`            | Build for production                                   |
| `pnpm start`            | Start the production server                            |
| `pnpm lint`             | Run ESLint                                             |
| `pnpm typecheck`        | TypeScript type checking (`tsc --noEmit`)              |
| `pnpm migration:diff`   | Generate a migration from `supabase/schemas/*.sql`     |
| `pnpm migration:push`   | Push pending migrations to the linked Supabase project |
| `pnpm generate-types`   | Regenerate `types/supabase.ts` from the local DB       |

---

## Project Structure

```
├── app/
│   └── [locale]/                   # All routes prefixed with locale
│       ├── app/                    # Protected application routes
│       │   ├── dashboard/
│       │   ├── notifications/
│       │   └── settings/
│       │       ├── profile/        # Profile settings
│       │       ├── team/           # Team members + invitations management
│       │       └── workspaces/     # Workspace CRUD
│       ├── auth/                   # Guest-only routes
│       │   ├── login/
│       │   ├── sign-up/
│       │   ├── sign-up-success/
│       │   ├── forgot-password/
│       │   ├── update-password/
│       │   ├── confirm/            # Email confirmation callback
│       │   └── error/
│       └── invite/[token]/         # Public invite acceptance page
├── components/
│   ├── auth/                       # Login, signup, password forms
│   ├── invite/                     # Invite page layout + accept/decline actions
│   ├── landing/                    # Marketing page sections
│   ├── notifications/              # Notification list, indicator, realtime subscription
│   ├── nav/                        # Sidebar and top navigation
│   ├── profile/                    # Profile settings forms
│   ├── providers/                  # Context providers, DashboardShell
│   ├── settings/                   # Settings navigation
│   ├── workspaces/                 # Workspace switcher, CRUD modals, team management
│   └── ui/                         # Shadcn base components
├── actions/                        # Next.js server actions (mutations)
│   ├── auth/
│   ├── notifications/
│   ├── profile/
│   └── workspace/                  # Create/update/delete workspace, invites, members, roles
├── lib/
│   ├── data/                       # Server-side data fetching (profile, workspaces, members, invitations, notifications, app-config)
│   └── supabase/                   # Supabase clients (browser, server, middleware)
├── schema/                         # Zod validation schemas
├── types/                          # TypeScript types, DTOs, and generated Supabase types
├── hooks/                          # Custom React hooks
├── messages/                       # i18n translation files (en.json, pl.json)
├── i18n/                           # next-intl routing config
├── const/                          # App-wide constants (routes, roles, error codes)
├── utils/                          # Formatters, helpers, email/workspace utilities
└── supabase/
    ├── schemas/                    # Declarative SQL schema (source of truth)
    ├── migrations/                 # Generated, timestamped SQL migrations
    ├── seed.sql                    # Local dev seed data
    └── config.toml                 # Local Supabase config
```

---

## Architecture

### Routing and Middleware

Every route is wrapped under `[locale]` (e.g. `/en/app/dashboard`). The middleware in `proxy.ts` (using `lib/supabase/proxy.ts`) runs on every request and:

1. Calls `supabase.auth.getUser()` to validate and, if needed, refresh the session — this both reads/writes auth cookies and is the single source of truth for "is this user authenticated," kept consistent with the `getUser()` calls used in server components and actions
2. Applies next-intl locale detection and routing
3. Redirects unauthenticated users to `/[locale]/auth/login`
4. Redirects authenticated users away from guest-only routes (login, sign-up, forgot-password)

### Data Flow

```
Server Component
  └── lib/data/* (server Supabase client) → PostgreSQL
        └── props → Client Component
                      └── server actions → PostgreSQL
                            └── revalidatePath → re-render
```

- **Data fetching** — async server components calling `lib/data/` functions (server Supabase client, wrapped in React's `cache()` to dedupe per-request)
- **Mutations** — Next.js server actions in `actions/`; failures return `{ error }` (never thrown), success paths call `revalidatePath`/`redirect`. Callers should check the returned `error` rather than wrapping the action in `try/catch` — `redirect()` works by throwing internally, so a `try/catch` around it will incorrectly treat a successful redirect as a failure.
- **Real-time** — client components subscribe to `postgres_changes` on the `notifications` table via the browser Supabase client and call `router.refresh()` on events to re-render server components with fresh data

### Authorization Model

Two role layers, both enforced in the database via RLS (see [Database](#database)):

- **Platform role** — `profiles.role` (`admin` / `user`)
- **Workspace role** — `workspace_members.role` (`owner` / `admin` / `member` / `guest`), scoped per workspace. `MANAGER_ROLES` (`owner`, `admin`) can invite/remove members and manage workspace settings; `INVITABLE_ROLES` (`admin`, `member`, `guest`) are the roles that can be assigned via an invite.

### Invitations

`workspace_invitations` rows carry a unique `token` used to build the `/invite/[token]` link. Accepting or declining is handled by `actions/workspace/accept-invitation.ts` / `decline-invitation.ts`, which re-validate the invitation (status, expiry, email match) server-side before inserting into `workspace_members` — the invite page's own checks are for UX only, not the security boundary.

### Authentication

Supabase Auth with `@supabase/ssr` for session handling in Next.js:

- Sessions stored in secure httpOnly cookies
- `lib/supabase/server.ts` — server-side client (server components, actions)
- `lib/supabase/client.ts` — browser client (client components, realtime)
- `lib/supabase/proxy.ts` — middleware client for session validation/refresh

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
- Link it locally (`supabase link --project-ref <ref>`) and apply migrations with `pnpm migration:push` (`supabase db push`)
- Confirm Realtime is enabled for the `notifications` table (Dashboard → Database → Replication) — it's declared in the schema, but double-check on first deploy
- Seed `app_config` with any required keys (e.g. `max_workspaces_per_user`) if `supabase/seed.sql` wasn't applied against the production project

---

## Troubleshooting

### `Invalid API key` / auth errors

Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` match your Supabase project. For local dev, verify `supabase status` shows the service is running.

### Stuck in a redirect loop between login and the dashboard

This means the session middleware and the page-level auth check disagree about whether the user is logged in — usually because the local Supabase instance was reset (`supabase db reset`/restarted) while the browser still holds a session cookie signed for the previous instance. Log out and log back in (or clear cookies for `127.0.0.1`/your dev domain) to get a fresh session.

### Emails not sending

Ensure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set. For local dev, Supabase Inbucket (port 54324) catches all auth and invitation emails — no real email service needed.

### Locale not detected

Clear cookies and try again. If using a custom domain in production, ensure the middleware matcher covers all routes.

### Type errors after pulling changes

```bash
pnpm typecheck
```

Run this first. Most type errors surface missing env variables or schema mismatches after migrations — also run `pnpm generate-types` if `supabase/schemas/*.sql` changed.

### Supabase local not starting

```bash
supabase stop
supabase start
```

If Docker is not running, start Docker Desktop first.
