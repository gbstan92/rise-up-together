import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/server/require-admin";

export const dynamic = "force-dynamic";

export default async function SubmissionsIndex() {
  await requireAdmin();
  const [vNew, sNew, regPending, subsConfirmed] = await Promise.all([
    prisma.volunteerSubmission.count({ where: { status: "NEW" } }),
    prisma.sponsorInquiry.count({ where: { status: "NEW" } }),
    prisma.teamRegistration.count({ where: { status: "PENDING" } }),
    prisma.newsletterSubscriber.count({ where: { confirmed: true } }),
  ]);

  const cards: Array<{ href: string; label: string; value: number; hint: string }> = [
    { href: "/admin/submissions/volunteers", label: "Volunteers", value: vNew, hint: "new" },
    { href: "/admin/submissions/sponsors", label: "Sponsor inquiries", value: sNew, hint: "new" },
    { href: "/admin/submissions/registrations", label: "Team registrations", value: regPending, hint: "pending" },
    { href: "/admin/submissions/newsletter", label: "Newsletter subscribers", value: subsConfirmed, hint: "confirmed" },
  ];

  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Submissions</h1>
        <p className="text-sm text-muted-foreground">Forms received from the public site.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-lg border bg-card p-6 transition hover:shadow-md"
          >
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-display text-4xl font-semibold">{c.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
              {c.hint}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
