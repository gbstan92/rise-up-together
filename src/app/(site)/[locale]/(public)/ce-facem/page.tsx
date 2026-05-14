import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Section } from "@/components/public/Section";
import { CmsBlocks } from "@/components/blocks/CmsBlocks";
import { getPageContent } from "@/server/pages";
import { staticAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = locale as "ro" | "en";
  const page = await getPageContent("WHAT_WE_DO", l);
  return {
    title: page?.seoTitle ?? page?.title,
    description: page?.seoDesc ?? undefined,
    alternates: staticAlternates("whatWeDo", l),
  };
}

export default async function WhatWeDoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("whatWeDo");
  const page = await getPageContent("WHAT_WE_DO", locale as "ro" | "en");
  const title = page?.title ?? t("title");
  const hasCms = (page?.blocks.length ?? 0) > 0;

  return (
    <Section eyebrow={t("title")} title={title} description={hasCms ? undefined : t("intro")}>
      {hasCms ? <CmsBlocks blocks={page!.blocks} /> : <p className="text-muted-foreground">—</p>}
    </Section>
  );
}
