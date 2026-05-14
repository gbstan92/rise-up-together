import { z } from "zod";

// Single block kind for v1. Extend with new variants here when needed.
export const richTextPayload = z.object({
  bodyRo: z.string().max(20_000).default(""),
  bodyEn: z.string().max(20_000).default(""),
});

export type RichTextPayload = z.infer<typeof richTextPayload>;

export const blockKinds = ["richText"] as const;
export type BlockKind = (typeof blockKinds)[number];

export function parseBlockPayload(kind: string, payload: unknown): RichTextPayload | null {
  if (kind === "richText") {
    const r = richTextPayload.safeParse(payload);
    return r.success ? r.data : null;
  }
  return null;
}
