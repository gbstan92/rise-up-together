# Launch runbook

End-to-end checklist to go from "the code is done" to "the site is live and the user can manage it."

---

## 1. Environment variables (Railway)

All set on the service in Railway → Variables. Mark `NEXT_PUBLIC_*` as public; the rest as secret.

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (auto) | Provided by the attached Postgres service |
| `AUTH_SECRET` | `openssl rand -base64 32` output | Random, 32+ bytes |
| `AUTH_TRUST_HOST` | `true` | Required for NextAuth behind Railway proxy |
| `SITE_URL` | `https://riseuptogether.up.railway.app` | Update on domain flip (see §6) |
| `UPLOAD_DIR` | `/data/uploads` | Must match the Railway volume mount |
| `MAX_UPLOAD_MB` | `5` | Cap per file |
| `RESEND_API_KEY` | from Resend dashboard | After DKIM is verified |
| `RESEND_FROM` | `noreply@riseuptogether.co.uk` | Must be on a verified domain |
| `ADMIN_INBOX_EMAIL` | your inbox | Receives volunteer/sponsor/registration notifications |
| `HCAPTCHA_SECRET` | from hCaptcha dashboard | Server-side verify |
| `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | from hCaptcha dashboard | Rendered into the page |
| `SEED_ADMIN_EMAIL` | your admin email | Used only by the seed step |
| `SEED_ADMIN_PASSWORD` | strong password | Used only by the seed step; rotate after first login |

The Dockerfile runs `prisma migrate deploy` on boot. Run the seed once after the first deploy:

```bash
railway run pnpm seed
# or, in the Railway shell:
pnpm seed
```

---

## 2. Volume

Create a Railway volume mounted at `/data/uploads` on the app service. Required for image uploads to survive redeploys.

---

## 3. Smoke test (every release)

1. `https://<site>/ro` → home renders, hero + pillars + CTA banner.
2. `https://<site>/en` → English copy, URL stays `/en`.
3. Language switcher in header swaps URLs cleanly.
4. `https://<site>/admin/login` → sign in with seed credentials → dashboard.
5. **Pages**: edit Home → set status `PUBLISHED` → public page reflects within seconds.
6. **Team**: add one member with photo → appears on `/ro/cine-suntem`.
7. **Tournaments**: New tournament → fill RO + EN, add cover, video, 4 teams, 2 results, publish.
   - `/ro/turnee/<slug>` renders hero, embed, gallery, teams, results.
   - JSON-LD validates at <https://search.google.com/test/rich-results>.
8. **Forms**: from `/implica-te` submit volunteer, sponsor, newsletter — all toast success.
9. Confirm newsletter via the email link → redirect to `…?newsletter=confirmed`.
10. Submit team registration from the upcoming tournament page (when `registrationOpen=true`).
11. Admin approves → team appears in "Participating teams" on public page; captain receives decision email.
12. CSV exports download from `/admin/submissions/volunteers|sponsors|newsletter/export`.

---

## 4. Email (Resend + DKIM/SPF)

1. In Resend, add domain `riseuptogether.co.uk`.
2. Add the three DNS records Resend gives you (SPF TXT, DKIM CNAME ×2). Propagation: 1–24 h.
3. Set `RESEND_FROM=noreply@riseuptogether.co.uk` and redeploy.
4. Test: trigger newsletter form, confirm the inbox receives a verified-domain email.

Until DKIM is verified, leave `RESEND_API_KEY` empty — the server will log the would-be emails to stdout instead of failing.

---

## 5. Privacy policy

The `PRIVACY` `PageContent` row is seeded empty. Paste `docs/privacy-policy-ro.html` into the RO body and `docs/privacy-policy-en.html` into the EN body via `/admin/pages/PRIVACY`, then publish. The footer link already routes to `/ro/politica-confidentialitate` and `/en/privacy-policy`.

---

## 6. Custom domain switch (when `riseuptogether.co.uk` is ready)

1. In Railway → Settings → Domains, add `riseuptogether.co.uk` and `www.riseuptogether.co.uk`.
2. Update DNS at your registrar with the CNAME/AAAA records Railway shows.
3. Once HTTPS is provisioned (Railway does this automatically), set:
   - `SITE_URL=https://riseuptogether.co.uk`
   - `RESEND_FROM=noreply@riseuptogether.co.uk`
4. Redeploy. `next/image` is already configured to allow this hostname in `next.config.ts`.
5. Re-run the rich-results test on a tournament page to verify canonical URLs flipped.

---

## 6. Backups

`scripts/backup.sh` produces `db.sql.gz` + `uploads.tar.gz` in a timestamped folder. Run nightly from any machine with the volume mounted (or from inside the Railway container):

```bash
DATABASE_URL="postgres://..." UPLOAD_DIR=/data/uploads ./scripts/backup.sh /backups
```

Push the output to off-site storage (S3, R2, Backblaze). Target: keep at least 7 daily snapshots.

Restore drill:

```bash
# DB
gunzip -c db.sql.gz | psql "$DATABASE_URL"
# Files
tar -xzf uploads.tar.gz -C /data
```

Run this drill at least once before launch.

---

## 7. Rate-limit + CSP audit

- Open DevTools → Console on `/ro`, `/implica-te`, and a tournament page. No CSP violations should appear.
- Hammer `/api/forms/newsletter` 6 times in a minute (curl loop) — the 6th should return `429 {"error":"ratelimited"}`.
- Submit a form with an empty `hcaptchaToken` in production — should return `400 {"error":"captcha"}`.

---

## 8. Post-launch checklist (week 1)

- [ ] Verify backups are landing off-site.
- [ ] Check Resend dashboard for bounces/complaints.
- [ ] Run Lighthouse mobile on `/ro` and a tournament page → ≥90 across Performance, Accessibility, SEO.
- [ ] Submit `sitemap.xml` in Google Search Console for both `/ro/...` and `/en/...` prefixes.
- [ ] Rotate `SEED_ADMIN_PASSWORD` (sign in, change via DB or seed again with a fresh password).
- [ ] Hand the admin user a one-pager covering: editing pages, adding tournaments, approving registrations.

---

## 9. Handoff to user

Send the user:

1. The admin URL: `https://<site>/admin/login`
2. Their admin credentials.
3. A 5-line cheat sheet:
   - **Edit any page** → `Pages` in sidebar → click page → save.
   - **New tournament** → `Tournaments` → "New tournament" → fill RO/EN → upload cover via `Media` first → save.
   - **Approve team registration** → `Registrations` → Approve / Reject.
   - **Export emails** → `Submissions → Newsletter → Export CSV`.
   - **Forgot password** → ping the developer; reset via DB.
