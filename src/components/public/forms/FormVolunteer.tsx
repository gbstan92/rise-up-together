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
import { volunteerSchema, type VolunteerInput } from "@/lib/zod-schemas";
import { useFormSubmit } from "./useFormSubmit";

export function FormVolunteer() {
  const locale = useLocale() as "ro" | "en";
  const t = useTranslations("forms");
  const tGen = useTranslations("getInvolved");
  const [token, setToken] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VolunteerInput>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: { locale, hcaptchaToken: "" },
  });

  const { submit, pending } = useFormSubmit<VolunteerInput>(
    "/api/forms/volunteer",
    {
      success: t("volunteer.success"),
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
      <h3 className="font-display text-lg font-semibold">{tGen("volunteer")}</h3>
      <div className="space-y-1.5">
        <Label htmlFor="v-name">{t("name")}</Label>
        <Input id="v-name" {...register("name")} aria-invalid={!!errors.name} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="v-email">{t("email")}</Label>
        <Input id="v-email" type="email" {...register("email")} aria-invalid={!!errors.email} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="v-phone">{t("phone")}</Label>
        <Input id="v-phone" {...register("phone")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="v-interests">{t("interests")}</Label>
        <Textarea id="v-interests" {...register("interests")} aria-invalid={!!errors.interests} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="v-message">{t("message")}</Label>
        <Textarea id="v-message" {...register("message")} />
      </div>
      <HCaptcha onVerify={setToken} onExpire={() => setToken("")} />
      <Button type="submit" disabled={pending}>
        {pending ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
