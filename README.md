# Rise Up Together

Charity website (RO/EN) with public pages, a football tournament archive, and an admin CMS.

Stack: Next.js 16, Prisma + Postgres, next-intl, NextAuth v5, Tailwind v4, Resend, hCaptcha. Deployed on Railway.

See `docs/design.md` and `claudedocs/workflow_rise_up_together.md` for architecture and build phases.

## Local development

```bash
cp .env.example .env            # then fill AUTH_SECRET + SEED_ADMIN_* values
docker compose up -d            # starts Postgres on localhost:5432
pnpm install
pnpm prisma migrate dev --name init
pnpm seed
pnpm dev
```

Stop the database with `docker compose down` (data persists in the `riseup-pg-data` volume). Wipe it with `docker compose down -v`.

## Deployment

See `docs/LAUNCH.md` for the full runbook: Railway env vars, volume setup, DKIM/SPF, backup strategy, smoke test, and the domain flip when `riseuptogether.co.uk` is ready.

## Backups

```bash
DATABASE_URL="postgres://..." UPLOAD_DIR=/data/uploads ./scripts/backup.sh /backups
```

Push the output to off-site storage and run weekly restore drills.

App at http://localhost:3000/ro · Admin at http://localhost:3000/admin/login
