"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type MediaItem = {
  id: string;
  thumb: string;
  altRo: string | null;
};

export function MediaPicker({
  selectedId,
  onChange,
}: {
  selectedId: string | null;
  onChange: (id: string | null) => void;
}) {
  const [items, setItems] = useState<MediaItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/uploads/list")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setItems(data.items as MediaItem[]);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (items === null) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No images uploaded yet — visit the Media page to upload some.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto rounded-md border p-2 sm:grid-cols-6">
        {items.map((m) => {
          const active = m.id === selectedId;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(active ? null : m.id)}
              className={
                "relative aspect-square overflow-hidden rounded-md border " +
                (active ? "ring-2 ring-primary" : "hover:opacity-90")
              }
            >
              <Image
                src={`/uploads/${m.thumb}`}
                alt={m.altRo ?? ""}
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>
      {selectedId && (
        <button
          type="button"
          className="text-xs text-muted-foreground underline"
          onClick={() => onChange(null)}
        >
          Clear selection
        </button>
      )}
    </div>
  );
}
