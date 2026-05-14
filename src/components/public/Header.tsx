import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { LocaleSwitch } from "./LocaleSwitch";

const NAV = [
  { href: "/cine-suntem", key: "whoWeAre" as const },
  { href: "/ce-facem", key: "whatWeDo" as const },
  { href: "/turnee", key: "tournaments" as const },
  { href: "/implica-te", key: "getInvolved" as const },
] as const;

export async function Header() {
  const t = await getTranslations();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold">
          <Image
            src="/logo.jpg"
            alt={t("common.siteName")}
            width={36}
            height={36}
            className="rounded-full"
            priority
          />
          <span>{t("common.siteName")}</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-5 text-sm md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-foreground/75 hover:text-foreground"
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </nav>
        <div className="ml-auto md:ml-0">
          <LocaleSwitch />
        </div>
      </div>
    </header>
  );
}
