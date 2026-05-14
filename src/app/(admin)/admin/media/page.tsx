import { prisma } from "@/lib/db";
import { requireAdmin } from "@/server/require-admin";
import { MediaList } from "./_components/MediaList";
import { Uploader } from "./_components/Uploader";

export const dynamic = "force-dynamic";

type MediaVariants = { orig?: string; thumb?: string; md?: string; lg?: string };

export default async function MediaPage() {
  await requireAdmin();

  const items = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="p-8 space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Media</h1>
        <p className="text-sm text-muted-foreground">
          Uploaded images. Showing the latest 200.
        </p>
      </header>

      <Uploader />

      <MediaList
        items={items.map((m) => {
          const v = m.variants as MediaVariants;
          return {
            id: m.id,
            thumb: v.thumb ?? v.md ?? v.orig ?? "",
            width: m.width,
            height: m.height,
            altRo: m.altRo,
            altEn: m.altEn,
          };
        })}
      />
    </div>
  );
}
