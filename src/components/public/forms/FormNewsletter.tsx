"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HCaptcha } from "@/components/public/HCaptcha";
import { newsletterSchema, type NewsletterInput } from "@/lib/zod-schemas";
import { useFormSubmit } from "./useFormSubmit";

export function FormNewsletter() {
  const locale = useLocale() as "ro" | "en";
  const t = useTranslations("forms");
  const tGen = useTranslations("getInvolved");
  const [token, setToken] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { locale, hcaptchaToken: "" },
  });

  const { submit, pending } = useFormSubmit<NewsletterInput>(
    "/api/forms/newsletter",
    {
      success: t("newsletter.success"),
      errorGeneric: t("errorGeneric"),
      errorCaptcha: t("errorCaptcha"),
      errorRateLimited: t("errorRateLimited"),
    },
  );

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit(async (data) => {
        const ok = await submit({ ...data, hcaptchaToken: token, locale });
        if (ok) {
          reset();
          setToken("");
        }
      })}
    >
      <h3 className="font-display text-lg font-semibold">{tGen("newsletter")}</h3>
      <div className="space-y-1.5">
        <Label htmlFor="n-email">{t("email")}</Label>
        <Input id="n-email" type="email" {...register("email")} aria-invalid={!!errors.email} />
      </div>
      <HCaptcha onVerify={setToken} onExpire={() => setToken("")} />
      <Button type="submit" disabled={pending}>
        {pending ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
