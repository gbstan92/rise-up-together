"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MissingBadge } from "@/components/admin/MissingBadge";
import { TeamMemberForm } from "./TeamMemberForm";
import { deleteTeamMember } from "@/server/team-members";

type Item = {
  id: string;
  sortOrder: number;
  photoId: string | null;
  photoThumb: string | null;
  ro: { name: string; role: string; bio: string };
  en: { name: string; role: string; bio: string };
  missingEn: boolean;
};

export function TeamList({ items }: { items: Item[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (items.length === 0) {
    return (
      <p className="rounded-md border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        No team members yet.
      </p>
    );
  }

  const remove = (id: string) => {
    if (!confirm("Remove this team member?")) return;
    startTransition(async () => {
      try {
        await deleteTeamMember(id);
        toast.success("Removed");
        router.refresh();
      } catch {
        toast.error("Remove failed");
      }
    });
  };

  return (
    <ul className="space-y-3">
      {items.map((m) => (
        <li key={m.id} className="rounded-lg border bg-card">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
              {m.photoThumb && (
                <Image
                  src={`/uploads/${m.photoThumb}`}
                  alt={m.ro.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {m.ro.name}{" "}
                {m.missingEn && <MissingBadge />}
              </p>
              <p className="truncate text-xs text-muted-foreground">{m.ro.role}</p>
            </div>
            <span className="text-xs text-muted-foreground">#{m.sortOrder}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Edit"
              onClick={() => setEditingId(editingId === m.id ? null : m.id)}
            >
              {editingId === m.id ? <X className="size-3.5" /> : <Pencil className="size-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Delete"
              disabled={pending}
              onClick={() => remove(m.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
          {editingId === m.id && (
            <div className="border-t p-5">
              <TeamMemberForm
                id={m.id}
                initialSortOrder={m.sortOrder}
                initialPhotoId={m.photoId}
                initialRo={m.ro}
                initialEn={m.en}
                onDone={() => setEditingId(null)}
              />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
