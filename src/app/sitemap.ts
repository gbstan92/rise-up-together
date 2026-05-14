import type { MetadataRoute } from "next";
import { PublishStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { Locale } from "@/generated/prisma/enums";

export const dynamic = "force-dynamic";

const STATIC_PAGES: Array<{ ro: string; en: string }> = [
  { ro: "", en: "" }, // home
  { ro: "cine-suntem", en: "who-we-are" },
  { ro: "ce-facem", en: "what-we-do" },
  { ro: "implica-te", en: "get-involved" },
  { ro: "turnee", en: "tournaments" },
  { ro: "politica-confidentialitate", en: "privacy-policy" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.flatMap((p) => [
    {
      url: `${base}/ro${p.ro ? `/${p.ro}` : ""}`,
      changeFrequency: "monthly",
      priority: p.ro === "" ? 1 : 0.7,
      alternates: {
        languages: {
          ro: `${base}/ro${p.ro ? `/${p.ro}` : ""}`,
          en: `${base}/en${p.en ? `/${p.en}` : ""}`,
        },
      },
    },
    {
      url: `${base}/en${p.en ? `/${p.en}` : ""}`,
      changeFrequency: "monthly",
      priority: p.en === "" ? 1 : 0.7,
      alternates: {
        languages: {
          ro: `${base}/ro${p.ro ? `/${p.ro}` : ""}`,
          en: `${base}/en${p.en ? `/${p.en}` : ""}`,
        },
      },
    },
  ]);

  const tournaments = await prisma.tournament.findMany({
    where: { status: PublishStatus.PUBLISHED },
    include: { translations: true },
  });
  const tournamentEntries: MetadataRoute.Sitemap = tournaments.flatMap((t) => {
    const ro = t.translations.find((x) => x.locale === Locale.RO);
    const en = t.translations.find((x) => x.locale === Locale.EN);
    if (!ro || !en) return [];
    const roUrl = `${base}/ro/turnee/${ro.slugLocale}`;
    const enUrl = `${base}/en/tournaments/${en.slugLocale}`;
    const lastModified = t.updatedAt;
    return [
      {
        url: roUrl,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: { languages: { ro: roUrl, en: enUrl } },
      },
      {
        url: enUrl,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: { languages: { ro: roUrl, en: enUrl } },
      },
    ];
  });

  return [...staticEntries, ...tournamentEntries];
}
