# AnimoNotes

A modern note-sharing forum for students built with Next.js, Better Auth, Prisma, and Tailwind CSS.

## Features

- Google OAuth for DLSU Gmail (not yet finished)
- Profiles with soft-delete support
- Posts with rich text, images, categories, votes, and bookmarks
- Threaded comments, polls, notifications, messages, and reporting tools

## Tech Stack

- Next.js 16 (App Router + Proxy)
- Better Auth
- Prisma 6 + PostgreSQL
- Tailwind CSS v4 + shadcn/ui
- Tiptap editor + Lucide icons

## Prerequisites

- Node.js 18+
- Docker + Docker Compose

## Local Development

1. Install dependencies

```bash
npm install
```

2. Create `.env`

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/animonotes?schema=public"
AUTH_SECRET="your-secret"
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="optional"
GOOGLE_CLIENT_SECRET="optional"
```

3. Start Postgres

```bash
docker compose -f docker-compose.animonotes.yml up -d postgres
```

4. Apply migrations

```bash
npx prisma migrate deploy
```

5. Seed data

```bash
npm run db:seed
```

6. Start the app

```bash
npm run dev
```

Open http://localhost:3000

### Auth Notes

- Sign in uses Google OAuth only.
- Only `@dlsu.edu.ph` Google accounts are allowed.

## Docker (App + DB)

```bash
docker compose -f docker-compose.animonotes.yml up --build
```

App URL: http://localhost:3002

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — lint project
- `npm run format` — format project
- `npm run db:generate` — generate Prisma client
- `npm run db:migrate` — create/apply migration in dev
- `npm run db:push` — push schema without migration
- `npm run db:seed` — seed database (`tsx prisma/seed.ts`)
- `npm run db:studio` — open Prisma Studio

## Project Structure

```text
src/
  app/          # App Router pages + API routes
  components/   # Shared UI components
  features/     # Domain-based feature modules
  hooks/        # Reusable hooks
  lib/          # Prisma/auth/utils/validation
prisma/
  schema.prisma
  seed.ts
```

## Notes

- Auth routes are served under `/api/auth/*` by Better Auth.
- Prisma seed command is configured in `prisma.config.ts` and exposed via `npm run db:seed`.
