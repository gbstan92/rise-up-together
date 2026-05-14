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
import {
  teamRegistrationSchema,
  type TeamRegistrationInput,
} from "@/lib/zod-schemas";
import { useFormSubmit } from "./useFormSubmit";

export function FormTeamRegistration({ tournamentId }: { tournamentId: string }) {
  const locale = useLocale() as "ro" | "en";
  const t = useTranslations("forms");
  const tReg = useTranslations("teamRegistration");
  const [token, setToken] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamRegistrationInput>({
    resolver: zodResolver(teamRegistrationSchema),
    defaultValues: { tournamentId, locale, hcaptchaToken: "", playerCount: 1 },
  });

  const { submit, pending } = useFormSubmit<TeamRegistrationInput>(
    "/api/forms/team-registration",
    {
      success: tReg("success"),
      errorGeneric: t("errorGeneric"),
      errorCaptcha: t("errorCaptcha"),
      errorRateLimited: t("errorRateLimited"),
    },
  );

  return (
    <form
      className="space-y-3 rounded-lg border bg-card p-6"
      onSubmit={handleSubmit(async (data) => {
        const ok = await submit({
          ...data,
          tournamentId,
          hcaptchaToken: token,
          locale,
        });
        if (ok) {
          reset({ tournamentId, locale, hcaptchaToken: "", playerCount: 1 });
          setToken("");
        }
      })}
    >
      <h3 className="font-display text-lg font-semibold">{tReg("title")}</h3>
      <p className="text-sm text-muted-foreground">{tReg("intro")}</p>
      <div className="space-y-1.5">
        <Label htmlFor="tr-team">{tReg("teamName")}</Label>
        <Input id="tr-team" {...register("teamName")} aria-invalid={!!errors.teamName} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tr-captain">{tReg("captainName")}</Label>
        <Input id="tr-captain" {...register("captainName")} aria-invalid={!!errors.captainName} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tr-email">{t("email")}</Label>
        <Input id="tr-email" type="email" {...register("captainEmail")} aria-invalid={!!errors.captainEmail} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tr-phone">{t("phone")}</Label>
        <Input id="tr-phone" {...register("captainPhone")} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tr-count">{tReg("playerCount")}</Label>
        <Input id="tr-count" type="number" min={1} max={50} {...register("playerCount", { valueAsNumber: true })} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tr-notes">{t("message")}</Label>
        <Textarea id="tr-notes" {...register("notes")} />
      </div>
      <HCaptcha onVerify={setToken} onExpire={() => setToken("")} />
      <Button type="submit" disabled={pending}>
        {pending ? t("sending") : t("submit")}
      </Button>
    </form>
  );
}
