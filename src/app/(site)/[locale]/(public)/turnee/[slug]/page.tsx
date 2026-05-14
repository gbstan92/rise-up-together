import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Calendar, MapPin } from "lucide-react";
import { TournamentStatus } from "@/generated/prisma/enums";
import { Container } from "@/components/public/Container";
import { Section } from "@/components/public/Section";
import { YoutubeEmbed } from "@/components/public/YoutubeEmbed";
import { FormTeamRegistration } from "@/components/public/forms/FormTeamRegistration";
import { getPublicTournament } from "@/server/tournaments";
import { tournamentAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const l = locale as "ro" | "en";
  const t = await getPublicTournament(l, slug);
  if (!t) return {};
  const SITE = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  return {
    title: t.seoTitle ?? t.title,
    description: t.seoDesc ?? t.summary,
    alternates: tournamentAlternates(l, t.altSlug.ro, t.altSlug.en),
    openGraph: {
      title: t.seoTitle ?? t.title,
      description: t.seoDesc ?? t.summary,
      type: "article",
      images: t.coverLg ? [`${SITE}/uploads/${t.coverLg}`] : undefined,
    },
  };
}

function formatRange(start: Date, end: Date | null, locale: string) {
  const fmt = new Intl.DateTimeFormat(locale === "ro" ? "ro-RO" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (!end || start.toDateString() === end.toDateString()) return fmt.format(start);
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const l = locale as "ro" | "en";
  const t = await getPublicTournament(l, slug);
  if (!t) notFound();
  const tReg = await getTranslations("teamRegistration");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: t.title,
    description: t.summary,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate ? t.endDate.toISOString() : undefined,
    location: {
      "@type": "Place",
      name: t.venueName,
      address: t.venueAddress,
    },
    sport: "Football",
  };

  return (
    <>
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-accent/40 to-background">
        {t.coverLg && (
          <div className="absolute inset-0 opacity-30">
            <Image
              src={`/uploads/${t.coverLg}`}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}
        <Container className="relative py-20 md:py-28">
          <p className="text-xs uppercase tracking-[0.18em] text-primary">
            {t.phase === TournamentStatus.UPCOMING ? tReg("phaseUpcoming") : tReg("phasePast")}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight md:text-5xl">
            {t.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground/80">
            <span className="inline-flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              {formatRange(t.startDate, t.endDate, l)}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              {t.venueName} · {t.venueAddress}
            </span>
          </div>
          {t.summary && (
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{t.summary}</p>
          )}
        </Container>
      </section>

      {t.descriptionHtml && (
        <Section>
          <div
            className="max-w-3xl text-base leading-relaxed text-foreground/90 [&>h2]:mt-8 [&>h2]:mb-3 [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-semibold [&>p]:my-3 [&>ul]:my-3 [&>ul]:list-disc [&>ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: t.descriptionHtml }}
          />
        </Section>
      )}

      {t.videos.length > 0 && (
        <Section className="bg-muted/40" title={tReg("videosTitle")}>
          <div className="grid gap-6 md:grid-cols-2">
            {t.videos.map((v) => (
              <YoutubeEmbed key={v.id} id={v.youtubeId} title={v.title} />
            ))}
          </div>
        </Section>
      )}

      {t.gallery.length > 0 && (
        <Section title={tReg("galleryTitle")}>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {t.gallery.map((g) => (
              <a
                key={g.id}
                href={`/uploads/${g.lg}`}
                target="_blank"
                rel="noopener"
                className="relative block aspect-square overflow-hidden rounded-md bg-muted"
              >
                <Image
                  src={`/uploads/${g.md}`}
                  alt={g.alt}
                  fill
                  sizes="(min-width:1024px) 25vw, 50vw"
                  className="object-cover transition hover:scale-[1.02]"
                />
              </a>
            ))}
          </div>
        </Section>
      )}

      {t.teams.length > 0 && (
        <Section className="bg-muted/40" title={tReg("teamsTitle")}>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {t.teams.map((tm) => (
              <div key={tm.id} className="flex items-center gap-3 rounded-lg border bg-card p-4">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                  {tm.logoThumb && (
                    <Image
                      src={`/uploads/${tm.logoThumb}`}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  )}
                </div>
                <p className="truncate font-medium">{tm.name}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {t.phase === TournamentStatus.PAST && t.results.length > 0 && (
        <Section title={tReg("resultsTitle")}>
          <div className="overflow-x-auto rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">{tReg("round")}</th>
                  <th className="px-4 py-2">{tReg("home")}</th>
                  <th className="px-4 py-2 text-center">{tReg("score")}</th>
                  <th className="px-4 py-2">{tReg("away")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {t.results.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-2 text-muted-foreground">{r.round}</td>
                    <td className="px-4 py-2 font-medium">{r.home}</td>
                    <td className="px-4 py-2 text-center tabular-nums">
                      <b>{r.homeScore}</b> – <b>{r.awayScore}</b>
                    </td>
                    <td className="px-4 py-2 font-medium">{r.away}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {t.phase === TournamentStatus.UPCOMING && t.registrationOpen && (
        <Section className="bg-accent/30" title={tReg("registerTitle")} description={tReg("registerIntro")}>
          <div className="max-w-xl">
            <FormTeamRegistration tournamentId={t.id} />
          </div>
        </Section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
