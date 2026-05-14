# Rise Up Together — System Design

Status: v1 design, ready for implementation.
Stack baseline: cloned from `visit-muscelul` conventions (Next.js 16 App Router, Prisma + Postgres, next-intl, NextAuth v5, Tailwind v4, Radix UI, Resend, Railway + volume).

---

## 1. Architecture Overview

```
┌────────────────────────────────────────────────────────────────────┐
│ Browser (RO/EN)                                                    │
└──────────────────┬─────────────────────────────────────────────────┘
                   │ HTTPS
┌──────────────────▼─────────────────────────────────────────────────┐
│ Next.js 16 app (Railway service)                                   │
│  ├── Middleware: NextAuth gate (/admin) + next-intl locale routing │
│  ├── (site)/[locale]/(public)/*   → public pages (RSC)             │
│  ├── (admin)/admin/*              → admin dashboard (RSC + forms)  │
│  ├── /api/forms/*                 → form submissions               │
│  ├── /api/uploads                 → admin upload handler           │
│  ├── /uploads/[...path]           → serves volume files            │
│  └── /api/auth/[...nextauth]      → NextAuth                       │
└──────┬─────────────────────┬───────────────────────┬───────────────┘
       │                     │                       │
       ▼                     ▼                       ▼
   Postgres            Railway Volume            Resend API
   (Prisma)            /data/uploads             (DKIM via
                       (originals + variants)    riseuptogether.co.uk)
```

External services: hCaptcha (form verify), Resend (transactional + newsletter).

### Route groups
- `src/app/(site)/[locale]/(public)/` — public, locale-prefixed (`/ro/...`, `/en/...`).
- `src/app/(admin)/admin/` — admin, locale-free, NextAuth-protected.
- `src/app/api/` — JSON endpoints (no locale).
- `src/app/uploads/[...path]/route.ts` — passthrough to volume.

### Middleware (mirrors visit-muscelul)
- `/admin/*` → require session, else redirect to `/admin/login`.
- Everything else → `next-intl` middleware with `localePrefix: "always"`, default `ro`.
- Matcher excludes `api`, `_next`, `uploads`, static assets.

---

## 2. Public Routes (RO canonical, EN parity)

| Locale path (RO) | Locale path (EN) | Page |
|---|---|---|
| `/ro` | `/en` | Home |
| `/ro/cine-suntem` | `/en/who-we-are` | Who We Are |
| `/ro/ce-facem` | `/en/what-we-do` | What We Do |
| `/ro/implica-te` | `/en/get-involved` | Get Involved (3 forms) |
| `/ro/turnee` | `/en/tournaments` | Tournaments index |
| `/ro/turnee/[slug]` | `/en/tournaments/[slug]` | Tournament detail |
| `/ro/politica-confidentialitate` | `/en/privacy-policy` | Privacy |

Localized slugs come from `next-intl` `pathnames` config in `src/i18n/routing.ts`. Tournament slugs are per-locale via `TournamentTranslation.slugLocale`.

---

## 3. Data Model (Prisma)

Schema lives at `prisma/schema.prisma`. Conventions: cuid PKs, separate `*Translation` tables for RO/EN, soft fields like `status` enums.

```prisma
enum Locale       { RO EN }
enum PublishStatus { DRAFT PUBLISHED }
enum TournamentStatus { UPCOMING PAST }
enum RegistrationStatus { PENDING APPROVED REJECTED }
enum SubmissionStatus { NEW HANDLED ARCHIVED }
enum PageKey       { HOME WHO_WE_ARE WHAT_WE_DO GET_INVOLVED PRIVACY }

model User {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// ---- CMS content for static pages ----
model PageContent {
  id           String                   @id @default(cuid())
  key          PageKey                  @unique
  status       PublishStatus            @default(DRAFT)
  translations PageContentTranslation[]
  blocks       ContentBlock[]
  updatedAt    DateTime                 @updatedAt
}

model PageContentTranslation {
  id            String       @id @default(cuid())
  pageId        String
  locale        Locale
  title         String
  seoTitle      String?
  seoDesc       String?
  page          PageContent  @relation(fields: [pageId], references: [id], onDelete: Cascade)
  @@unique([pageId, locale])
}

model ContentBlock {
  id        String                  @id @default(cuid())
  pageId    String
  sortOrder Int                     @default(0)
  kind      String   // "hero" | "richText" | "stats" | "cta" | "highlight"
  payload   Json     // shape per kind, validated by Zod
  page      PageContent             @relation(fields: [pageId], references: [id], onDelete: Cascade)
  @@index([pageId, sortOrder])
}

// ---- Team / board ----
model TeamMember {
  id           String                  @id @default(cuid())
  sortOrder    Int                     @default(0)
  photoId      String?
  photo        MediaAsset?             @relation("TeamMemberPhoto", fields: [photoId], references: [id])
  translations TeamMemberTranslation[]
}

model TeamMemberTranslation {
  id           String     @id @default(cuid())
  memberId     String
  locale       Locale
  name         String
  role         String
  bio          String
  member       TeamMember @relation(fields: [memberId], references: [id], onDelete: Cascade)
  @@unique([memberId, locale])
}

// ---- Tournaments ----
model Tournament {
  id              String                  @id @default(cuid())
  status          PublishStatus           @default(DRAFT)
  phase           TournamentStatus
  startDate       DateTime
  endDate         DateTime?
  venueName       String
  venueAddress    String
  registrationOpen Boolean                @default(false)
  coverId         String?
  cover           MediaAsset?             @relation("TournamentCover", fields: [coverId], references: [id])
  translations    TournamentTranslation[]
  videos          VideoEmbed[]
  gallery         MediaAsset[]            @relation("TournamentGallery")
  teams           TournamentTeam[]
  results         MatchResult[]
  registrations   TeamRegistration[]
  createdAt       DateTime                @default(now())
  updatedAt       DateTime                @updatedAt
  @@index([phase, status, startDate])
}

model TournamentTranslation {
  id           String     @id @default(cuid())
  tournamentId String
  locale       Locale
  title        String
  slugLocale   String
  summary      String
  description  Json       // rich-text JSON
  seoTitle     String?
  seoDesc      String?
  tournament   Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  @@unique([tournamentId, locale])
  @@unique([locale, slugLocale])
}

model VideoEmbed {
  id           String     @id @default(cuid())
  tournamentId String
  youtubeId    String
  titleRo      String?
  titleEn      String?
  sortOrder    Int        @default(0)
  tournament   Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  @@index([tournamentId, sortOrder])
}

model TournamentTeam {
  id           String     @id @default(cuid())
  tournamentId String
  name         String
  logoId       String?
  logo         MediaAsset? @relation("TeamLogo", fields: [logoId], references: [id])
  sortOrder    Int        @default(0)
  tournament   Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  results      MatchResult[] @relation("TeamResults")
  @@index([tournamentId])
}

model MatchResult {
  id            String         @id @default(cuid())
  tournamentId  String
  round         String         // "Group A" | "Semifinal" | "Final"
  homeTeamId    String
  awayTeamId    String
  homeScore     Int
  awayScore     Int
  playedAt      DateTime?
  tournament    Tournament     @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  homeTeam      TournamentTeam @relation("TeamResults", fields: [homeTeamId], references: [id])
  awayTeam      TournamentTeam @relation(fields: [awayTeamId], references: [id])
  @@index([tournamentId, round])
}

// ---- Submissions ----
model VolunteerSubmission {
  id        String           @id @default(cuid())
  name      String
  email     String
  phone     String?
  interests String           // free text
  message   String?
  status    SubmissionStatus @default(NEW)
  createdAt DateTime         @default(now())
}

model SponsorInquiry {
  id          String           @id @default(cuid())
  company     String
  contactName String
  email       String
  phone       String?
  tier        String?          // "bronze" | "silver" | "gold" | "custom"
  message     String
  status      SubmissionStatus @default(NEW)
  createdAt   DateTime         @default(now())
}

model NewsletterSubscriber {
  id           String   @id @default(cuid())
  email        String   @unique
  locale       Locale
  confirmed    Boolean  @default(false)
  confirmToken String?  @unique
  confirmedAt  DateTime?
  unsubToken   String   @unique
  createdAt    DateTime @default(now())
}

model TeamRegistration {
  id            String             @id @default(cuid())
  tournamentId  String
  teamName      String
  captainName   String
  captainEmail  String
  captainPhone  String?
  playerCount   Int
  notes         String?
  status        RegistrationStatus @default(PENDING)
  decidedAt     DateTime?
  decidedById   String?
  createdAt     DateTime           @default(now())
  tournament    Tournament         @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
  @@index([tournamentId, status])
}

// ---- Media (shared) ----
model MediaAsset {
  id           String   @id @default(cuid())
  storageKey   String   // path on volume, e.g. "tournaments/<id>/<uuid>.jpg"
  variants     Json     // { thumb: "...", md: "...", lg: "..." }
  width        Int
  height       Int
  altRo        String?
  altEn        String?
  createdAt    DateTime @default(now())

  // back-relations
  tournamentGallery   Tournament[]    @relation("TournamentGallery")
  tournamentCover     Tournament[]    @relation("TournamentCover")
  teamMember          TeamMember[]    @relation("TeamMemberPhoto")
  teamLogo            TournamentTeam[] @relation("TeamLogo")
}
```

### RO/EN fallback rule
Server helpers `getTranslation(entity, locale)` return EN if present, else RO. Admin UI flags missing-EN per row.

---

## 4. Component Architecture

```
src/
├── app/
│   ├── (site)/[locale]/(public)/
│   │   ├── layout.tsx                 (Header, Footer, LanguageSwitcher, CookieBanner)
│   │   ├── page.tsx                   Home
│   │   ├── cine-suntem/page.tsx       (mapped via pathnames)
│   │   ├── ce-facem/page.tsx
│   │   ├── implica-te/page.tsx
│   │   ├── turnee/page.tsx
│   │   └── turnee/[slug]/page.tsx
│   ├── (admin)/admin/
│   │   ├── layout.tsx                 (AdminShell, nav, session guard)
│   │   ├── page.tsx                   Dashboard
│   │   ├── login/page.tsx
│   │   ├── tournaments/[id]/edit/page.tsx
│   │   ├── tournaments/new/page.tsx
│   │   ├── pages/[key]/page.tsx
│   │   ├── team/page.tsx
│   │   ├── submissions/
│   │   │   ├── volunteers/page.tsx
│   │   │   ├── sponsors/page.tsx
│   │   │   ├── registrations/page.tsx (approve queue)
│   │   │   └── newsletter/page.tsx
│   │   └── media/page.tsx
│   ├── api/
│   │   ├── forms/volunteer/route.ts
│   │   ├── forms/sponsor/route.ts
│   │   ├── forms/newsletter/route.ts
│   │   ├── forms/newsletter/confirm/route.ts
│   │   ├── forms/newsletter/unsubscribe/route.ts
│   │   ├── forms/team-registration/route.ts
│   │   ├── uploads/route.ts
│   │   └── auth/[...nextauth]/route.ts
│   └── uploads/[...path]/route.ts
├── components/
│   ├── site/  (Header, Footer, Hero, TournamentCard, YoutubeEmbed, Gallery, ResultsTable, FormVolunteer, FormSponsor, FormNewsletter, FormTeamRegistration, LanguageSwitcher, CookieBanner)
│   ├── admin/ (DataTable, EntityForm, TranslationFields, MediaPicker, MissingTranslationBadge, ApproveButtons)
│   └── ui/    (Radix wrappers: Button, Input, Dialog, Toast — copy from visit-muscelul)
├── server/
│   ├── db.ts                Prisma singleton
│   ├── auth.ts              NextAuth handler
│   ├── tournaments.ts       queries + mutations
│   ├── pages.ts
│   ├── submissions.ts
│   ├── newsletter.ts        (double opt-in, unsub tokens)
│   ├── media.ts             (sharp variants, volume writes)
│   ├── email.ts             (Resend client + templates)
│   └── hcaptcha.ts          (verify)
├── lib/
│   ├── i18n.ts              translation helpers
│   ├── slug.ts
│   ├── ratelimit.ts         (in-memory token bucket per IP)
│   └── zod-schemas.ts       shared validators
├── i18n/                    routing.ts, request.ts, navigation.ts
└── middleware.ts
```

---

## 5. API Specifications

All form endpoints share this shape:
```
POST /api/forms/<name>
Content-Type: application/json
Body: { ...fields, hcaptchaToken: string, locale: "ro"|"en" }
Response: 200 { ok: true } | 400 { error: "validation"|"captcha"|"ratelimited", details? }
```

Pipeline (server):
1. Rate-limit by IP (5/min per endpoint).
2. Verify hCaptcha token with secret.
3. Zod-validate payload.
4. Persist to DB.
5. Side effects (email/confirmation token) — failures logged, not surfaced.

### Endpoints
| Method | Path | Purpose | DB write | Side effect |
|---|---|---|---|---|
| POST | `/api/forms/volunteer` | Volunteer signup | `VolunteerSubmission` | Resend: admin notify + user thanks |
| POST | `/api/forms/sponsor` | Sponsor inquiry | `SponsorInquiry` | Resend: admin notify + user thanks |
| POST | `/api/forms/newsletter` | Subscribe | `NewsletterSubscriber{confirmed:false}` | Resend: confirm link with `confirmToken` |
| GET  | `/api/forms/newsletter/confirm?token=` | Double opt-in | set `confirmed:true` | Resend: welcome |
| GET  | `/api/forms/newsletter/unsubscribe?token=` | Unsub | delete row | — |
| POST | `/api/forms/team-registration` | Team signup (only when tournament `phase=UPCOMING` and `registrationOpen=true`) | `TeamRegistration{status:PENDING}` | Resend: admin notify |
| POST | `/api/uploads` (admin) | Multipart upload, runs sharp to make variants, writes to `/data/uploads/<scope>/<id>/...`, inserts `MediaAsset` | `MediaAsset` | volume write |

### Admin mutations
Use **Next.js Server Actions** (RSC pattern from visit-muscelul) — no separate REST layer. Each action validates session, Zod-validates input, writes Prisma, calls `revalidatePath` on affected public routes.

---

## 6. Auth Model

- NextAuth v5 with **Credentials** provider only (email + password, bcryptjs).
- Single `User` table, seeded via `prisma/seed.ts` (env vars `ADMIN_EMAIL`, `ADMIN_PASSWORD`).
- Session strategy: JWT, 30-day rolling.
- All `/admin/*` and `/api/uploads` require session (middleware + per-action `requireAdmin()`).
- Form endpoints are public.

---

## 7. File Storage (Railway volume)

- Volume mounted at `/data/uploads`.
- Path scheme: `<scope>/<entityId>/<uuid>.<ext>` (scope ∈ `tournaments | team | gallery | covers`).
- On upload, `sharp` generates 3 variants (`thumb 400w`, `md 1024w`, `lg 1920w`) stored alongside; original kept.
- `MediaAsset.variants` JSON: `{ orig, thumb, md, lg }` storage keys.
- Public read via `/uploads/[...path]/route.ts` streaming `fs.createReadStream` with cache headers (`public, max-age=31536000, immutable`).
- `next/image` configured with `unoptimized: false` and `remotePatterns` for own origin.

---

## 8. Internationalization

- `next-intl` with `localePrefix: "always"`, default `ro`. Locales `["ro","en"]`.
- `src/i18n/routing.ts` defines localized `pathnames` (table in §2).
- Translation files: `messages/{ro,en}.json` for UI chrome.
- Entity content via `*Translation` tables. Server helper:
  ```ts
  function pickLocale<T extends { locale: Locale }>(translations: T[], locale: Locale): T {
    return translations.find(t => t.locale === locale.toUpperCase())
        ?? translations.find(t => t.locale === "RO")!; // RO always present
  }
  ```
- `<hreflang>` tags emitted in metadata for each page using alternate locale URL.

---

## 9. Email (Resend)

Sender: `noreply@riseuptogether.co.uk` (configured post-domain). Reply-to: `hello@riseuptogether.co.uk`.

Templates (React Email or plain HTML files under `src/server/emails/`):
- `volunteer-admin.tsx`, `volunteer-user.tsx`
- `sponsor-admin.tsx`, `sponsor-user.tsx`
- `newsletter-confirm.tsx`, `newsletter-welcome.tsx`
- `team-registration-admin.tsx`
- `team-registration-decision.tsx` (sent on admin approve/reject)

All templates accept `locale` and render bilingual subject/body accordingly.

---

## 10. Form Submission Sequence (Newsletter example)

```
User → POST /api/forms/newsletter { email, locale, hcaptchaToken }
  ├─ rate-limit  ──── 429 on bust
  ├─ hcaptcha verify ─ 400 on fail
  ├─ Zod parse ────── 400 on fail
  ├─ Prisma create NewsletterSubscriber{confirmToken, confirmed:false}
  ├─ Resend send confirm email (link → /api/forms/newsletter/confirm?token=...)
  └─ 200 { ok:true }

User clicks confirm link
  → GET /api/forms/newsletter/confirm?token=...
  ├─ find by confirmToken
  ├─ set confirmed:true, confirmedAt:now, clear confirmToken
  ├─ Resend welcome email
  └─ 302 → /[locale]/implica-te?newsletter=confirmed
```

Team-registration approval sequence:
```
Public POST → status=PENDING → admin notified
Admin opens /admin/submissions/registrations → Approve|Reject
  └─ Server Action: update status, decidedAt, decidedById;
     if APPROVED → create TournamentTeam linked to tournament,
                   send Resend team-registration-decision (approved).
     if REJECTED → send rejection email.
```

---

## 11. SEO

- Per-route `generateMetadata` reads page/tournament translation, emits `title`, `description`, OG image (cover variant `lg`), `alternates.languages` for hreflang.
- `app/sitemap.ts` lists both locales × all public pages × all published tournaments.
- `app/robots.ts` allows all, disallows `/admin`, `/api`, `/uploads`.
- JSON-LD on tournament detail: `SportsEvent` with name, startDate, location, performer (teams).

---

## 12. Security & Privacy

- HTTPS only (Railway default).
- CSP via `next.config.ts` headers — allow self, `https://www.youtube.com`, `https://hcaptcha.com`, `https://*.resend.com`.
- All public POSTs: rate-limit + hCaptcha + Zod.
- Admin password hashed with bcryptjs (cost 12).
- Cookie-consent banner gates analytics (none in v1 — banner still required for the newsletter token cookie).
- Privacy policy page lists data processors: Railway (hosting), Resend (email), hCaptcha (anti-bot).
- Unsubscribe link on every newsletter email; one-click via `unsubToken`.

---

## 13. Deployment

- `Dockerfile`, `railway.json` copied from visit-muscelul, adjusted for service name.
- Volume mounted at `/data/uploads`.
- Env vars:
  ```
  DATABASE_URL
  NEXTAUTH_SECRET
  NEXTAUTH_URL
  ADMIN_EMAIL
  ADMIN_PASSWORD             (seed only)
  RESEND_API_KEY
  RESEND_FROM
  HCAPTCHA_SECRET
  HCAPTCHA_SITE_KEY          (public)
  UPLOADS_DIR=/data/uploads
  ```
- Deploy lifecycle: `pnpm install` → `prisma generate` → `prisma migrate deploy` → `next build` → `next start`.
- Seed runs once on first deploy: admin user + empty PageContent rows for the 5 PageKeys.

---

## 14. Risks & Open Items

| Risk | Mitigation |
|---|---|
| Railway volume single-AZ | Acceptable v1; weekly DB+volume backup script (`/sc:workflow` to schedule). |
| EN content lag | RO-fallback rule + admin missing-EN badge prevent broken pages. |
| YouTube iframe & CSP | Whitelist `www.youtube.com` and `youtube-nocookie.com`; prefer nocookie embeds. |
| Spam on forms | hCaptcha + rate-limit; admin can archive/delete submissions. |
| Image upload abuse | Admin-only endpoint, MIME + size cap (5MB), magic-byte check. |

---

## 15. Definition of Done for Design
- [x] Routes mapped (RO + EN)
- [x] Prisma schema drafted
- [x] Component tree defined
- [x] API & Server Action contracts specified
- [x] Auth, storage, i18n, email, SEO, security covered
- [x] Deployment env documented

**Next:** `/sc:workflow` to phase the implementation.
