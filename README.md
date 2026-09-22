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
A
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
2. Use a managed SQL database.
3. Configure backups and database migrations.
4. Add transactional email for inquiry notifications.
5. Add rate limiting / bot protection to public POST endpoints.
6. Add an authenticated admin area before exposing product/content mutation endpoints.
7. Verify every brand, product, registration and market claim before publishing.
8. Configure Search Console and analytics with an appropriate privacy notice.
