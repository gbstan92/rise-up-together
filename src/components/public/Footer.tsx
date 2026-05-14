import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-lg text-foreground">{t("common.siteName")}</p>
            <p className="mt-1">{t("common.tagline")}</p>
          </div>
          <nav className="flex flex-wrap gap-4">
            <Link href="/cine-suntem" className="hover:text-foreground">{t("nav.whoWeAre")}</Link>
            <Link href="/ce-facem" className="hover:text-foreground">{t("nav.whatWeDo")}</Link>
            <Link href="/turnee" className="hover:text-foreground">{t("nav.tournaments")}</Link>
            <Link href="/implica-te" className="hover:text-foreground">{t("nav.getInvolved")}</Link>
            <Link href="/politica-confidentialitate" className="hover:text-foreground">
              {t("footer.privacy")}
            </Link>
          </nav>
        </div>
        <p className="mt-8 text-xs">
          © {year} {t("common.siteName")}. {t("footer.copyright")}
        </p>
      </div>
    </footer>
  );
}
