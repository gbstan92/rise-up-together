import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Hero } from "@/components/public/Hero";
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
  const page = await getPageContent("HOME", l);
  return {
    title: page?.seoTitle,
    description: page?.seoDesc ?? undefined,
    alternates: staticAlternates("home", l),
    openGraph: {
      title: page?.seoTitle ?? "Rise Up Together",
      description: page?.seoDesc ?? undefined,
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const page = await getPageContent("HOME", locale as "ro" | "en");

  const pillars = [
    { title: t("pillar1Title"), body: t("pillar1Body") },
    { title: t("pillar2Title"), body: t("pillar2Body") },
    { title: t("pillar3Title"), body: t("pillar3Body") },
  ];

  return (
    <>
      <Hero
        eyebrow={t("heroEyebrow")}
        title={page?.title ?? t("heroTitle")}
        subtitle={t("heroSubtitle")}
      >
        <Button asChild size="lg">
          <Link href="/implica-te">{t("ctaInvolved")}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/turnee">{t("ctaTournaments")}</Link>
        </Button>
      </Hero>

      {page && page.blocks.length > 0 && (
        <Section>
          <CmsBlocks blocks={page.blocks} />
        </Section>
      )}

      <Section
        eyebrow={t("pillarsTitle")}
        title={t("missionTitle")}
        description={t("missionDescription")}
      >
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((p) => (
            <Card key={p.title}>
              <CardHeader>
                <CardTitle>{p.title}</CardTitle>
                <CardDescription>{p.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="bg-accent/40">
        <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
          <h2 className="font-display text-3xl font-semibold">
            {t("ctaJoinTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            {t("ctaJoinBody")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/implica-te">{t("ctaInvolved")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/turnee">{t("ctaTournaments")}</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
