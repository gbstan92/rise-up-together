import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { processImage, UploadError } from "@/lib/uploads";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "No files" }, { status: 400 });
  }

  const created: Array<{
    id: string;
    variants: Record<string, string>;
    width: number;
    height: number;
  }> = [];

  try {
    for (const file of files) {
      const processed = await processImage(file);
      const asset = await prisma.mediaAsset.create({
        data: {
          storageKey: processed.storageKey,
          variants: processed.variants,
          width: processed.width,
          height: processed.height,
        },
      });
      created.push({
        id: asset.id,
        variants: processed.variants,
        width: asset.width,
        height: asset.height,
      });
    }
  } catch (err) {
    if (err instanceof UploadError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Upload failed", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ assets: created });
}
