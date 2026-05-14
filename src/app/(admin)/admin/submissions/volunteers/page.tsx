import Link from "next/link";
import { Download } from "lucide-react";
import { SubmissionStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/server/require-admin";
import { Button } from "@/components/ui/button";
import { StatusFilter } from "../_components/StatusFilter";
import { StatusButtons } from "../_components/StatusButtons";

export const dynamic = "force-dynamic";

export default async function VolunteersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const where =
    status && status in SubmissionStatus
      ? { status: status as SubmissionStatus }
      : {};

  const rows = await prisma.volunteerSubmission.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
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
          <h1 className="mt-1 font-display text-3xl font-semibold">Volunteers</h1>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href="/api/admin/submissions/volunteers/export">
            <Download className="size-4" /> Export CSV
          </a>
        </Button>
      </header>

      <StatusFilter basePath="/admin/submissions/volunteers" current={status} />

      {rows.length === 0 ? (
        <p className="rounded-md border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          No volunteer submissions.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2">When</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Interests</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => (
                <tr key={r.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-2 text-xs text-muted-foreground">
                    {r.createdAt.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 font-medium">{r.name}</td>
                  <td className="px-4 py-2">
                    <a className="text-primary hover:underline" href={`mailto:${r.email}`}>
                      {r.email}
                    </a>
                  </td>
                  <td className="px-4 py-2">{r.phone ?? "—"}</td>
                  <td className="max-w-md px-4 py-2 text-muted-foreground">
                    {r.interests}
                    {r.message && (
                      <p className="mt-1 text-xs italic">{r.message}</p>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <StatusButtons table="volunteer" id={r.id} status={r.status} />
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
