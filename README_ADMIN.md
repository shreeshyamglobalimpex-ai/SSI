# SSI Admin / Store Upgrade

## Setup
1. `cp .env.example .env` and set `DATABASE_URL`, `ADMIN_JWT_SECRET`, and Zoho SMTP values.
2. `pnpm install`
3. `pnpm db:generate`
4. `pnpm db:push`
5. `pnpm db:seed`
6. `pnpm admin:create`
7. `pnpm dev`

Admin: `/admin/login`
Store: `/store`

Excel export: authenticated `GET /api/admin/export`.
Excel import: authenticated `POST /api/admin/import` with form-data field `file`.
Product image upload: authenticated `POST /api/admin/products/:id/image` with form-data field `image`. Images are converted to WebP and compressed to <= 200 KB where possible.

All admin APIs validate the HTTP-only JWT cookie server-side. Never expose `ADMIN_JWT_SECRET` or SMTP credentials to client-side code.
