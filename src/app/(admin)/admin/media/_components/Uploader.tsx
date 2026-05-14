"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function Uploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const form = new FormData();
    for (const file of Array.from(files)) form.append("files", file);

    const res = await fetch("/api/uploads", { method: "POST", body: form });
    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: "Upload failed" }));
      setError(msg);
      return;
    }
    if (inputRef.current) inputRef.current.value = "";
    startTransition(() => router.refresh());
  };

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => upload(e.target.files)}
          className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
        />
        <p className="text-xs text-muted-foreground">
          JPEG / PNG / WebP · max 5 MB · variants generated automatically
        </p>
        {pending && <span className="text-xs text-muted-foreground">Uploading…</span>}
      </div>
      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
