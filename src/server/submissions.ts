"use server";

import { revalidatePath } from "next/cache";
import { Locale, RegistrationStatus, SubmissionStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { sendMail } from "@/server/email";
import { teamRegistrationDecision } from "@/server/emails/templates";
import { requireAdmin } from "@/server/require-admin";

type SubmissionTable = "volunteer" | "sponsor";

export async function setSubmissionStatus(
  table: SubmissionTable,
  id: string,
  status: SubmissionStatus,
) {
  await requireAdmin();
  if (table === "volunteer") {
    await prisma.volunteerSubmission.update({ where: { id }, data: { status } });
    revalidatePath("/admin/submissions/volunteers");
  } else {
    await prisma.sponsorInquiry.update({ where: { id }, data: { status } });
    revalidatePath("/admin/submissions/sponsors");
  }
}

export async function deleteNewsletterSubscriber(id: string) {
  await requireAdmin();
  await prisma.newsletterSubscriber.delete({ where: { id } });
  revalidatePath("/admin/submissions/newsletter");
}

export async function decideRegistration(
  id: string,
  decision: "APPROVED" | "REJECTED",
  note?: string,
) {
  await requireAdmin();

  const reg = await prisma.teamRegistration.findUnique({
    where: { id },
    include: {
      tournament: { include: { translations: true } },
    },
  });
  if (!reg) throw new Error("Registration not found");

  if (decision === "APPROVED") {
    const count = await prisma.tournamentTeam.count({
      where: { tournamentId: reg.tournamentId },
    });
    await prisma.tournamentTeam.create({
      data: {
        tournamentId: reg.tournamentId,
        name: reg.teamName,
        sortOrder: count,
      },
    });
  }

  await prisma.teamRegistration.update({
    where: { id },
    data: {
      status:
        decision === "APPROVED" ? RegistrationStatus.APPROVED : RegistrationStatus.REJECTED,
      decidedAt: new Date(),
    },
  });

  const captainLocale =
    reg.tournament.translations.find((t) => t.locale === Locale.EN)?.title &&
    reg.captainEmail.endsWith(".uk")
      ? "en"
      : "ro";
  const tr =
    reg.tournament.translations.find((t) => t.locale === Locale.RO) ??
    reg.tournament.translations[0];

  const tpl = teamRegistrationDecision(
    {
      teamName: reg.teamName,
      tournamentTitle: tr?.title ?? "",
      approved: decision === "APPROVED",
      note,
    },
    captainLocale,
  );
  await sendMail({ to: reg.captainEmail, ...tpl });

  revalidatePath("/admin/submissions/registrations");
  revalidatePath(`/admin/tournaments/${reg.tournamentId}`);
}
