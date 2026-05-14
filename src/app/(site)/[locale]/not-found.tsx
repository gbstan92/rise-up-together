import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/public/Container";

export default async function NotFound() {
  const t = await getTranslations();
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm uppercase tracking-[0.18em] text-primary">404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold">
        {t("errors.notFound")}
      </h1>
      <Button asChild className="mt-8">
        <Link href="/">{t("nav.home")}</Link>
      </Button>
    </Container>
  );
}
