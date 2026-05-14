"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "rut.cookieConsent";

export function CookieBanner() {
  const t = useTranslations("cookies");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-xl border bg-card p-4 shadow-lg md:flex md:items-center md:gap-4">
      <p className="text-sm text-muted-foreground md:flex-1">{t("message")}</p>
      <div className="mt-3 flex gap-2 md:mt-0">
        <Button size="sm" onClick={accept}>
          {t("accept")}
        </Button>
      </div>
    </div>
  );
}
