"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { upsertTeamMember } from "@/server/team-members";

type Lang = { name: string; role: string; bio: string };

export function TeamMemberForm({
  id,
  initialSortOrder = 0,
  initialPhotoId = null,
  initialRo,
  initialEn,
  onDone,
}: {
  id?: string;
  initialSortOrder?: number;
  initialPhotoId?: string | null;
  initialRo?: Lang;
  initialEn?: Lang;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sortOrder, setSortOrder] = useState(initialSortOrder);
  const [photoId, setPhotoId] = useState<string | null>(initialPhotoId);
  const [ro, setRo] = useState<Lang>(initialRo ?? { name: "", role: "", bio: "" });
  const [en, setEn] = useState<Lang>(initialEn ?? { name: "", role: "", bio: "" });

  const submit = () => {
    if (!ro.name.trim()) {
      toast.error("RO name is required");
      return;
    }
    startTransition(async () => {
      try {
        await upsertTeamMember({ id, sortOrder, photoId, ro, en });
        toast.success(id ? "Member updated" : "Member added");
        if (!id) {
          setRo({ name: "", role: "", bio: "" });
          setEn({ name: "", role: "", bio: "" });
          setPhotoId(null);
        }
        onDone?.();
        router.refresh();
      } catch (err) {
        toast.error("Save failed");
        console.error(err);
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Lane title="RO">
          <Field label="Name *">
            <Input value={ro.name} onChange={(e) => setRo({ ...ro, name: e.target.value })} />
          </Field>
          <Field label="Role">
            <Input value={ro.role} onChange={(e) => setRo({ ...ro, role: e.target.value })} />
          </Field>
          <Field label="Bio">
            <Textarea rows={3} value={ro.bio} onChange={(e) => setRo({ ...ro, bio: e.target.value })} />
          </Field>
        </Lane>
        <Lane title="EN (falls back to RO)">
          <Field label="Name">
            <Input value={en.name} onChange={(e) => setEn({ ...en, name: e.target.value })} />
          </Field>
          <Field label="Role">
            <Input value={en.role} onChange={(e) => setEn({ ...en, role: e.target.value })} />
          </Field>
          <Field label="Bio">
            <Textarea rows={3} value={en.bio} onChange={(e) => setEn({ ...en, bio: e.target.value })} />
          </Field>
        </Lane>
      </div>

      <Field label="Photo (optional)">
        <MediaPicker selectedId={photoId} onChange={setPhotoId} />
      </Field>

      <Field label="Sort order">
        <Input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="w-24"
        />
      </Field>

      <Button onClick={submit} disabled={pending}>
        {pending ? "Saving…" : id ? "Save changes" : "Add member"}
      </Button>
    </div>
  );
}

function Lane({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-md border p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
