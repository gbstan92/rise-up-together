// Shared SEO helpers for public pages.
// Each static page knows its localized URL pair; tournaments compute theirs dynamically.

export type AltUrls = { ro: string; en: string };

const SITE = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const STATIC_ALTS: Record<string, AltUrls> = {
  home: { ro: "/ro", en: "/en" },
  whoWeAre: { ro: "/ro/cine-suntem", en: "/en/who-we-are" },
  whatWeDo: { ro: "/ro/ce-facem", en: "/en/what-we-do" },
  getInvolved: { ro: "/ro/implica-te", en: "/en/get-involved" },
  tournaments: { ro: "/ro/turnee", en: "/en/tournaments" },
  privacy: {
    ro: "/ro/politica-confidentialitate",
    en: "/en/privacy-policy",
  },
};

export function staticAlternates(key: keyof typeof STATIC_ALTS, locale: "ro" | "en") {
  const alts = STATIC_ALTS[key];
  return {
    canonical: `${SITE}${alts[locale]}`,
    languages: {
      ro: `${SITE}${alts.ro}`,
      en: `${SITE}${alts.en}`,
    },
  };
}

export function tournamentAlternates(
  locale: "ro" | "en",
  roSlug: string | null,
  enSlug: string | null,
) {
  const ro = roSlug ? `${SITE}/ro/turnee/${roSlug}` : undefined;
  const en = enSlug ? `${SITE}/en/tournaments/${enSlug}` : undefined;
  const canonical = locale === "en" ? en : ro;
  return {
    canonical,
    languages: { ro, en },
  };
}

export function defaultOg(title: string, description?: string | null) {
  return {
    title,
    description: description ?? undefined,
    siteName: "Rise Up Together",
    images: [`${SITE}/logo.jpg`],
    locale: undefined,
    type: "website" as const,
  };
}
