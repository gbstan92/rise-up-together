import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z, type ZodSchema } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { verifyHcaptcha } from "@/server/hcaptcha";

type Persisted<T> = { input: T; ip: string };

export async function handleFormSubmit<T extends { hcaptchaToken?: string | null }>(
  req: Request,
  opts: {
    endpoint: string;
    schema: ZodSchema<T>;
    handler: (data: Persisted<T>) => Promise<void> | void;
    limit?: number; // requests per windowMs
    windowMs?: number;
  },
): Promise<NextResponse> {
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const limit = rateLimit(`${opts.endpoint}:${ip}`, opts.limit ?? 5, opts.windowMs ?? 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "ratelimited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid-json" }, { status: 400 });
  }

  const parsed = opts.schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", details: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const captchaOk = await verifyHcaptcha(parsed.data.hcaptchaToken ?? null);
  if (!captchaOk) {
    return NextResponse.json({ error: "captcha" }, { status: 400 });
  }

  try {
    await opts.handler({ input: parsed.data, ip });
  } catch (err) {
    console.error(`[${opts.endpoint}] handler failed`, err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
