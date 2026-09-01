# PlanNode

Collaborative project & task management application built with Next.js and Supabase. Supports multi-workspace setups with role-based team management, projects with Kanban/list views, subtasks, rich-text descriptions and comments, a full activity log, soft-delete trash, real-time notifications, and complete internationalization (English and Polish).

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

| Category          | Technology                                             |
| ------------------ | ------------------------------------------------------- |
| Framework          | Next.js 16.2 (App Router)                                |
| Language           | TypeScript 6                                             |
| UI                 | React 19, Tailwind CSS 4, Shadcn UI                      |
| Components         | Radix UI, Lucide React                                   |
| Drag & drop        | dnd-kit (`@dnd-kit/react`, `@dnd-kit/dom`, `@dnd-kit/helpers`) — project/task reordering, Kanban board |
| Rich text          | Tiptap — task descriptions and comments, sanitized with `isomorphic-dompurify` |
| Forms              | React Hook Form 7 + Zod 4                                |
| Backend/DB         | Supabase (PostgreSQL 17, Auth, Realtime)                 |
| Email              | Resend, via a custom Supabase Auth "Send Email" hook for localized transactional emails |
| i18n               | next-intl 4                                              |
| Theming            | next-themes                                              |
| Toasts             | Sonner                                                   |
| Navigation feedback | nextjs-toploader (top progress bar on route transitions) |
| Package Manager    | pnpm 11                                                  |

---

## Features

### Workspaces & Team

- **Authentication** — Email/password signup with email confirmation, login, forgot password, password reset
- **Profile Settings** — Update full name, email (with confirmation flow), password, preferred locale, and **delete your account** (blocked while you're the sole owner of a workspace that has other members, to avoid orphaning it)
- **Workspaces** — Create, edit, delete workspaces; multi-workspace support with active workspace selection (persisted in a cookie)
- **Team Management** — Invite members by email, assign roles (`owner`, `admin`, `member`, `guest`), update roles, remove members, leave a workspace, transfer ownership
- **Invitations** — Token-based invite links (`/invite/[token]`), accept/decline flow with email-match and expiry checks
- **Guest role** — Read-only workspace access; guests can view but not create/edit/delete projects, lists, or tasks

### Projects & Tasks

- **Projects** — Create, edit, favorite, mark completed, and make private (owner/admin only); active, completed, and favorites views, each with its own sort order
- **Task Lists** — Multiple lists per project, drag-to-reorder, rename, delete
- **Tasks** — Title, rich-text description, status (`todo`, `in_progress`, `in_review`, `in_tests`, `done`, `cancelled`, `on_hold`), priority (`low`/`medium`/`high`/`urgent`), due date, single assignee, and **subtasks** (one level deep, rendered as full task rows)
- **Two views per list** — Kanban board (drag cards between status columns) and list view (grouped by status, with filters and sort); both support drag-and-drop reordering
- **Comments & Activity Log** — Threaded comments (rich text, editable/deletable by their author or a manager) merged into one chronological timeline with an automatic activity log (status/priority/assignee/due-date changes), updated in real time
- **Dashboard** — Cross-project "My Tasks" overview, grouped by urgency (overdue, today, this week, later)
- **Trash / Soft Delete** — Projects, lists, and tasks are soft-deleted first (recoverable), with a dedicated trash view per project and workspace-wide; permanent deletion is restricted to workspace managers (or, for tasks, the task's own creator)

### Platform

- **Notifications** — Real-time in-app notifications via Supabase Realtime (`postgres_changes`), each with its own email/in-app preference toggle, backed by transactional emails (Resend) for workspace invitations, task assignment, new comments, project access changes, and role changes
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
2. Go to **Project Settings → API** and copy your Project URL, anon/publishable key, and `service_role` key
3. Paste them into `.env.local`
4. Link the project and push the schema:

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

5. Enable Realtime for `notifications`, `tasks`, and `task_lists` (Dashboard → Database → Replication) — these are also declared in the `supabase/schemas/*.sql` files, so `db push` handles it automatically for new projects.
6. (Optional, for localized transactional emails) Configure the **Send Email** auth hook — see [Environment Variables](#environment-variables) and [Architecture](#architecture) below.

**Option B — Local Supabase**

```bash
supabase start
```

This starts a local Supabase stack (Postgres, Auth, Realtime, Storage, Inbucket for email testing). Copy the printed URL, anon/publishable key, and `service_role` key into `.env.local`. Migrations in `supabase/migrations/` are applied automatically on `start`/`reset`.

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable                               | Required | Description                                                     |
| --------------------------------------- | -------- | ----------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`                  | Yes      | Public base URL of the app (used to build absolute links in emails, e.g. invitation/confirmation links) |
| `NEXT_PUBLIC_SUPABASE_URL`              | Yes      | Supabase project URL                                              |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`  | Yes      | Supabase anon/publishable key                                     |
| `SUPABASE_SERVICE_ROLE_KEY`             | Yes      | Supabase service-role key — bypasses RLS; used server-only for account deletion (`auth.admin.deleteUser`) and the Send Email hook |
| `RESEND_API_KEY`                       | No       | Resend API key, used to send all transactional emails             |
| `RESEND_FROM_EMAIL`                    | No       | Sender address for emails (e.g. `noreply@yourdomain.com`)          |
| `SEND_EMAIL_HOOK_SECRET`               | No       | Signing secret for Supabase's Send Email auth hook (format `v1,whsec_...`); required only if that hook is enabled |

**Where to find them:**

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — Supabase dashboard → Project Settings → API
- `RESEND_API_KEY` — [resend.com](https://resend.com) → API Keys (requires a verified sending domain — see [Deployment](#deployment))
- `SEND_EMAIL_HOOK_SECRET` — generated when you create the "Send Email" hook in Supabase Dashboard → Authentication → Hooks (or in `supabase/config.toml`'s `[auth.hook.send_email]` for local dev)
- For local dev, `supabase start` (or `supabase status`) prints all local Supabase values; emails are caught by Inbucket instead of sent for real unless the Send Email hook is enabled, so `RESEND_API_KEY` is optional locally

> **Note:** `service_role` bypasses every RLS policy. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client — it's only read in `lib/supabase/service.ts`, a `server-only` module.

---

## Database

The schema is defined declaratively in `supabase/schemas/*.sql` (the source of truth, loaded in the order listed in `supabase/config.toml`) and shipped as timestamped migrations in `supabase/migrations/`. When changing the schema, edit the relevant file under `supabase/schemas/`, then generate a migration with `pnpm migration:diff <name>` and apply it locally with `supabase db reset` (or `db push` for a remote project).

### Tables

**`profiles`** (`schemas/profiles.sql`) — user profile data, created automatically on signup via a trigger on `auth.users`

| Column       | Type        | Notes                                       |
| ------------ | ----------- | -------------------------------------------- |
| `id`         | uuid        | PK, references `auth.users(id)`              |
| `full_name`  | text        | NOT NULL                                     |
| `email`      | text        | UNIQUE, NOT NULL, synced from `auth.users`    |
| `role`       | user_role   | `'admin'` or `'user'`, default `'user'`      |
| `locale`     | locale      | `'pl'` or `'en'`, default `'pl'`             |
| `created_at` | timestamptz |                                               |
| `updated_at` | timestamptz | auto-updated via trigger                     |

**`workspaces`** / **`workspace_members`** / **`workspace_invitations`** (`schemas/workspaces.sql`) — workspace definitions (one `owner_id` per workspace), the membership join table (`role`: `owner`/`admin`/`member`/`guest`), and pending/accepted/declined invites identified by a unique `token`, scoped by `(workspace_id, email)` while `pending`, with `expires_at`.

**`projects`** / **`project_members`** / **`project_favorites`** (`schemas/projects.sql`) — projects belong to a workspace and can be marked private (visible only to explicit `project_members`, plus workspace owners/admins); `project_favorites` tracks each user's own favorite projects and their sort order.

**`task_lists`** / **`tasks`** (`schemas/projects.sql`) — lists belong to a project; tasks belong to a list and optionally to a parent task (one level of subtasks). Both support soft-delete via `deleted_at`.

**`task_events`** / **`task_comments`** (`schemas/projects.sql`) — `task_events` is an append-only activity log (status/priority/assignee/due-date changes, written automatically by the relevant server actions); `task_comments` are user-authored rich-text comments. The UI merges both into a single chronological timeline per task.

**`notifications`** / **`notification_preferences`** (`schemas/notifications.sql`) — in-app notifications with Supabase Realtime enabled; rows are created via the `create_notification()` SECURITY DEFINER function (restricted to callers who share a workspace with the recipient, or who manage the workspace an invitation belongs to) so no client ever gets direct INSERT access. `notification_preferences` holds a per-user, per-notification-type email/in-app toggle.

**`email_templates`** (`schemas/email_templates.sql`) — HTML templates (subject + body + `{{variable}}` placeholders) used for every transactional email, editable by admins.

**`app_config`** (`schemas/app_config.sql`) — key/value store (`jsonb`) for runtime-configurable values such as `max_workspaces_per_user`; readable by all authenticated users, writable only via `service_role`.

### Soft delete (trash)

Projects, task lists, and tasks all carry a `deleted_at` column instead of being hard-deleted immediately:

- Trashing a project does **not** cascade `deleted_at` to its lists/tasks — visibility is computed at query time by checking whether any ancestor is trashed, so restoring the project reveals its lists/tasks again automatically.
- Trashing a task **does** cascade to its own subtasks (in both directions — trash and restore), since subtasks are considered part of the same unit of work.
- **Permanent deletion** is a separate, more restrictive action from soft-delete: any non-guest member can move something to the trash, but only workspace managers (owner/admin) — or, for a task, the task's own creator — can permanently delete it, and only once it's actually in the trash.

### Row Level Security

Every table has RLS enabled. Two independent authorization layers are enforced at the database level, not just in the app:

- **Platform role** (`profiles.role`) — `admin` users bypass most restrictions via the `is_admin()` helper function
- **Workspace role** (`workspace_members.role`) — membership and role are checked with `is_workspace_member()` / `get_workspace_member_role()` helper functions; only `owner`/`admin` members can manage invitations, members, and workspace settings, and a member's own role can never be written as `'owner'` through a normal insert/update/delete — that value is only ever set by the workspace-creation trigger or the dedicated `transfer_workspace_ownership()` function, both of which check `workspaces.owner_id` directly rather than the (client-writable) role column.

### Running migrations

```bash
# Generate a migration from schema changes (diffs supabase/schemas against the local DB)
pnpm migration:diff <migration_name>

# Apply against the local instance (re-applies all migrations + seed from scratch)
supabase db reset

# Apply against a linked cloud project
pnpm migration:push
```

> `migration:diff` doesn't reliably pick up privilege-only changes (`GRANT`/`REVOKE`) on functions that already existed before the diff, or `ALTER PUBLICATION`/`REPLICA IDENTITY` statements — always read the generated migration file before applying it.

### Regenerating types

After any schema change, regenerate the TypeScript types used by `types/supabase.ts`:

```bash
pnpm generate-types
```

### Regenerating the seed file

`supabase/seed.sql` (app config + all localized email templates) is generated from `scripts/generate-seed.ts`, not hand-edited:

```bash
pnpm generate-seed
```

---

## Available Scripts

| Command               | Description                                            |
| ---------------------- | -------------------------------------------------------- |
| `pnpm dev`             | Start the Next.js development server                     |
| `pnpm build`           | Build for production                                      |
| `pnpm start`           | Start the production server                                |
| `pnpm lint`            | Run ESLint                                                 |
| `pnpm typecheck`       | TypeScript type checking (`tsc --noEmit`)                  |
| `pnpm migration:diff`  | Generate a migration from `supabase/schemas/*.sql`         |
| `pnpm migration:push`  | Push pending migrations to the linked Supabase project     |
| `pnpm generate-types`  | Regenerate `types/supabase.ts` from the local DB           |
| `pnpm generate-seed`   | Regenerate `supabase/seed.sql` from `scripts/generate-seed.ts` |

There is no test runner configured in this repo (no Jest/Vitest/Playwright).

---

## Project Structure

```
├── app/
│   ├── api/
│   │   └── auth/send-email-hook/   # Supabase Auth "Send Email" webhook receiver
│   └── [locale]/                   # All routes prefixed with locale
│       ├── app/                    # Protected application routes
│       │   ├── dashboard/          # Cross-project "My Tasks" overview
│       │   ├── notifications/
│       │   ├── projects/
│       │   │   ├── [projectId]/
│       │   │   │   ├── lists/[listId]/   # Kanban/list view for one list
│       │   │   │   └── trash/            # Per-project trash (lists + tasks)
│       │   │   ├── completed/
│       │   │   ├── favorites/
│       │   │   └── trash/                # Workspace-wide trashed projects
│       │   └── settings/
│       │       ├── profile/        # Profile settings, account deletion
│       │       ├── team/           # Team members + invitations management
│       │       └── workspaces/     # Workspace CRUD
│       ├── auth/                   # Guest-only routes
│       │   ├── login/ sign-up/ sign-up-success/
│       │   ├── forgot-password/ update-password/
│       │   ├── confirm/            # Email confirmation callback
│       │   └── error/
│       └── invite/[token]/         # Public invite acceptance page
├── components/
│   ├── auth/                       # Login, signup, password forms
│   ├── dashboard/                  # "My Tasks" dashboard section
│   ├── invite/                     # Invite page layout + accept/decline actions
│   ├── landing/                    # Marketing page sections
│   ├── notifications/              # Notification list, indicator, preferences
│   ├── nav/                        # Sidebar and top navigation
│   ├── profile/                    # Profile settings forms, delete-account modal
│   ├── projects/                   # Project cards, modals, trash views
│   ├── providers/                  # Context providers, DashboardShell
│   ├── settings/                   # Settings navigation
│   ├── tasks/                      # Kanban board, task rows/cards, comments, activity timeline
│   ├── workspaces/                 # Workspace switcher, CRUD modals, team management
│   └── ui/                         # Shadcn base components
├── actions/                        # Next.js server actions (mutations)
│   ├── auth/
│   ├── notifications/
│   ├── profile/                    # Includes account deletion
│   ├── project/                    # Create/update/delete/restore/favorite/reorder
│   ├── task/                       # Tasks, lists, comments, trash, reordering
│   └── workspace/                  # Create/update/delete workspace, invites, members, roles
├── lib/
│   ├── data/                       # Server-side data fetching, wrapped in React's cache()
│   └── supabase/                   # Supabase clients (browser, server, middleware, service-role)
├── schema/                         # Zod validation schemas
├── types/                          # TypeScript types, DTOs, and generated Supabase types
├── hooks/                          # Custom React hooks (optimistic updates, delete/restore flows)
├── messages/                       # i18n translation files (en.json, pl.json)
├── i18n/                           # next-intl routing config
├── const/                          # App-wide constants (routes, roles, statuses, error codes)
├── utils/                          # Formatters, helpers, email/sanitize/workspace utilities
├── scripts/                        # One-off scripts (e.g. seed generation)
└── supabase/
    ├── schemas/                    # Declarative SQL schema (source of truth)
    ├── migrations/                 # Generated, timestamped SQL migrations
    ├── seed.sql                    # Generated local dev seed data
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

Refreshed session cookies are propagated onto whichever response is ultimately returned (including redirects) — a middleware chaining two response-producing steps (session refresh, then locale routing) has to explicitly carry cookies from the first onto the second, or a token refresh silently never reaches the browser.

### Data Flow

```
Server Component
  └── lib/data/* (server Supabase client) → PostgreSQL
        └── props → Client Component
                      └── server actions → PostgreSQL
                            └── revalidatePath / Realtime → re-render
```

- **Data fetching** — async server components calling `lib/data/` functions (server Supabase client, wrapped in React's `cache()` to dedupe per-request)
- **Mutations** — Next.js server actions in `actions/`; failures return `{ error }` (never thrown), success paths call `revalidatePath`/`redirect`. Callers should check the returned `error` rather than wrapping the action in `try/catch` — `redirect()` works by throwing internally, so a `try/catch` around it will incorrectly treat a successful redirect as a failure.
- **Real-time** — client components subscribe to `postgres_changes` on `notifications`, `tasks`, and `task_lists` via the browser Supabase client and call `router.refresh()` on events to re-render server components with fresh data. There's no separate client-side cache to invalidate — a refresh is the whole mechanism.

### Authorization Model

Two role layers, both enforced in the database via RLS (see [Database](#database)):

- **Platform role** — `profiles.role` (`admin` / `user`)
- **Workspace role** — `workspace_members.role` (`owner` / `admin` / `member` / `guest`), scoped per workspace. `MANAGER_ROLES` (`owner`, `admin`) can invite/remove members, manage workspace settings, and permanently delete projects/lists; `INVITABLE_ROLES` (`admin`, `member`, `guest`) are the roles that can be assigned via an invite (a member can never be invited or promoted directly to `owner` — ownership only changes via `transfer_workspace_ownership()`). `guest` members get read-only access to a workspace's projects and tasks.

### Projects, Tasks & Kanban

- A project has one or more task lists; each list holds tasks, which can each have one level of subtasks (rendered as full task rows, not a separate lightweight type).
- Each list view offers a **Kanban board** (drag cards between status columns) and a **list view** (grouped by status, filterable, sortable) — both backed by the same `reorderTasksAction`/`reorderTaskListsAction` server actions, using `dnd-kit` for the drag interactions.
- Task descriptions and comments are authored as rich text via Tiptap and sanitized (`isomorphic-dompurify`, so sanitization also runs correctly during server-side rendering, not just in the browser) before being rendered with `dangerouslySetInnerHTML`.
- Every status/priority/assignee/due-date change writes a row to `task_events`; the UI merges that log with `task_comments` into one chronological timeline per task.

### Invitations

`workspace_invitations` rows carry a unique `token` used to build the `/invite/[token]` link. Accepting or declining is handled by `actions/workspace/accept-invitation.ts` / `decline-invitation.ts`, which re-validate the invitation (status, expiry, email match) server-side before inserting into `workspace_members` — the invite page's own checks are for UX only, not the security boundary.

### Authentication

Supabase Auth with `@supabase/ssr` for session handling in Next.js:

- Sessions stored in secure httpOnly cookies
- `lib/supabase/server.ts` — server-side client (server components, actions)
- `lib/supabase/client.ts` — browser client (client components, realtime)
- `lib/supabase/proxy.ts` — middleware client for session validation/refresh
- `lib/supabase/service.ts` — `server-only` service-role client (bypasses RLS); used only where a user-scoped session can't do the job, e.g. `auth.admin.deleteUser()` for account deletion

### Transactional email

All auth emails (signup confirmation, password reset, email change) and every in-app notification's email counterpart go through a single pipeline: `utils/email.ts` renders a row from `email_templates` (per-locale, `{{variable}}` substitution with HTML-escaping) and sends it via Resend.

Auth emails specifically are routed through a custom **Send Email** hook (`app/api/auth/send-email-hook/route.ts`) instead of Supabase's built-in mailer, so they can be localized and styled consistently with the rest of the app's emails. The hook verifies the request's Standard Webhooks signature using `SEND_EMAIL_HOOK_SECRET` before doing anything. For local development, this hook is configured in `supabase/config.toml`'s `[auth.hook.send_email]` block (pointed at `http://host.docker.internal:3000/...`, since the local Supabase container can't resolve `localhost` as the host machine); for production, the equivalent hook must be created manually in Supabase Dashboard → Authentication → Hooks, pointed at your deployed domain.

### Internationalization

All UI strings live in `messages/en.json` and `messages/pl.json`. The active locale is part of the URL. Users can switch language from the sidebar; their preference is persisted to the `profiles.locale` column.

---

## Deployment

The project is ready for **Vercel** deployment.

### Vercel

1. Push the repository to GitHub
2. Import the project in [vercel.com](https://vercel.com)
3. Set environment variables in the Vercel project settings (see [Environment Variables](#environment-variables)):
   - `NEXT_PUBLIC_APP_URL` (your production domain)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY` / `RESEND_FROM_EMAIL` (if using email)
   - `SEND_EMAIL_HOOK_SECRET` (if using the Send Email hook)
4. Deploy — Vercel will run `pnpm build` automatically

A custom domain can be attached under the Vercel project's **Domains** tab; the free `*.vercel.app` domain Vercel assigns by default cannot be used for sending email, since you don't control its DNS.

### Email sending domain (Resend)

Sending real transactional email (as opposed to Supabase's local Inbucket catch-all) requires a domain you control the DNS for:

1. Buy or already own a domain, and add its DNS records via whichever provider hosts it (can be Vercel's own DNS if the domain is added there, or any registrar)
2. In Resend, go to **Domains → Add domain**, and add the DNS records it gives you (SPF/DKIM/DMARC) — a subdomain such as `mail.yourdomain.com` works well and avoids touching the records your app's own hosting already manages
3. Set `RESEND_FROM_EMAIL` to an address on that verified domain

### Supabase (production)

- Use a Supabase cloud project for production
- Link it locally (`supabase link --project-ref <ref>`) and apply migrations with `pnpm migration:push` (`supabase db push`)
- Confirm Realtime is enabled for `notifications`, `tasks`, and `task_lists` (Dashboard → Database → Replication) — declared in the schema, but double-check on first deploy
- Seed `app_config` and `email_templates` (run `pnpm generate-seed` and apply the resulting `supabase/seed.sql` if it wasn't already applied against the production project)
- If using the Send Email hook, create it in Dashboard → Authentication → Hooks pointed at `https://<your-domain>/api/auth/send-email-hook`, with a secret matching `SEND_EMAIL_HOOK_SECRET`

---

## Troubleshooting

### `Invalid API key` / auth errors

Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` match your Supabase project. For local dev, verify `supabase status` shows the service is running.

### Stuck in a redirect loop between login and the dashboard

This means the session middleware and the page-level auth check disagree about whether the user is logged in — usually because the local Supabase instance was reset (`supabase db reset`/restarted) while the browser still holds a session cookie signed for the previous instance. Log out and log back in (or clear cookies for `127.0.0.1`/your dev domain) to get a fresh session.

### Enabling the Send Email hook breaks all authentication

If `[auth.hook.send_email]` is enabled without a matching `SEND_EMAIL_HOOK_SECRET`, or the hook endpoint is unreachable (e.g. using `localhost` instead of `http://host.docker.internal:3000` for local Docker-based Supabase), **every** auth flow that sends an email (signup, password reset) fails outright, since Supabase blocks on the hook succeeding. Double-check the URL and secret match exactly between `supabase/config.toml` (or the Dashboard, in production) and your `.env.local`.

### Emails not sending

Ensure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set, and that the sending domain is verified in Resend. For local dev without the Send Email hook enabled, Supabase Inbucket (port 54324) catches all auth emails — no real email service needed; other transactional emails (invitations, task assignment, etc.) always go through Resend directly regardless of the hook.

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
