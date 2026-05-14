"use server";

import { revalidatePath } from "next/cache";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/server/require-admin";

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? "./.uploads");

export async function deleteMedia(id: string) {
  await requireAdmin();
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return;

  const variants = asset.variants as Record<string, string>;
  await Promise.all(
    Object.values(variants).map(async (key) => {
      try {
        await unlink(path.join(UPLOAD_DIR, key));
      } catch {
        // file may already be gone; not fatal
      }
    }),
  );

  await prisma.mediaAsset.delete({ where: { id } });
  revalidatePath("/admin/media");
}

export async function updateMediaAlt(id: string, altRo: string, altEn: string) {
  await requireAdmin();
  await prisma.mediaAsset.update({
    where: { id },
    data: { altRo: altRo || null, altEn: altEn || null },
  });
  revalidatePath("/admin/media");
}
