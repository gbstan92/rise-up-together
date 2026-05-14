# Project conventions for Claude

## Commit cadence

**Standing instruction:** after every meaningful change (file create, edit, or
delete that leaves the working tree in a coherent state), create a git commit
without waiting for me to ask.

- Group tightly related edits into one commit (e.g. all files touched to ship
  one feature/fix).
- One sentence subject in the present tense, focused on the *why*. Include a
  short body when context isn't obvious from the diff.
- Don't include unrelated work in the same commit; split them.
- Never push unless I explicitly ask.
- If the change is incomplete / known-broken, say so in the message body
  (`WIP:` prefix is fine) — still commit.

## Other notes

- Stack: Next.js 16 + Prisma + next-intl + NextAuth v5 + Tailwind v4, deployed
  to Railway. See `docs/design.md` for the architecture and
  `docs/LAUNCH.md` for the deployment runbook.
- Don't rename `middleware.ts` to `proxy.ts` until we're ready to bump past
  Next 16's deprecation warning — it's not blocking yet.
