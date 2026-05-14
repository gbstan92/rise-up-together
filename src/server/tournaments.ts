"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  Locale,
  PublishStatus,
  TournamentStatus,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/server/require-admin";
import { slugify } from "@/lib/slug";

const REVALIDATE_PATHS = [
  "/ro/turnee",
  "/en/tournaments",
];

function revalidateTournament(roSlug: string | null, enSlug: string | null) {
  for (const p of REVALIDATE_PATHS) revalidatePath(p);
  if (roSlug) revalidatePath(`/ro/turnee/${roSlug}`);
  if (enSlug) revalidatePath(`/en/tournaments/${enSlug}`);
}

// ---------- Queries ----------

export type PublicTournamentCard = {
  id: string;
  phase: TournamentStatus;
  startDate: Date;
  endDate: Date | null;
  venueName: string;
  title: string;
  slugLocale: string;
  summary: string;
  coverThumb: string | null;
  coverMd: string | null;
};

type CoverVariants = { thumb?: string; md?: string; lg?: string };

export async function listPublicTournaments(
  locale: "ro" | "en",
  phase: TournamentStatus,
): Promise<PublicTournamentCard[]> {
  const want = locale === "en" ? Locale.EN : Locale.RO;
  const rows = await prisma.tournament.findMany({
    where: { status: PublishStatus.PUBLISHED, phase },
    orderBy: { startDate: phase === TournamentStatus.UPCOMING ? "asc" : "desc" },
    include: { translations: true, cover: true },
  });

  return rows
    .map((r) => {
      const tr =
        r.translations.find((t) => t.locale === want) ??
        r.translations.find((t) => t.locale === Locale.RO);
      if (!tr) return null;
      const v = (r.cover?.variants ?? null) as CoverVariants | null;
      return {
        id: r.id,
        phase: r.phase,
        startDate: r.startDate,
        endDate: r.endDate,
        venueName: r.venueName,
        title: tr.title,
        slugLocale: tr.slugLocale,
        summary: tr.summary,
        coverThumb: v?.thumb ?? null,
        coverMd: v?.md ?? null,
      };
    })
    .filter((x): x is PublicTournamentCard => x !== null);
}

export type PublicTournamentDetail = {
  id: string;
  phase: TournamentStatus;
  startDate: Date;
  endDate: Date | null;
  venueName: string;
  venueAddress: string;
  registrationOpen: boolean;
  title: string;
  slugLocale: string;
  summary: string;
  descriptionHtml: string;
  seoTitle: string | null;
  seoDesc: string | null;
  coverLg: string | null;
  videos: Array<{ id: string; youtubeId: string; title: string | null }>;
  teams: Array<{ id: string; name: string; logoThumb: string | null }>;
  gallery: Array<{ id: string; thumb: string; md: string; lg: string; alt: string }>;
  results: Array<{
    id: string;
    round: string;
    home: string;
    away: string;
    homeScore: number;
    awayScore: number;
    playedAt: Date | null;
  }>;
  altSlug: { ro: string | null; en: string | null };
};

type DescPayload = { bodyRo?: string; bodyEn?: string };

export async function getPublicTournament(
  locale: "ro" | "en",
  slug: string,
): Promise<PublicTournamentDetail | null> {
  const want = locale === "en" ? Locale.EN : Locale.RO;
  const tr = await prisma.tournamentTranslation.findFirst({
    where: { slugLocale: slug, locale: want },
  });
  if (!tr) return null;

  const t = await prisma.tournament.findUnique({
    where: { id: tr.tournamentId },
    include: {
      translations: true,
      cover: true,
      videos: { orderBy: { sortOrder: "asc" } },
      teams: { orderBy: { sortOrder: "asc" }, include: { logo: true } },
      gallery: true,
      results: { orderBy: [{ playedAt: "asc" }, { round: "asc" }] },
    },
  });
  if (!t || t.status !== PublishStatus.PUBLISHED) return null;

  const localized =
    t.translations.find((x) => x.locale === want) ??
    t.translations.find((x) => x.locale === Locale.RO)!;

  const desc = localized.description as DescPayload;
  const descriptionHtml =
    (locale === "en" ? desc.bodyEn || desc.bodyRo : desc.bodyRo) ?? "";

  const teamsById = new Map(t.teams.map((tm) => [tm.id, tm.name]));

  const coverV = (t.cover?.variants ?? null) as CoverVariants | null;

  const ro = t.translations.find((x) => x.locale === Locale.RO);
  const en = t.translations.find((x) => x.locale === Locale.EN);

  return {
    id: t.id,
    phase: t.phase,
    startDate: t.startDate,
    endDate: t.endDate,
    venueName: t.venueName,
    venueAddress: t.venueAddress,
    registrationOpen: t.registrationOpen,
    title: localized.title,
    slugLocale: localized.slugLocale,
    summary: localized.summary,
    descriptionHtml,
    seoTitle: localized.seoTitle,
    seoDesc: localized.seoDesc,
    coverLg: coverV?.lg ?? coverV?.md ?? null,
    videos: t.videos.map((v) => ({
      id: v.id,
      youtubeId: v.youtubeId,
      title: locale === "en" ? v.titleEn || v.titleRo : v.titleRo,
    })),
    teams: t.teams.map((tm) => {
      const lv = (tm.logo?.variants ?? null) as CoverVariants | null;
      return { id: tm.id, name: tm.name, logoThumb: lv?.thumb ?? null };
    }),
    gallery: t.gallery.map((g) => {
      const v = (g.variants ?? null) as CoverVariants | null;
      return {
        id: g.id,
        thumb: v?.thumb ?? v?.md ?? "",
        md: v?.md ?? v?.thumb ?? "",
        lg: v?.lg ?? v?.md ?? "",
        alt: (locale === "en" ? g.altEn || g.altRo : g.altRo) ?? "",
      };
    }),
    results: t.results.map((r) => ({
      id: r.id,
      round: r.round,
      home: teamsById.get(r.homeTeamId) ?? "?",
      away: teamsById.get(r.awayTeamId) ?? "?",
      homeScore: r.homeScore,
      awayScore: r.awayScore,
      playedAt: r.playedAt,
    })),
    altSlug: {
      ro: ro?.slugLocale ?? null,
      en: en?.slugLocale ?? null,
    },
  };
}

// ---------- Admin queries ----------

export async function listAdminTournaments() {
  await requireAdmin();
  const rows = await prisma.tournament.findMany({
    orderBy: { startDate: "desc" },
    include: { translations: true },
  });
  return rows.map((t) => {
    const ro = t.translations.find((x) => x.locale === Locale.RO);
    const en = t.translations.find((x) => x.locale === Locale.EN);
    return {
      id: t.id,
      status: t.status,
      phase: t.phase,
      startDate: t.startDate,
      titleRo: ro?.title ?? "(untitled)",
      titleEn: en?.title ?? "",
      missingEn: !en || !en.title,
      registrationOpen: t.registrationOpen,
    };
  });
}

export async function getAdminTournament(id: string) {
  await requireAdmin();
  const t = await prisma.tournament.findUnique({
    where: { id },
    include: {
      translations: true,
      videos: { orderBy: { sortOrder: "asc" } },
      teams: { orderBy: { sortOrder: "asc" } },
      gallery: true,
      results: { orderBy: [{ round: "asc" }] },
    },
  });
  if (!t) return null;
  const ro = t.translations.find((x) => x.locale === Locale.RO);
  const en = t.translations.find((x) => x.locale === Locale.EN);
  const desc = (ro?.description ?? en?.description ?? {}) as DescPayload;
  return {
    id: t.id,
    status: t.status,
    phase: t.phase,
    startDate: t.startDate,
    endDate: t.endDate,
    venueName: t.venueName,
    venueAddress: t.venueAddress,
    registrationOpen: t.registrationOpen,
    coverId: t.coverId,
    galleryIds: t.gallery.map((g) => g.id),
    ro: {
      title: ro?.title ?? "",
      slugLocale: ro?.slugLocale ?? "",
      summary: ro?.summary ?? "",
      seoTitle: ro?.seoTitle ?? "",
      seoDesc: ro?.seoDesc ?? "",
    },
    en: {
      title: en?.title ?? "",
      slugLocale: en?.slugLocale ?? "",
      summary: en?.summary ?? "",
      seoTitle: en?.seoTitle ?? "",
      seoDesc: en?.seoDesc ?? "",
    },
    body: {
      bodyRo: desc.bodyRo ?? "",
      bodyEn: desc.bodyEn ?? "",
    },
    videos: t.videos.map((v) => ({
      id: v.id,
      youtubeId: v.youtubeId,
      titleRo: v.titleRo ?? "",
      titleEn: v.titleEn ?? "",
      sortOrder: v.sortOrder,
    })),
    teams: t.teams.map((tm) => ({
      id: tm.id,
      name: tm.name,
      logoId: tm.logoId,
      sortOrder: tm.sortOrder,
    })),
    results: t.results.map((r) => ({
      id: r.id,
      round: r.round,
      homeTeamId: r.homeTeamId,
      awayTeamId: r.awayTeamId,
      homeScore: r.homeScore,
      awayScore: r.awayScore,
      playedAt: r.playedAt,
    })),
  };
}

// ---------- Mutations ----------

const upsertSchema = z.object({
  id: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  phase: z.enum(["UPCOMING", "PAST"]),
  startDate: z.coerce.date(),
  endDate: z.union([z.coerce.date(), z.null()]).optional(),
  venueName: z.string().min(1).max(160),
  venueAddress: z.string().min(1).max(400),
  registrationOpen: z.boolean().default(false),
  coverId: z.string().nullable().optional(),
  ro: z.object({
    title: z.string().min(1).max(200),
    slugLocale: z.string().max(80).optional().default(""),
    summary: z.string().max(500).default(""),
    seoTitle: z.string().max(200).optional().default(""),
    seoDesc: z.string().max(400).optional().default(""),
  }),
  en: z.object({
    title: z.string().max(200).optional().default(""),
    slugLocale: z.string().max(80).optional().default(""),
    summary: z.string().max(500).default(""),
    seoTitle: z.string().max(200).optional().default(""),
    seoDesc: z.string().max(400).optional().default(""),
  }),
  body: z.object({
    bodyRo: z.string().max(20_000).default(""),
    bodyEn: z.string().max(20_000).default(""),
  }),
});

export type TournamentInput = z.input<typeof upsertSchema>;

async function ensureUniqueSlug(
  base: string,
  locale: Locale,
  excludeTournamentId?: string,
): Promise<string> {
  let candidate = base || "turneu";
  let i = 1;
  while (true) {
    const clash = await prisma.tournamentTranslation.findFirst({
      where: {
        locale,
        slugLocale: candidate,
        ...(excludeTournamentId ? { tournamentId: { not: excludeTournamentId } } : {}),
      },
      select: { id: true },
    });
    if (!clash) return candidate;
    i += 1;
    candidate = `${base}-${i}`;
  }
}

export async function upsertTournament(input: TournamentInput): Promise<{ id: string }> {
  await requireAdmin();
  const data = upsertSchema.parse(input);

  const roSlugBase = data.ro.slugLocale.trim() || slugify(data.ro.title);
  const enSlugBase =
    data.en.slugLocale.trim() ||
    (data.en.title ? slugify(data.en.title) : roSlugBase);

  const tournamentId = data.id;

  let id: string;
  if (tournamentId) {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        status: data.status as PublishStatus,
        phase: data.phase as TournamentStatus,
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        registrationOpen: data.registrationOpen,
        coverId: data.coverId ?? null,
      },
    });
    id = tournamentId;
  } else {
    const created = await prisma.tournament.create({
      data: {
        status: data.status as PublishStatus,
        phase: data.phase as TournamentStatus,
        startDate: data.startDate,
        endDate: data.endDate ?? null,
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        registrationOpen: data.registrationOpen,
        coverId: data.coverId ?? null,
      },
    });
    id = created.id;
  }

  const roSlug = await ensureUniqueSlug(roSlugBase, Locale.RO, id);
  const enSlug = await ensureUniqueSlug(enSlugBase, Locale.EN, id);

  await prisma.tournamentTranslation.upsert({
    where: { tournamentId_locale: { tournamentId: id, locale: Locale.RO } },
    create: {
      tournamentId: id,
      locale: Locale.RO,
      title: data.ro.title,
      slugLocale: roSlug,
      summary: data.ro.summary,
      description: { bodyRo: data.body.bodyRo, bodyEn: data.body.bodyEn },
      seoTitle: data.ro.seoTitle || null,
      seoDesc: data.ro.seoDesc || null,
    },
    update: {
      title: data.ro.title,
      slugLocale: roSlug,
      summary: data.ro.summary,
      description: { bodyRo: data.body.bodyRo, bodyEn: data.body.bodyEn },
      seoTitle: data.ro.seoTitle || null,
      seoDesc: data.ro.seoDesc || null,
    },
  });

  await prisma.tournamentTranslation.upsert({
    where: { tournamentId_locale: { tournamentId: id, locale: Locale.EN } },
    create: {
      tournamentId: id,
      locale: Locale.EN,
      title: data.en.title || data.ro.title,
      slugLocale: enSlug,
      summary: data.en.summary || data.ro.summary,
      description: { bodyRo: data.body.bodyRo, bodyEn: data.body.bodyEn },
      seoTitle: data.en.seoTitle || null,
      seoDesc: data.en.seoDesc || null,
    },
    update: {
      title: data.en.title || data.ro.title,
      slugLocale: enSlug,
      summary: data.en.summary || data.ro.summary,
      description: { bodyRo: data.body.bodyRo, bodyEn: data.body.bodyEn },
      seoTitle: data.en.seoTitle || null,
      seoDesc: data.en.seoDesc || null,
    },
  });

  revalidateTournament(roSlug, enSlug);
  revalidatePath("/admin/tournaments");
  return { id };
}

export async function deleteTournament(id: string) {
  await requireAdmin();
  const t = await prisma.tournament.findUnique({
    where: { id },
    include: { translations: true },
  });
  await prisma.tournament.delete({ where: { id } });
  const ro = t?.translations.find((x) => x.locale === Locale.RO)?.slugLocale ?? null;
  const en = t?.translations.find((x) => x.locale === Locale.EN)?.slugLocale ?? null;
  revalidateTournament(ro, en);
  revalidatePath("/admin/tournaments");
}

// ----- Gallery -----

export async function setGallery(tournamentId: string, mediaIds: string[]) {
  await requireAdmin();
  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { gallery: { set: mediaIds.map((id) => ({ id })) } },
  });
  revalidatePath(`/admin/tournaments/${tournamentId}`);
}

// ----- Videos -----

export async function addVideo(
  tournamentId: string,
  youtubeId: string,
  titleRo: string,
  titleEn: string,
) {
  await requireAdmin();
  const count = await prisma.videoEmbed.count({ where: { tournamentId } });
  await prisma.videoEmbed.create({
    data: {
      tournamentId,
      youtubeId: youtubeId.trim(),
      titleRo: titleRo || null,
      titleEn: titleEn || null,
      sortOrder: count,
    },
  });
  revalidatePath(`/admin/tournaments/${tournamentId}`);
}

export async function removeVideo(id: string, tournamentId: string) {
  await requireAdmin();
  await prisma.videoEmbed.delete({ where: { id } });
  revalidatePath(`/admin/tournaments/${tournamentId}`);
}

// ----- Teams -----

export async function addTeam(tournamentId: string, name: string, logoId: string | null) {
  await requireAdmin();
  const count = await prisma.tournamentTeam.count({ where: { tournamentId } });
  await prisma.tournamentTeam.create({
    data: { tournamentId, name, logoId, sortOrder: count },
  });
  revalidatePath(`/admin/tournaments/${tournamentId}`);
}

export async function removeTeam(id: string, tournamentId: string) {
  await requireAdmin();
  await prisma.tournamentTeam.delete({ where: { id } });
  revalidatePath(`/admin/tournaments/${tournamentId}`);
}

// ----- Results -----

export async function addResult(
  tournamentId: string,
  round: string,
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number,
  playedAt: Date | null,
) {
  await requireAdmin();
  await prisma.matchResult.create({
    data: {
      tournamentId,
      round,
      homeTeamId,
      awayTeamId,
      homeScore,
      awayScore,
      playedAt,
    },
  });
  revalidatePath(`/admin/tournaments/${tournamentId}`);
}

export async function removeResult(id: string, tournamentId: string) {
  await requireAdmin();
  await prisma.matchResult.delete({ where: { id } });
  revalidatePath(`/admin/tournaments/${tournamentId}`);
}
