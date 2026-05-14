import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

type MediaVariants = { orig?: string; thumb?: string; md?: string; lg?: string };

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    items: rows.map((m) => {
      const v = m.variants as MediaVariants;
      return {
        id: m.id,
        thumb: v.thumb ?? v.md ?? v.orig ?? "",
        altRo: m.altRo,
        altEn: m.altEn,
      };
    }),
  });
}
