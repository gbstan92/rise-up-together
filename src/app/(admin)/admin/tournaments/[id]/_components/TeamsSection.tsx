"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { addTeam, removeTeam } from "@/server/tournaments";

type Team = {
  id: string;
  name: string;
  logoId: string | null;
  sortOrder: number;
};

export function TeamsSection({
  tournamentId,
  initial,
}: {
  tournamentId: string;
  initial: Team[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [logoId, setLogoId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const add = () => {
    if (!name.trim()) {
      toast.error("Team name required");
      return;
    }
    startTransition(async () => {
      try {
        await addTeam(tournamentId, name.trim(), logoId);
        setName("");
        setLogoId(null);
        setShowPicker(false);
        router.refresh();
      } catch {
        toast.error("Add failed");
      }
    });
  };

  const remove = (id: string) => {
    startTransition(async () => {
      try {
        await removeTeam(id, tournamentId);
        router.refresh();
      } catch {
        toast.error("Remove failed");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Team name</Label>
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="button" variant="outline" onClick={() => setShowPicker((s) => !s)}>
            {logoId ? "Change logo" : "Pick logo"}
          </Button>
          <Button onClick={add} disabled={pending}>
            Add team
          </Button>
        </div>
        {showPicker && <MediaPicker selectedId={logoId} onChange={setLogoId} />}
      </div>

      {initial.length > 0 && (
        <ul className="divide-y rounded-md border">
          {initial.map((t) => (
            <li key={t.id} className="flex items-center gap-3 px-4 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate">{t.name}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remove"
                disabled={pending}
                onClick={() => remove(t.id)}
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
