import Link from "next/link";
import { Locale } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/server/require-admin";
import { DecisionButtons } from "./DecisionButtons";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "", label: "All" },
];

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const current = status ?? "PENDING";

  const where =
    current === "" ? {} : { status: current as "PENDING" | "APPROVED" | "REJECTED" };

  const rows = await prisma.teamRegistration.findMany({
    where,
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      tournament: { include: { translations: true } },
    },
    take: 200,
  });

  return (
    <div className="p-8 space-y-6">
      <header>
        <Link
          href="/admin/submissions"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Submissions
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold">Team registrations</h1>
      </header>

      <div className="flex gap-1 text-xs">
        {FILTERS.map((f) => {
          const href = f.value
            ? `/admin/submissions/registrations?status=${f.value}`
            : "/admin/submissions/registrations?status=";
          const active = current === f.value;
          return (
            <Link
              key={f.value || "all"}
              href={href}
              className={
                "rounded-full border px-3 py-1 " +
                (active ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")
              }
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-md border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          Nothing here.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const tr =
              r.tournament.translations.find((t) => t.locale === Locale.RO) ??
              r.tournament.translations[0];
            return (
              <li key={r.id} className="rounded-lg border bg-card p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-semibold">{r.teamName}</p>
                    <p className="text-xs text-muted-foreground">
                      For <Link className="hover:underline" href={`/admin/tournaments/${r.tournamentId}`}>{tr?.title ?? "—"}</Link>
                      {" · "}
                      {r.createdAt.toLocaleString()}
                    </p>
                    <p className="mt-3 text-sm">
                      <b>Captain:</b> {r.captainName} ·{" "}
                      <a className="text-primary hover:underline" href={`mailto:${r.captainEmail}`}>
                        {r.captainEmail}
                      </a>
                      {r.captainPhone && (
                        <span className="text-muted-foreground"> · {r.captainPhone}</span>
                      )}
                    </p>
                    <p className="text-sm">
                      <b>Players:</b> {r.playerCount}
                    </p>
                    {r.notes && (
                      <p className="mt-2 rounded-md bg-muted p-3 text-sm italic">{r.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide " +
                        (r.status === "APPROVED"
                          ? "bg-accent text-accent-foreground"
                          : r.status === "REJECTED"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground")
                      }
                    >
                      {r.status}
                    </span>
                    {r.status === "PENDING" && <DecisionButtons id={r.id} />}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
