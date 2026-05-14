# Project conventions for Claude

## Commit cadence

**Standing instruction:** when a logical unit of work is complete (one
feature, one workflow phase, or one bug fix), propose a commit and wait for my
approval before running `git commit`.

- **One commit per logical unit**, not per file edit. Don't commit mid-feature
  even if intermediate states look reasonable.
- **Always ask first.** Show me the proposed commit message and the file list;
  let me eyeball the diff before approving.
- **Group all related files into a single commit.** If I made multiple changes
  while implementing one thing, they ship together.
- **Split unrelated work.** If two things landed in the same session, propose
  two separate commits.
- Subject in present tense, focused on the *why*. Body when context isn't
  obvious from the diff.
- **Never push** unless I explicitly say so.

## Other notes

- Stack: Next.js 16 + Prisma + next-intl + NextAuth v5 + Tailwind v4, deployed
  to Railway. See `docs/design.md` for the architecture and
  `docs/LAUNCH.md` for the deployment runbook.
- Don't rename `middleware.ts` to `proxy.ts` until we're ready to bump past
  Next 16's deprecation warning — it's not blocking yet.
