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
  const rows = await prisma.volunteerSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });
  const csv = toCsv(
    ["createdAt", "name", "email", "phone", "interests", "message", "status"],
    rows.map((r) => [
      r.createdAt.toISOString(),
      r.name,
      r.email,
      r.phone,
      r.interests,
      r.message,
      r.status,
    ]),
  );
  return csvResponse(`volunteers-${new Date().toISOString().slice(0, 10)}.csv`, csv);
}
