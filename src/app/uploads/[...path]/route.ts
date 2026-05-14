import { NextResponse } from "next/server";
import { stat, readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? "./.uploads");

const MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: parts } = await params;
  const rel = parts.join("/");
  const abs = path.resolve(UPLOAD_DIR, rel);

  // Path traversal guard.
  if (!abs.startsWith(UPLOAD_DIR + path.sep) && abs !== UPLOAD_DIR) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const info = await stat(abs);
    if (!info.isFile()) return new NextResponse("Not found", { status: 404 });

    const body = await readFile(abs);
    const ext = path.extname(abs).toLowerCase();
    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(info.size),
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
