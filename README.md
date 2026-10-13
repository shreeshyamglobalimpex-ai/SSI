# Shree Shyam International

Production-oriented Next.js App Router starter for Shree Shyam International.

## Stack

- Next.js App Router
- TypeScript strict mode
- Tailwind CSS v4
- shadcn/ui-style components
- Motion
- React Hook Form
- Zod
- Prisma
- SQL-ready service architecture

## Setup

```bash
cp .env.example .env
pnpm install
pnpm db:generate
pnpm db:push
pnpm dev
```

Open `http://localhost:3000`.

## Database

The included Prisma schema uses SQLite for zero-config local development. For production, switch the Prisma datasource provider and `DATABASE_URL` to your preferred SQL database (for example PostgreSQL/MySQL), then run the appropriate Prisma migration/deploy workflow.

## Production checklist

1. Set `NEXT_PUBLIC_SITE_URL`.
2. Set `ADMIN_JWT_SECRET` (minimum 32 characters). The app refuses to start
   admin authentication without it when `NODE_ENV=production`.
3. Use a managed SQL database.
4. Configure backups and database migrations.
5. Configure transactional email for inquiry notifications via the `ZOHO_SMTP_*`
   variables. Email failures never block a submitted inquiry.
6. Rate limiting is built in: 5 submissions per 10 minutes for the public
   contact/inquiry forms and 10 attempts per 10 minutes for admin login, keyed by
   client IP. It is in-memory per instance — switch `lib/security/rate-limit.ts`
   to a shared store such as Redis if you run multiple instances.
7. Verify every brand, product, registration and market claim before publishing.
8. Configure Search Console and analytics with an appropriate privacy notice.
