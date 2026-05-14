"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Locale, PageKey, PublishStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/server/require-admin";
import { parseBlockPayload, type RichTextPayload } from "@/lib/blocks";

export type PageView = {
  key: PageKey;
  status: PublishStatus;
  title: string;
  seoTitle: string | null;
  seoDesc: string | null;
  blocks: Array<{ id: string; kind: "richText"; bodyHtml: string }>;
};

const PATHS_TO_REVALIDATE: Record<PageKey, string[]> = {
  HOME: ["/ro", "/en"],
  WHO_WE_ARE: ["/ro/cine-suntem", "/en/who-we-are"],
  WHAT_WE_DO: ["/ro/ce-facem", "/en/what-we-do"],
  GET_INVOLVED: ["/ro/implica-te", "/en/get-involved"],
  PRIVACY: ["/ro/politica-confidentialitate", "/en/privacy-policy"],
};

export async function getPageContent(
  key: PageKey,
  locale: "ro" | "en",
): Promise<PageView | null> {
  const page = await prisma.pageContent.findUnique({
    where: { key },
    include: {
      translations: true,
      blocks: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!page) return null;

  const want = locale === "en" ? Locale.EN : Locale.RO;
  const tr =
    page.translations.find((t) => t.locale === want) ??
    page.translations.find((t) => t.locale === Locale.RO);
  if (!tr) return null;

  const blocks = page.blocks
    .map((b) => {
      const payload = parseBlockPayload(b.kind, b.payload);
      if (!payload) return null;
      const body = locale === "en" ? payload.bodyEn || payload.bodyRo : payload.bodyRo;
      return { id: b.id, kind: "richText" as const, bodyHtml: body };
    })
    .filter((b): b is NonNullable<typeof b> => b !== null && b.bodyHtml.trim().length > 0);

  return {
    key: page.key,
    status: page.status,
    title: tr.title,
    seoTitle: tr.seoTitle,
    seoDesc: tr.seoDesc,
    blocks,
  };
}

export type AdminPageDetail = {
  key: PageKey;
  status: PublishStatus;
  ro: { title: string; seoTitle: string; seoDesc: string };
  en: { title: string; seoTitle: string; seoDesc: string };
  body: RichTextPayload;
};

export async function getAdminPage(key: PageKey): Promise<AdminPageDetail | null> {
  await requireAdmin();
  const page = await prisma.pageContent.findUnique({
    where: { key },
    include: { translations: true, blocks: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  if (!page) return null;
  const ro = page.translations.find((t) => t.locale === Locale.RO);
  const en = page.translations.find((t) => t.locale === Locale.EN);
  const firstBlock = page.blocks[0];
  const body = firstBlock ? parseBlockPayload(firstBlock.kind, firstBlock.payload) : null;

  return {
    key: page.key,
    status: page.status,
    ro: {
      title: ro?.title ?? "",
      seoTitle: ro?.seoTitle ?? "",
      seoDesc: ro?.seoDesc ?? "",
    },
    en: {
      title: en?.title ?? "",
      seoTitle: en?.seoTitle ?? "",
      seoDesc: en?.seoDesc ?? "",
    },
    body: body ?? { bodyRo: "", bodyEn: "" },
  };
}

const updateSchema = z.object({
  key: z.enum([
    "HOME",
    "WHO_WE_ARE",
    "WHAT_WE_DO",
    "GET_INVOLVED",
    "PRIVACY",
  ]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  ro: z.object({
    title: z.string().min(1).max(200),
    seoTitle: z.string().max(200).optional().default(""),
    seoDesc: z.string().max(400).optional().default(""),
  }),
  en: z.object({
    title: z.string().max(200).optional().default(""),
    seoTitle: z.string().max(200).optional().default(""),
    seoDesc: z.string().max(400).optional().default(""),
  }),
  body: z.object({
    bodyRo: z.string().max(20_000).default(""),
    bodyEn: z.string().max(20_000).default(""),
  }),
});

export async function savePage(input: z.input<typeof updateSchema>) {
  await requireAdmin();
  const parsed = updateSchema.parse(input);
  const key = parsed.key as PageKey;

  const page = await prisma.pageContent.findUnique({
    where: { key },
    include: { translations: true, blocks: true },
  });
  if (!page) throw new Error("Page not found");

  await prisma.pageContent.update({
    where: { key },
    data: { status: parsed.status as PublishStatus },
  });

  // Upsert RO + EN translations.
  await prisma.pageContentTranslation.upsert({
    where: { pageId_locale: { pageId: page.id, locale: Locale.RO } },
    create: {
      pageId: page.id,
      locale: Locale.RO,
      title: parsed.ro.title,
      seoTitle: parsed.ro.seoTitle || null,
      seoDesc: parsed.ro.seoDesc || null,
    },
    update: {
      title: parsed.ro.title,
      seoTitle: parsed.ro.seoTitle || null,
      seoDesc: parsed.ro.seoDesc || null,
    },
  });
  await prisma.pageContentTranslation.upsert({
    where: { pageId_locale: { pageId: page.id, locale: Locale.EN } },
    create: {
      pageId: page.id,
      locale: Locale.EN,
      title: parsed.en.title || parsed.ro.title,
      seoTitle: parsed.en.seoTitle || null,
      seoDesc: parsed.en.seoDesc || null,
    },
    update: {
      title: parsed.en.title || parsed.ro.title,
      seoTitle: parsed.en.seoTitle || null,
      seoDesc: parsed.en.seoDesc || null,
    },
  });

  // Single richText block (delete others, upsert first).
  await prisma.contentBlock.deleteMany({ where: { pageId: page.id } });
  await prisma.contentBlock.create({
    data: {
      pageId: page.id,
      kind: "richText",
      sortOrder: 0,
      payload: parsed.body,
    },
  });

  for (const path of PATHS_TO_REVALIDATE[key]) revalidatePath(path);
  revalidatePath("/admin/pages");
}

export async function listAdminPages() {
  await requireAdmin();
  const rows = await prisma.pageContent.findMany({
    include: { translations: true },
  });
  return rows.map((r) => {
    const ro = r.translations.find((t) => t.locale === Locale.RO);
    const en = r.translations.find((t) => t.locale === Locale.EN);
    return {
      key: r.key,
      status: r.status,
      titleRo: ro?.title ?? "",
      titleEn: en?.title ?? "",
      missingEn: !en || !en.title,
    };
  });
}
