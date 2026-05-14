import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { upsertTournament } from "@/server/tournaments";

async function createDraft() {
  "use server";
  const { id } = await upsertTournament({
    status: "DRAFT",
    phase: "UPCOMING",
    startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    endDate: null,
    venueName: "TBD",
    venueAddress: "TBD",
    registrationOpen: false,
    coverId: null,
    ro: { title: "Turneu nou", slugLocale: "", summary: "", seoTitle: "", seoDesc: "" },
    en: { title: "", slugLocale: "", summary: "", seoTitle: "", seoDesc: "" },
    body: { bodyRo: "", bodyEn: "" },
  });
  redirect(`/admin/tournaments/${id}`);
}

export default function NewTournamentPage() {
  return (
    <div className="p-8">
      <Link
        href="/admin/tournaments"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Tournaments
      </Link>
      <h1 className="mt-1 font-display text-3xl font-semibold">New tournament</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Creates a draft you can edit on the next screen.
      </p>
      <form action={createDraft} className="mt-6">
        <Button type="submit">Create draft</Button>
      </form>
    </div>
  );
}
