import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMail } from "@/server/email";
import { newsletterWelcome } from "@/server/emails/templates";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const site = process.env.SITE_URL ?? url.origin;

  if (!token) {
    return NextResponse.redirect(`${site}/ro/implica-te?newsletter=invalid`);
  }

  const sub = await prisma.newsletterSubscriber.findUnique({
    where: { confirmToken: token },
  });
  if (!sub) {
    return NextResponse.redirect(`${site}/ro/implica-te?newsletter=invalid`);
  }

  await prisma.newsletterSubscriber.update({
    where: { id: sub.id },
    data: {
      confirmed: true,
      confirmedAt: new Date(),
      confirmToken: null,
    },
  });

  const localePath = sub.locale === "EN" ? "en/get-involved" : "ro/implica-te";
  await sendMail({
    to: sub.email,
    ...newsletterWelcome({ unsubToken: sub.unsubToken }, sub.locale),
  });

  return NextResponse.redirect(`${site}/${localePath}?newsletter=confirmed`);
}
