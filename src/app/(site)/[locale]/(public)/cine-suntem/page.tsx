import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Section } from "@/components/public/Section";
import { CmsBlocks } from "@/components/blocks/CmsBlocks";
import { getPageContent } from "@/server/pages";
import { prisma } from "@/lib/db";
import { Locale } from "@/generated/prisma/enums";
import { staticAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = locale as "ro" | "en";
  const page = await getPageContent("WHO_WE_ARE", l);
  return {
    title: page?.seoTitle ?? page?.title,
    description: page?.seoDesc ?? undefined,
    alternates: staticAlternates("whoWeAre", l),
  };
}

export default async function WhoWeArePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("whoWeAre");
  const l = locale as "ro" | "en";
  const want = l === "en" ? Locale.EN : Locale.RO;

  const [page, members] = await Promise.all([
    getPageContent("WHO_WE_ARE", l),
    prisma.teamMember.findMany({
      orderBy: { sortOrder: "asc" },
      include: { translations: true, photo: true },
    }),
  ]);

  const title = page?.title ?? t("title");
  const hasCms = (page?.blocks.length ?? 0) > 0;

  const values = [t("value1"), t("value2"), t("value3")];

  return (
    <>
      <Section eyebrow={t("title")} title={title} description={hasCms ? undefined : t("intro")}>
        {hasCms ? (
          <CmsBlocks blocks={page!.blocks} />
        ) : (
          <p className="max-w-3xl text-muted-foreground">{t("storyBody")}</p>
        )}
      </Section>

      <Section className="bg-muted/40" title={t("valuesTitle")}>
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((v) => (
            <Card key={v}>
              <CardHeader>
                <CardTitle>{v}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      {members.length > 0 && (
        <Section title={t("teamTitle")}>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {members.map((m) => {
              const tr =
                m.translations.find((x) => x.locale === want) ??
                m.translations.find((x) => x.locale === Locale.RO);
              if (!tr) return null;
              const variants = (m.photo?.variants ?? null) as
                | { md?: string; thumb?: string }
                | null;
              const photoKey = variants?.md ?? variants?.thumb ?? null;
              return (
                <div key={m.id} className="rounded-lg border bg-card p-5">
                  {photoKey && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={`/uploads/${photoKey}`}
                      alt={tr.name}
                      className="mb-4 aspect-square w-full rounded-md object-cover"
                    />
                  )}
                  <p className="font-display text-lg font-semibold">{tr.name}</p>
                  <p className="text-sm text-primary">{tr.role}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{tr.bio}</p>
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </>
  );
}
