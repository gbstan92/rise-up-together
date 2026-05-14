import { prisma } from "@/lib/db";
import { requireAdmin } from "@/server/require-admin";

export const dynamic = "force-dynamic";

async function getCounts() {
  const [tournaments, volunteers, sponsors, subscribers, registrationsPending] =
    await Promise.all([
      prisma.tournament.count(),
      prisma.volunteerSubmission.count({ where: { status: "NEW" } }),
      prisma.sponsorInquiry.count({ where: { status: "NEW" } }),
      prisma.newsletterSubscriber.count({ where: { confirmed: true } }),
      prisma.teamRegistration.count({ where: { status: "PENDING" } }),
    ]);
  return { tournaments, volunteers, sponsors, subscribers, registrationsPending };
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-card px-5 py-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  await requireAdmin();
  const c = await getCounts();
  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your content.</p>
      </header>
      <section>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Stat label="Tournaments" value={c.tournaments} />
          <Stat label="New volunteers" value={c.volunteers} />
          <Stat label="New sponsors" value={c.sponsors} />
          <Stat label="Subscribers" value={c.subscribers} />
          <Stat label="Pending teams" value={c.registrationsPending} />
        </div>
      </section>
    </div>
  );
}
