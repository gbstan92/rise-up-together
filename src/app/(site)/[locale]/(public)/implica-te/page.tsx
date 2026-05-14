import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Section } from "@/components/public/Section";
import { CmsBlocks } from "@/components/blocks/CmsBlocks";
import { FormVolunteer } from "@/components/public/forms/FormVolunteer";
import { FormSponsor } from "@/components/public/forms/FormSponsor";
import { FormNewsletter } from "@/components/public/forms/FormNewsletter";
import { getPageContent } from "@/server/pages";
import { staticAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = locale as "ro" | "en";
  const page = await getPageContent("GET_INVOLVED", l);
  return {
    title: page?.seoTitle ?? page?.title,
    description: page?.seoDesc ?? undefined,
    alternates: staticAlternates("getInvolved", l),
  };
}

export default async function GetInvolvedPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ newsletter?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("getInvolved");
  const tStatus = await getTranslations("newsletterStatus");
  const { newsletter } = await searchParams;
  const page = await getPageContent("GET_INVOLVED", locale as "ro" | "en");
  const title = page?.title ?? t("title");

  return (
    <>
      <Section eyebrow={t("title")} title={title} description={t("intro")}>
        {page && page.blocks.length > 0 && (
          <div className="mb-10">
            <CmsBlocks blocks={page.blocks} />
          </div>
        )}

        {newsletter === "confirmed" && (
          <p className="mb-6 rounded-md border bg-accent/50 px-4 py-3 text-sm text-accent-foreground">
            {tStatus("confirmed")}
          </p>
        )}
        {newsletter === "unsubscribed" && (
          <p className="mb-6 rounded-md border bg-muted px-4 py-3 text-sm">
            {tStatus("unsubscribed")}
          </p>
        )}
        {newsletter === "invalid" && (
          <p className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {tStatus("invalid")}
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader />
            <CardContent>
              <FormVolunteer />
            </CardContent>
          </Card>
          <Card>
            <CardHeader />
            <CardContent>
              <FormSponsor />
            </CardContent>
          </Card>
          <Card>
            <CardHeader />
            <CardContent>
              <FormNewsletter />
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section className="bg-accent/40" title={t("donateTitle")} description={t("donateBody")} />
    </>
  );
}
