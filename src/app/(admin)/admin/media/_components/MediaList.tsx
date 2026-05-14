"use client";

import Image from "next/image";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteMedia } from "@/server/media";

type Item = {
  id: string;
  thumb: string;
  width: number;
  height: number;
  altRo: string | null;
  altEn: string | null;
};

export function MediaList({ items }: { items: Item[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <p className="rounded-md border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        No images yet. Upload some above.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((m) => (
        <div key={m.id} className="group rounded-lg border bg-card p-2">
          <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
            {m.thumb && (
              <Image
                src={`/uploads/${m.thumb}`}
                alt={m.altRo ?? ""}
                fill
                sizes="(min-width: 1024px) 18vw, 40vw"
                className="object-cover"
              />
            )}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {m.width}×{m.height}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={pending}
              aria-label="Delete"
              onClick={() => {
                if (!confirm("Delete this image?")) return;
                startTransition(async () => {
                  await deleteMedia(m.id);
                  router.refresh();
                });
              }}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
