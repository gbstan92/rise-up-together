import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { createId } from "@/lib/id";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "./.uploads";
const MAX_BYTES = (Number(process.env.MAX_UPLOAD_MB) || 5) * 1024 * 1024;
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp"]);

// First bytes (magic) per type — rejects MIME spoofing.
const MAGIC: Array<{ type: string; bytes: number[] }> = [
  { type: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { type: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { type: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
];

function sniff(buf: Buffer): string | null {
  for (const { type, bytes } of MAGIC) {
    if (bytes.every((b, i) => buf[i] === b)) return type;
  }
  return null;
}

export const UPLOAD_LIMITS = {
  maxBytes: MAX_BYTES,
  accepted: Array.from(ACCEPTED),
};

export type ProcessedImage = {
  storageKey: string;
  width: number;
  height: number;
  variants: { thumb: string; md: string; lg: string; orig: string };
};

const VARIANTS = [
  { name: "thumb", width: 400 },
  { name: "md", width: 1024 },
  { name: "lg", width: 1920 },
] as const;

export class UploadError extends Error {}

export async function processImage(file: File): Promise<ProcessedImage> {
  if (!ACCEPTED.has(file.type)) {
    throw new UploadError(`Unsupported type: ${file.type}`);
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError(`File exceeds ${MAX_BYTES / (1024 * 1024)}MB limit`);
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const sniffed = sniff(buf);
  if (!sniffed || sniffed !== file.type) {
    throw new UploadError("File content does not match declared type");
  }

  const sharp = (await import("sharp")).default;

  const id = createId();
  const dir = path.join(UPLOAD_DIR, "media");
  await mkdir(dir, { recursive: true });

  const meta = await sharp(buf).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const origKey = `media/${id}.${ext}`;
  await writeFile(path.join(UPLOAD_DIR, origKey), buf);

  const variants: Record<string, string> = { orig: origKey };
  await Promise.all(
    VARIANTS.map(async ({ name, width: w }) => {
      const key = `media/${id}-${name}.webp`;
      const out = await sharp(buf)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      await writeFile(path.join(UPLOAD_DIR, key), out);
      variants[name] = key;
    }),
  );

  return {
    storageKey: id,
    width,
    height,
    variants: {
      orig: variants.orig!,
      thumb: variants.thumb!,
      md: variants.md!,
      lg: variants.lg!,
    },
  };
}
