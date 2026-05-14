"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addVideo, removeVideo } from "@/server/tournaments";

type Video = {
  id: string;
  youtubeId: string;
  titleRo: string;
  titleEn: string;
  sortOrder: number;
};

function extractYoutubeId(input: string): string {
  const trimmed = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const m =
    trimmed.match(/[?&]v=([A-Za-z0-9_-]{11})/) ??
    trimmed.match(/youtu\.be\/([A-Za-z0-9_-]{11})/) ??
    trimmed.match(/embed\/([A-Za-z0-9_-]{11})/);
  return m?.[1] ?? trimmed;
}

export function VideosSection({
  tournamentId,
  initial,
}: {
  tournamentId: string;
  initial: Video[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [yt, setYt] = useState("");
  const [titleRo, setTitleRo] = useState("");
  const [titleEn, setTitleEn] = useState("");

  const add = () => {
    const id = extractYoutubeId(yt);
    if (!id) {
      toast.error("Enter a YouTube URL or ID");
      return;
    }
    startTransition(async () => {
      try {
        await addVideo(tournamentId, id, titleRo, titleEn);
        setYt("");
        setTitleRo("");
        setTitleEn("");
        router.refresh();
      } catch {
        toast.error("Add failed");
      }
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      try {
        await removeVideo(id, tournamentId);
        router.refresh();
      } catch {
        toast.error("Remove failed");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
        <Input
          placeholder="YouTube URL or video ID"
          value={yt}
          onChange={(e) => setYt(e.target.value)}
        />
        <Input
          placeholder="Title (RO, optional)"
          value={titleRo}
          onChange={(e) => setTitleRo(e.target.value)}
        />
        <Input
          placeholder="Title (EN, optional)"
          value={titleEn}
          onChange={(e) => setTitleEn(e.target.value)}
        />
        <Button onClick={add} disabled={pending}>
          Add
        </Button>
      </div>

      {initial.length > 0 && (
        <ul className="divide-y rounded-md border">
          {initial.map((v) => (
            <li key={v.id} className="flex items-center gap-3 px-4 py-2 text-sm">
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{v.youtubeId}</code>
              <span className="min-w-0 flex-1 truncate text-muted-foreground">
                {v.titleRo || v.titleEn || "—"}
              </span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remove"
                disabled={pending}
                onClick={() => remove(v.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
