import { Resend } from "resend";

let cachedClient: Resend | null = null;

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cachedClient ??= new Resend(key);
  return cachedClient;
}

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendMail({ to, subject, html, replyTo }: SendArgs) {
  const client = getClient();
  const from = process.env.RESEND_FROM ?? "noreply@riseuptogether.co.uk";

  if (!client) {
    console.warn(
      `[email] RESEND_API_KEY missing — would have sent to ${to}: ${subject}`,
    );
    return { ok: false as const, reason: "no-key" as const };
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to,
      subject,
      html,
      replyTo,
    });
    if (error) {
      console.error("[email] send error", error);
      return { ok: false as const, reason: "api-error" as const };
    }
    return { ok: true as const, id: data?.id };
  } catch (err) {
    console.error("[email] send threw", err);
    return { ok: false as const, reason: "exception" as const };
  }
}

export function adminInbox() {
  return process.env.ADMIN_INBOX_EMAIL ?? null;
}
