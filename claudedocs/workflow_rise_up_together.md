# Workflow — Rise Up Together

Source spec: `docs/design.md`. Strategy: agile, vertical slices wherever possible. Each phase ends with a deployable checkpoint.

Defaults carried from design (flag if wrong before Phase 5/9):
- Newsletter is **double opt-in**.
- Tournament results use a **simple round/score table**, no bracket UI.

---

## Phase 0 — Bootstrap (≈0.5 day)

Goal: empty Next.js app builds and deploys to Railway.

Tasks:
1. `pnpm create next-app` inside `~/repos/rise-up-together/` with TS, App Router, Tailwind, ESLint.
2. Copy from visit-muscelul: `Dockerfile`, `railway.json`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json`, `tsconfig.json` (review).
3. Add deps: `next-intl`, `next-auth@5-beta`, `@auth/prisma-adapter`, `@prisma/client`, `prisma`, `bcryptjs`, `zod`, `react-hook-form`, `@hookform/resolvers`, `resend`, `sharp`, `sonner`, `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `next-themes`.
4. Add scripts mirroring visit-muscelul (`dev`, `build`, `start`, `deploy:migrate`, `deploy:seed`, `lint`, `typecheck`, `seed`, `postinstall`).
5. Create Railway project + Postgres + volume `/data/uploads`. Wire env vars (placeholders for Resend/hCaptcha OK).
6. First deploy of blank page.

Checkpoint: `https://<railway-subdomain>` returns 200, Postgres reachable.

---

## Phase 1 — i18n + middleware shell (≈0.5 day)

Goal: routing renders `/ro` and `/en` with locale-aware layout.

Tasks:
1. Create `src/i18n/{routing,request,navigation}.ts` mirroring visit-muscelul, locales `["ro","en"]`, default `ro`, `localePrefix:"always"`.
2. Add `pathnames` map for the 7 public routes (table from design §2).
3. `messages/ro.json` + `messages/en.json` with chrome strings (header, footer, form labels, errors).
4. `src/middleware.ts`: NextAuth gate for `/admin` + next-intl middleware otherwise (verbatim from visit-muscelul, adjust import paths).
5. `src/app/(site)/[locale]/(public)/layout.tsx` with Header + Footer + LanguageSwitcher + CookieBanner shells (no styling yet).
6. Placeholder pages for all 7 public routes returning H1 + locale.

Checkpoint: `/ro/turnee` and `/en/tournaments` both render; language switcher swaps URL.

---

## Phase 2 — Prisma schema + auth (≈1 day)

Depends on: Phase 0.

Tasks:
1. `prisma/schema.prisma` = full schema from design §3.
2. `prisma migrate dev --name init`. Commit migration.
3. `prisma/seed.ts`: create admin User from `ADMIN_EMAIL`/`ADMIN_PASSWORD`; create empty `PageContent` rows for all 5 `PageKey` values with RO+EN translations (title-only); idempotent.
4. `src/server/db.ts` Prisma singleton.
5. `src/auth.config.ts` + `src/server/auth.ts`: NextAuth v5 Credentials provider (bcrypt compare), JWT session, 30d.
6. `src/app/api/auth/[...nextauth]/route.ts`.
7. `src/app/(admin)/admin/login/page.tsx` with credentials form.
8. `requireAdmin()` server helper.

Checkpoint: deploy + run `pnpm deploy:migrate && pnpm deploy:seed` on Railway. Log in at `/admin/login` lands on `/admin`.

---

## Phase 3 — Design system + brand (≈1 day)

Depends on: Phase 1.

Tasks:
1. Extract palette from `images/logo.jpg` (manual pick or tooling). Define Tailwind theme tokens.
2. Configure typography (Inter or similar) via `next/font`.
3. Copy `components/ui/*` Radix wrappers from visit-muscelul.
4. Build site primitives: `Header` (logo, nav, language switcher), `Footer` (contact, socials, privacy link), `Hero`, `SectionHeading`, `Card`, `Button`, `FormField`.
5. `CookieBanner` (consent stored in cookie).
6. Static skeleton for Home, Who, What, Get Involved (placeholders for dynamic content).

Checkpoint: visual review of public skeleton in both locales.

---

## Phase 4 — Media pipeline (≈1 day)

Depends on: Phase 2.

Tasks:
1. `src/server/media.ts`: upload handler — write original + sharp variants (thumb 400, md 1024, lg 1920) to `/data/uploads/<scope>/<entityId>/<uuid>.<ext>`. Return `MediaAsset` row.
2. `src/app/api/uploads/route.ts` (admin-gated, multipart). MIME + size cap (5MB) + magic-byte check.
3. `src/app/uploads/[...path]/route.ts`: stream from volume with long-cache headers.
4. `next.config.ts`: `images.remotePatterns` for own origin; CSP headers (allow `youtube.com`, `youtube-nocookie.com`, `hcaptcha.com`, `*.resend.com`).
5. Admin `MediaPicker` component (upload + select from existing).

Checkpoint: upload an image in admin shell, verify it renders via `next/image` at variant URLs after redeploy (volume persists).

---

## Phase 5 — Forms infrastructure (≈1 day)

Depends on: Phase 2.

Tasks:
1. `src/lib/ratelimit.ts` (in-memory token bucket, 5/min/IP/endpoint).
2. `src/server/hcaptcha.ts` verify helper.
3. `src/server/email.ts` Resend client + `sendMail({locale, to, template, props})`.
4. `src/server/emails/*.tsx` 8 templates from design §9 (bilingual subject/body).
5. `src/lib/zod-schemas.ts` schemas for volunteer, sponsor, newsletter, team-registration.
6. Shared API pipeline helper `handleFormSubmit(req, schema, persist, sideEffect)`.
7. Build endpoints:
   - `POST /api/forms/volunteer`
   - `POST /api/forms/sponsor`
   - `POST /api/forms/newsletter` + `GET …/confirm` + `GET …/unsubscribe`
   - `POST /api/forms/team-registration` (gated on tournament phase/registrationOpen — implemented in Phase 7 once Tournament exists; stub with TODO now)
8. Client `FormVolunteer`, `FormSponsor`, `FormNewsletter` with react-hook-form + Zod resolver + hCaptcha widget + sonner toasts.
9. Wire forms into Get Involved page.

Checkpoint: submit each form locally + on Railway. Verify DB row, Resend delivery, double opt-in flow.

---

## Phase 6 — Static CMS pages (≈1 day)

Depends on: Phase 3, Phase 4.

Tasks:
1. `src/server/pages.ts`: read PageContent by key + locale; write blocks (admin).
2. Admin `/admin/pages/[key]` editor: title fields RO/EN, block list with reorder, kinds `hero|richText|stats|cta|highlight`. Per-kind Zod payload.
3. Public renderers per block kind under `components/site/blocks/`.
4. Home, Who We Are, What We Do, Get Involved (Get Involved keeps static forms section + hero/intro from CMS), Privacy Policy pages render from PageContent.
5. `TeamMember` CRUD in admin (`/admin/team`) + render on Who We Are.
6. `MissingTranslationBadge` in admin lists.

Checkpoint: edit Home hero in admin → public `/ro` and `/en` reflect change after `revalidatePath`.

---

## Phase 7 — Tournaments domain (≈2 days)

Depends on: Phase 4, Phase 5, Phase 6.

Tasks:
1. `src/server/tournaments.ts`: queries (listByPhase, getBySlug per locale), mutations (create, update, addVideo, attachGallery, addTeam, addResult, openRegistration, archive).
2. Admin `/admin/tournaments` list (filter by phase/status).
3. Admin `/admin/tournaments/new` + `/[id]/edit`: tabs (Details, Translations RO/EN, Videos, Teams, Results, Gallery, Cover, Settings). Slug per locale auto-generated, editable. Status DRAFT/PUBLISHED, phase UPCOMING/PAST, registrationOpen toggle.
4. Server Actions with `requireAdmin()` + `revalidatePath`.
5. Public `/[locale]/turnee` (mapped to `/tournaments` in EN): Upcoming (asc) + Past (desc) cards, only `PUBLISHED`.
6. Public `/[locale]/turnee/[slug]`: title, dates, venue, summary, rich description, YouTube embeds (`youtube-nocookie` iframe), gallery (lightbox), participating teams list, results table (past only), `FormTeamRegistration` (upcoming only, when `registrationOpen`).
7. Re-enable `team-registration` endpoint (validate tournament phase + flag server-side).
8. JSON-LD `SportsEvent` on detail page.

Checkpoint: create a sample tournament with cover, 1 video, 3 photos, 4 teams, 2 results; verify both locales render correctly + registration form behavior.

---

## Phase 8 — Submissions admin (≈1 day)

Depends on: Phase 5, Phase 7.

Tasks:
1. `/admin/submissions/volunteers` — table, status filter, mark handled/archive, CSV export.
2. `/admin/submissions/sponsors` — same.
3. `/admin/submissions/newsletter` — list confirmed/unconfirmed, manual unsubscribe, CSV export.
4. `/admin/submissions/registrations` — pending queue with Approve / Reject buttons. On approve: create `TournamentTeam`, send decision email. On reject: send decision email.

Checkpoint: end-to-end team-registration → approval → team appears on tournament page.

---

## Phase 9 — SEO + polish (≈0.5 day)

Depends on: Phases 6–7.

Tasks:
1. `generateMetadata` for every public route with bilingual title/desc + `alternates.languages`.
2. `app/sitemap.ts` + `app/robots.ts`.
3. OG images: use tournament cover `lg` variant; default site OG generated once.
4. Accessibility pass: keyboard nav, aria labels, alt text required on uploads, contrast check.
5. Lighthouse audit; fix to ≥90 across the board on mobile.
6. 404 page (bilingual).

Checkpoint: Lighthouse on `/ro` + `/ro/turnee/<slug>` ≥90 in Performance, Accessibility, SEO.

---

## Phase 10 — Hardening + launch (≈0.5 day)

Depends on: all prior.

Tasks:
1. Rate-limit verification (manual flood test).
2. CSP audit in browser console.
3. Privacy policy content review (Resend, hCaptcha, Railway named as processors).
4. Backup script: nightly `pg_dump` + volume snapshot to Railway storage or external; documented in README.
5. Smoke-test runbook (login, create tournament, submit each form, approve registration).
6. Hand-off to user for RO content load.
7. (Post-domain) configure Resend DKIM/SPF for `riseuptogether.co.uk`; flip `NEXTAUTH_URL` + `RESEND_FROM`.

Checkpoint: production smoke-test passes; user loads RO content; site is live on Railway subdomain.

---

## Dependency Graph

```
P0 ── P1 ── P3 ─────────────┐
 │      │                    │
 │      └── P2 ── P4 ── P6 ──┼── P7 ── P8 ── P9 ── P10
 │              └── P5 ──────┘             ▲
 │                           │             │
 └───────────────────────────┘             │
                                           │
        Defaults to confirm before P5/P9 ──┘
```

Parallelizable pairs once P2 ships:
- P3 (design) ∥ P4 (media) ∥ P5 (forms infra, minus team-registration).
- P6 (CMS pages) and P7 (tournaments) share P4 + P6 dependencies; P6 can start once P3 done while P7 starts once P4 done.

---

## Estimate

~8.5 working days of focused effort. Slack of ~2 days for content/QA/iteration → **~2 calendar weeks**.

---

## Risks & Mitigations (workflow-level)

| Risk | Mitigation |
|---|---|
| Logo palette doesn't lend itself to clean UI | Reserve half a day in P3 to test 2–3 palette variants |
| Resend domain not ready at launch | Use Resend sandbox sender + sender-name fallback; switch in P10 |
| Tournament editor scope creep (brackets) | Lock to simple round/score table in P7; defer brackets to v1.1 |
| Volume image loss | P10 backup script before going public |
| GDPR review | Privacy policy reviewed in P10; double opt-in already covers consent |

---

## Confirmations needed before starting Phase 5 / Phase 9
1. Newsletter double opt-in OK?
2. Simple round/score results table OK (no bracket UI)?
3. Use system Inter font, or specific brand typeface?

---

## Next
Run `/sc:implement` starting at **Phase 0**, or batch the first 2–3 phases. Workflow document is the source of truth for sequencing.
