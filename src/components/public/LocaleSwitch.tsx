"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";

export function LocaleSwitch() {
  const pathname = usePathname();
  const router = useRouter();
  const current = useLocale();

  return (
    <div className="flex gap-1 text-xs">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname as never, { locale: l })}
          className={
            "rounded-full px-2.5 py-1 uppercase tracking-wide " +
            (l === current
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted")
          }
        >
          {l}
        </button>
      ))}
    </div>
  );
}
