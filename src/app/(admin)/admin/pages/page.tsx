import Link from "next/link";
import { listAdminPages } from "@/server/pages";
import { MissingBadge } from "@/components/admin/MissingBadge";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  HOME: "Home",
  WHO_WE_ARE: "Who we are",
  WHAT_WE_DO: "What we do",
  GET_INVOLVED: "Get involved",
  PRIVACY: "Privacy policy",
};

export default async function AdminPagesIndex() {
  const pages = await listAdminPages();
  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Pages</h1>
        <p className="text-sm text-muted-foreground">
          Edit titles, SEO and body content for each public page.
        </p>
      </header>
      <ul className="divide-y rounded-lg border bg-card">
        {pages.map((p) => (
          <li key={p.key}>
            <Link
              href={`/admin/pages/${p.key}`}
              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-muted"
            >
              <div className="min-w-0">
                <p className="font-medium">{LABELS[p.key] ?? p.key}</p>
                <p className="truncate text-xs text-muted-foreground">
                  RO: {p.titleRo || "—"} {p.titleEn ? `· EN: ${p.titleEn}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {p.missingEn && <MissingBadge />}
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide " +
                    (p.status === "PUBLISHED"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground")
                  }
                >
                  {p.status}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
