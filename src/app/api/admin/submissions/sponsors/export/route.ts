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
  const rows = await prisma.sponsorInquiry.findMany({
    orderBy: { createdAt: "desc" },
  });
  const csv = toCsv(
    ["createdAt", "company", "contactName", "email", "phone", "tier", "message", "status"],
    rows.map((r) => [
      r.createdAt.toISOString(),
      r.company,
      r.contactName,
      r.email,
      r.phone,
      r.tier,
      r.message,
      r.status,
    ]),
  );
  return csvResponse(`sponsors-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
