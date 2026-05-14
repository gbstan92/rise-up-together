"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HCaptcha } from "@/components/public/HCaptcha";
import { sponsorSchema, type SponsorInput } from "@/lib/zod-schemas";
import { useFormSubmit } from "./useFormSubmit";

export function FormSponsor() {
  const locale = useLocale() as "ro" | "en";
  const t = useTranslations("forms");
  const tGen = useTranslations("getInvolved");
  const [token, setToken] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SponsorInput>({
    resolver: zodResolver(sponsorSchema),
    defaultValues: { locale, hcaptchaToken: "" },
  });

  const { submit, pending } = useFormSubmit<SponsorInput>(
    "/api/forms/sponsor",
    {
      success: t("sponsor.success"),
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
      <h3 className="font-display text-lg font-semibold">{tGen("sponsor")}</h3>
      <div className="space-y-1.5">
        <Label htmlFor="s-company">{t("company")}</Label>
        <Input id="s-company" {...register("company")} aria-invalid={!!errors.company} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="s-name">{t("contactName")}</Label>
        <Input id="s-name" {...register("contactName")} aria-invalid={!!errors.contactName} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="s-email">{t("email")}</Label>
        <Input id="s-email" type="email" {...register("email")} aria-invalid={!!errors.email} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="s-phone">{t("phone")}</Label>
        <Input id="s-phone" {...register("phone")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="s-tier">{t("tier")}</Label>
        <Input id="s-tier" {...register("tier")} placeholder="bronze / silver / gold / custom" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="s-message">{t("message")}</Label>
        <Textarea id="s-message" {...register("message")} aria-invalid={!!errors.message} />
      </div>
      <HCaptcha onVerify={setToken} onExpire={() => setToken("")} />
      <Button type="submit" disabled={pending}>
        {pending ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
