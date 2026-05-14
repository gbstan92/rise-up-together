import { Locale } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/server/require-admin";
import { TeamList } from "./_components/TeamList";
import { TeamMemberForm } from "./_components/TeamMemberForm";

export const dynamic = "force-dynamic";

type MemberVariants = { thumb?: string; md?: string };

export default async function AdminTeamPage() {
  await requireAdmin();
  const members = await prisma.teamMember.findMany({
    orderBy: { sortOrder: "asc" },
    include: { translations: true, photo: true },
  });

  const items = members.map((m) => {
    const ro = m.translations.find((t) => t.locale === Locale.RO);
    const en = m.translations.find((t) => t.locale === Locale.EN);
    const v = (m.photo?.variants ?? null) as MemberVariants | null;
    return {
      id: m.id,
      sortOrder: m.sortOrder,
      photoId: m.photoId,
      photoThumb: v?.thumb ?? null,
      ro: {
        name: ro?.name ?? "",
        role: ro?.role ?? "",
        bio: ro?.bio ?? "",
      },
      en: {
        name: en?.name ?? "",
        role: en?.role ?? "",
        bio: en?.bio ?? "",
      },
      missingEn: !en || !en.name,
    };
  });

  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Team</h1>
        <p className="text-sm text-muted-foreground">
          Board members shown on the &quot;Who we are&quot; page.
        </p>
      </header>

      <section className="rounded-lg border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Add member
        </h2>
        <TeamMemberForm />
      </section>

      <TeamList items={items} />
    </div>
  );
}
