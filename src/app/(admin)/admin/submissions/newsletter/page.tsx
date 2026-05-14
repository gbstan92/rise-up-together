import Link from "next/link";
import { Download } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/server/require-admin";
import { Button } from "@/components/ui/button";
import { UnsubButton } from "./UnsubButton";

export const dynamic = "force-dynamic";

export default async function NewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireAdmin();
  const { filter } = await searchParams;
  const onlyConfirmed = filter !== "all";

  const rows = await prisma.newsletterSubscriber.findMany({
    where: onlyConfirmed ? { confirmed: true } : {},
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <div className="p-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/submissions"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Submissions
          </Link>
          <h1 className="mt-1 font-display text-3xl font-semibold">Newsletter subscribers</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href="/api/admin/submissions/newsletter/export">
            <Download className="size-4" /> Export CSV
          </a>
        </Button>
      </header>

      <div className="flex gap-1 text-xs">
        <Link
          href="/admin/submissions/newsletter"
          className={
            "rounded-full border px-3 py-1 " +
            (onlyConfirmed ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")
          }
        >
          Confirmed
        </Link>
        <Link
          href="/admin/submissions/newsletter?filter=all"
          className={
            "rounded-full border px-3 py-1 " +
            (!onlyConfirmed ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")
          }
        >
          All
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-md border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          No subscribers.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Subscribed</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Locale</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="whitespace-nowrap px-4 py-2 text-xs text-muted-foreground">
                    {r.createdAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 font-medium">{r.email}</td>
                  <td className="px-4 py-2 text-xs">{r.locale}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide " +
                        (r.confirmed
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground")
                      }
                    >
                      {r.confirmed ? "Confirmed" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <UnsubButton id={r.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
