import { notFound } from "next/navigation";
import Link from "next/link";
import { getAdminTournament } from "@/server/tournaments";
import { TournamentEditor } from "./_components/TournamentEditor";

export const dynamic = "force-dynamic";

export default async function AdminTournamentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getAdminTournament(id);
  if (!t) notFound();

  return (
    <div className="p-8 space-y-6">
      <header>
        <Link
          href="/admin/tournaments"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Tournaments
        </Link>
        <h1 className="mt-1 font-display text-3xl font-semibold">{t.ro.title}</h1>
      </header>
      <TournamentEditor initial={t} />
    </div>
  );
}
