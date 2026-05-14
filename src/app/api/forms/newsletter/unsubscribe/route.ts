import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const site = process.env.SITE_URL ?? url.origin;

  if (!token) {
    return NextResponse.redirect(`${site}/ro/implica-te?newsletter=invalid`);
  }

  const sub = await prisma.newsletterSubscriber.findUnique({
    where: { unsubToken: token },
  });
  if (!sub) {
    return NextResponse.redirect(`${site}/ro/implica-te?newsletter=invalid`);
  }

  await prisma.newsletterSubscriber.delete({ where: { id: sub.id } });

  const localePath = sub.locale === "EN" ? "en/get-involved" : "ro/implica-te";
  return NextResponse.redirect(`${site}/${localePath}?newsletter=unsubscribed`);
}
