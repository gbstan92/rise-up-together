"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { savePage } from "@/server/pages";
import type { AdminPageDetail } from "@/server/pages";

export function PageEditor({ initial }: { initial: AdminPageDetail }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(initial.status);
  const [ro, setRo] = useState(initial.ro);
  const [en, setEn] = useState(initial.en);
  const [body, setBody] = useState(initial.body);

  const save = () => {
    startTransition(async () => {
      try {
        await savePage({
          key: initial.key,
          status,
          ro,
          en,
          body,
        });
        toast.success("Page saved");
        router.refresh();
      } catch (err) {
        toast.error("Save failed");
        console.error(err);
      }
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <Column lang="Română (RO)" warn={!ro.title.trim() ? "Required" : null}>
        <Field label="Title" htmlFor="ro-title">
          <Input
            id="ro-title"
            value={ro.title}
            onChange={(e) => setRo({ ...ro, title: e.target.value })}
          />
        </Field>
        <Field label="SEO title" htmlFor="ro-seo-title">
          <Input
            id="ro-seo-title"
            value={ro.seoTitle}
            onChange={(e) => setRo({ ...ro, seoTitle: e.target.value })}
          />
        </Field>
        <Field label="SEO description" htmlFor="ro-seo-desc">
          <Textarea
            id="ro-seo-desc"
            rows={2}
            value={ro.seoDesc}
            onChange={(e) => setRo({ ...ro, seoDesc: e.target.value })}
          />
        </Field>
        <Field label="Body (HTML)" htmlFor="ro-body">
          <Textarea
            id="ro-body"
            rows={16}
            className="font-mono text-sm"
            value={body.bodyRo}
            onChange={(e) => setBody({ ...body, bodyRo: e.target.value })}
          />
        </Field>
      </Column>

      <Column
        lang="English (EN)"
        warn={!en.title.trim() ? "Falls back to RO if empty" : null}
      >
        <Field label="Title" htmlFor="en-title">
          <Input
            id="en-title"
            value={en.title}
            onChange={(e) => setEn({ ...en, title: e.target.value })}
          />
        </Field>
        <Field label="SEO title" htmlFor="en-seo-title">
          <Input
            id="en-seo-title"
            value={en.seoTitle}
            onChange={(e) => setEn({ ...en, seoTitle: e.target.value })}
          />
        </Field>
        <Field label="SEO description" htmlFor="en-seo-desc">
          <Textarea
            id="en-seo-desc"
            rows={2}
            value={en.seoDesc}
            onChange={(e) => setEn({ ...en, seoDesc: e.target.value })}
          />
        </Field>
        <Field label="Body (HTML)" htmlFor="en-body">
          <Textarea
            id="en-body"
            rows={16}
            className="font-mono text-sm"
            value={body.bodyEn}
            onChange={(e) => setBody({ ...body, bodyEn: e.target.value })}
          />
        </Field>
      </Column>

      <div className="lg:col-span-2 flex items-center gap-4 border-t pt-6">
        <div className="flex items-center gap-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
        <Button onClick={save} disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

function Column({
  lang,
  warn,
  children,
}: {
  lang: string;
  warn?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {lang}
        </h2>
        {warn && <span className="text-xs text-muted-foreground">{warn}</span>}
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
