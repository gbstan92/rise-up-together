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
  const page = await getPageContent("PRIVACY", l);
  return {
    title: page?.seoTitle ?? page?.title,
    description: page?.seoDesc ?? undefined,
    alternates: staticAlternates("privacy", l),
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("footer");
  const page = await getPageContent("PRIVACY", locale as "ro" | "en");

  return (
    <Section title={page?.title ?? t("privacy")}>
      {page && page.blocks.length > 0 ? (
        <CmsBlocks blocks={page.blocks} />
      ) : (
        <p className="text-muted-foreground">—</p>
      )}
    </Section>
  );
}
