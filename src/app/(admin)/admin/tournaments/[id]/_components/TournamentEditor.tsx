"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker } from "@/components/admin/MediaPicker";
import {
  deleteTournament,
  setGallery,
  upsertTournament,
} from "@/server/tournaments";
import { VideosSection } from "./VideosSection";
import { TeamsSection } from "./TeamsSection";
import { ResultsSection } from "./ResultsSection";
import { GallerySection } from "./GallerySection";

type Initial = NonNullable<
  Awaited<ReturnType<typeof import("@/server/tournaments").getAdminTournament>>
>;

function toLocalDateInput(d: Date | null) {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

export function TournamentEditor({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(initial.status);
  const [phase, setPhase] = useState(initial.phase);
  const [startDate, setStartDate] = useState(toLocalDateInput(initial.startDate));
  const [endDate, setEndDate] = useState(toLocalDateInput(initial.endDate));
  const [venueName, setVenueName] = useState(initial.venueName);
  const [venueAddress, setVenueAddress] = useState(initial.venueAddress);
  const [registrationOpen, setRegistrationOpen] = useState(initial.registrationOpen);
  const [coverId, setCoverId] = useState<string | null>(initial.coverId);
  const [ro, setRo] = useState(initial.ro);
  const [en, setEn] = useState(initial.en);
  const [body, setBody] = useState(initial.body);
  const [galleryIds, setGalleryIds] = useState<string[]>(initial.galleryIds);

  const save = () => {
    if (!ro.title.trim()) {
      toast.error("RO title is required");
      return;
    }
    if (!startDate) {
      toast.error("Start date is required");
      return;
    }
    startTransition(async () => {
      try {
        await upsertTournament({
          id: initial.id,
          status,
          phase,
          startDate: new Date(startDate),
          endDate: endDate ? new Date(endDate) : null,
          venueName,
          venueAddress,
          registrationOpen,
          coverId,
          ro,
          en,
          body,
        });
        await setGallery(initial.id, galleryIds);
        toast.success("Tournament saved");
        router.refresh();
      } catch (err) {
        toast.error("Save failed");
        console.error(err);
      }
    });
  };

  const remove = () => {
    if (!confirm("Delete this tournament? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteTournament(initial.id);
        toast.success("Deleted");
        router.push("/admin/tournaments");
      } catch {
        toast.error("Delete failed");
      }
    });
  };

  return (
    <div className="space-y-8">
      <Block title="Details">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </Field>
          <Field label="Phase">
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value as typeof phase)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="UPCOMING">Upcoming</option>
              <option value="PAST">Past</option>
            </select>
          </Field>
          <Field label="Start date *">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Field>
          <Field label="End date (optional)">
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Field>
          <Field label="Venue name *">
            <Input
              value={venueName}
              onChange={(e) => setVenueName(e.target.value)}
            />
          </Field>
          <Field label="Venue address *">
            <Input
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
            />
          </Field>
          <Field label="Registration open">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={registrationOpen}
                onChange={(e) => setRegistrationOpen(e.target.checked)}
              />
              Accept team registrations
            </label>
          </Field>
        </div>
      </Block>

      <Block title="Cover image">
        <MediaPicker selectedId={coverId} onChange={setCoverId} />
      </Block>

      <div className="grid gap-6 lg:grid-cols-2">
        <Block title="Romanian (RO) *">
          <Field label="Title *">
            <Input value={ro.title} onChange={(e) => setRo({ ...ro, title: e.target.value })} />
          </Field>
          <Field label="URL slug (optional — auto from title)">
            <Input
              value={ro.slugLocale}
              onChange={(e) => setRo({ ...ro, slugLocale: e.target.value })}
              placeholder="ex: cupa-comunitatii-2025"
            />
          </Field>
          <Field label="Summary">
            <Textarea
              rows={2}
              value={ro.summary}
              onChange={(e) => setRo({ ...ro, summary: e.target.value })}
            />
          </Field>
          <Field label="Body (HTML)">
            <Textarea
              rows={10}
              className="font-mono text-sm"
              value={body.bodyRo}
              onChange={(e) => setBody({ ...body, bodyRo: e.target.value })}
            />
          </Field>
          <Field label="SEO title">
            <Input value={ro.seoTitle} onChange={(e) => setRo({ ...ro, seoTitle: e.target.value })} />
          </Field>
          <Field label="SEO description">
            <Textarea
              rows={2}
              value={ro.seoDesc}
              onChange={(e) => setRo({ ...ro, seoDesc: e.target.value })}
            />
          </Field>
        </Block>

        <Block title="English (EN) — falls back to RO">
          <Field label="Title">
            <Input value={en.title} onChange={(e) => setEn({ ...en, title: e.target.value })} />
          </Field>
          <Field label="URL slug">
            <Input
              value={en.slugLocale}
              onChange={(e) => setEn({ ...en, slugLocale: e.target.value })}
              placeholder="ex: community-cup-2025"
            />
          </Field>
          <Field label="Summary">
            <Textarea
              rows={2}
              value={en.summary}
              onChange={(e) => setEn({ ...en, summary: e.target.value })}
            />
          </Field>
          <Field label="Body (HTML)">
            <Textarea
              rows={10}
              className="font-mono text-sm"
              value={body.bodyEn}
              onChange={(e) => setBody({ ...body, bodyEn: e.target.value })}
            />
          </Field>
          <Field label="SEO title">
            <Input value={en.seoTitle} onChange={(e) => setEn({ ...en, seoTitle: e.target.value })} />
          </Field>
          <Field label="SEO description">
            <Textarea
              rows={2}
              value={en.seoDesc}
              onChange={(e) => setEn({ ...en, seoDesc: e.target.value })}
            />
          </Field>
        </Block>
      </div>

      <Block title="Gallery">
        <p className="mb-3 text-xs text-muted-foreground">
          Select multiple images. Cmd/Ctrl-click thumbnails below.
        </p>
        <GallerySection ids={galleryIds} onChange={setGalleryIds} />
      </Block>

      <Block title="YouTube videos">
        <VideosSection tournamentId={initial.id} initial={initial.videos} />
      </Block>

      <Block title="Teams">
        <TeamsSection tournamentId={initial.id} initial={initial.teams} />
      </Block>

      <Block title="Results">
        <ResultsSection
          tournamentId={initial.id}
          teams={initial.teams}
          initial={initial.results}
        />
      </Block>

      <div className="flex items-center justify-between border-t pt-6">
        <Button onClick={save} disabled={pending} size="lg">
          {pending ? "Saving…" : "Save tournament"}
        </Button>
        <Button onClick={remove} variant="destructive" disabled={pending}>
          Delete
        </Button>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
