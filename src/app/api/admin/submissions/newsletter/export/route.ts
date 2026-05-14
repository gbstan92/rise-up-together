import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { csvResponse, toCsv } from "@/lib/csv";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.newsletterSubscriber.findMany({
    where: { confirmed: true },
    orderBy: { createdAt: "desc" },
  });
  const csv = toCsv(
    ["createdAt", "email", "locale", "confirmedAt"],
    rows.map((r) => [
      r.createdAt.toISOString(),
      r.email,
      r.locale,
      r.confirmedAt ? r.confirmedAt.toISOString() : "",
    ]),
  );
  return csvResponse(`newsletter-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
