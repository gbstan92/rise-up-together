import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { TournamentStatus } from "@/generated/prisma/enums";
import { Section } from "@/components/public/Section";
import { TournamentCard } from "@/components/public/TournamentCard";
import { listPublicTournaments } from "@/server/tournaments";
import { staticAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = locale as "ro" | "en";
  const t = await getTranslations({ locale: l, namespace: "tournaments" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: staticAlternates("tournaments", l),
  };
}

export default async function TournamentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale as "ro" | "en";
  const t = await getTranslations("tournaments");

  const [upcoming, past] = await Promise.all([
    listPublicTournaments(l, TournamentStatus.UPCOMING),
    listPublicTournaments(l, TournamentStatus.PAST),
  ]);

  return (
    <>
      <Section eyebrow={t("title")} title={t("upcoming")} description={t("intro")}>
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((row) => (
              <TournamentCard key={row.id} t={row} locale={l} />
            ))}
          </div>
        )}
      </Section>

      <Section className="bg-muted/40" title={t("past")}>
        {past.length === 0 ? (
          <p className="text-muted-foreground">{t("empty")}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {past.map((row) => (
              <TournamentCard key={row.id} t={row} locale={l} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
