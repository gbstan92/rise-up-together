"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Item = { id: string; thumb: string };

export function GallerySection({
  ids,
  onChange,
}: {
  ids: string[];
  onChange: (ids: string[]) => void;
}) {
  const [items, setItems] = useState<Item[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/uploads/list")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setItems(d.items as Item[]);
      })
      .catch(() => !cancelled && setItems([]));
    return () => {
      cancelled = true;
    };
  }, []);

  if (items === null) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (items.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        No images uploaded yet — head to the Media page first.
      </p>
    );

  const toggle = (id: string) => {
    onChange(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
  };

  return (
    <>
      <p className="mb-2 text-xs text-muted-foreground">{ids.length} selected</p>
      <div className="grid max-h-72 grid-cols-4 gap-2 overflow-y-auto rounded-md border p-2 sm:grid-cols-6 md:grid-cols-8">
        {items.map((m) => {
          const active = ids.includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => toggle(m.id)}
              className={
                "relative aspect-square overflow-hidden rounded-md border " +
                (active ? "ring-2 ring-primary" : "hover:opacity-90")
              }
            >
              <Image
                src={`/uploads/${m.thumb}`}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>
    </>
  );
}
