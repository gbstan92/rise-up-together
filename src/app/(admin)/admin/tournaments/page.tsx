import Link from "next/link";
import { Button } from "@/components/ui/button";
import { listAdminTournaments } from "@/server/tournaments";
import { MissingBadge } from "@/components/admin/MissingBadge";

export const dynamic = "force-dynamic";

const PHASE_STYLE: Record<string, string> = {
  UPCOMING: "bg-accent text-accent-foreground",
  PAST: "bg-muted text-muted-foreground",
};

export default async function AdminTournamentsPage() {
  const rows = await listAdminTournaments();
  return (
    <div className="p-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Tournaments</h1>
          <p className="text-sm text-muted-foreground">
            All tournaments — drafts and published, upcoming and past.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tournaments/new">New tournament</Link>
        </Button>
      </header>

      {rows.length === 0 ? (
        <p className="rounded-md border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          No tournaments yet.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border bg-card">
          {rows.map((r) => (
            <li key={r.id}>
              <Link
                href={`/admin/tournaments/${r.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {r.titleRo} {r.missingEn && <MissingBadge />}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.startDate.toLocaleDateString()} · {r.titleEn || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide">
                  {r.registrationOpen && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                      Reg open
                    </span>
                  )}
                  <span
                    className={
                      "rounded-full px-2 py-0.5 " + (PHASE_STYLE[r.phase] ?? "bg-muted")
                    }
                  >
                    {r.phase}
                  </span>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 " +
                      (r.status === "PUBLISHED"
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground")
                    }
                  >
                    {r.status}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
