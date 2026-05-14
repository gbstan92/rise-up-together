// Bilingual transactional email templates.
// Plain HTML strings. Each function returns { subject, html }.

import type { Locale } from "@/generated/prisma/enums";

type Lang = "ro" | "en";

function lang(locale: Locale | Lang): Lang {
  if (typeof locale === "string") {
    return locale.toLowerCase() === "en" ? "en" : "ro";
  }
  return locale === "EN" ? "en" : "ro";
}

const SITE = process.env.SITE_URL ?? "http://localhost:3000";

const baseStyle = `
font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
color: #1a0808;
line-height: 1.5;
max-width: 560px;
`;

function wrap(content: string) {
  return `<div style="${baseStyle}">${content}<hr style="border:none;border-top:1px solid #ecd9d9;margin:24px 0"/><p style="font-size:12px;color:#6b4f4f">Rise Up Together · ${SITE}</p></div>`;
}

// ----- Volunteer -----

export function volunteerAdmin(d: {
  name: string;
  email: string;
  phone?: string | null;
  interests: string;
  message?: string | null;
}) {
  const html = wrap(`
    <h2>New volunteer signup</h2>
    <p><b>Name:</b> ${escape(d.name)}</p>
    <p><b>Email:</b> ${escape(d.email)}</p>
    ${d.phone ? `<p><b>Phone:</b> ${escape(d.phone)}</p>` : ""}
    <p><b>Interests:</b> ${escape(d.interests)}</p>
    ${d.message ? `<p><b>Message:</b><br/>${escape(d.message)}</p>` : ""}
  `);
  return { subject: `New volunteer: ${d.name}`, html };
}

export function volunteerUser(d: { name: string }, locale: Locale | Lang) {
  const l = lang(locale);
  const subject =
    l === "ro" ? "Mulțumim pentru înscriere!" : "Thanks for signing up!";
  const body =
    l === "ro"
      ? `<h2>Salut ${escape(d.name)},</h2><p>Mulțumim că vrei să fii voluntar alături de Rise Up Together. Te vom contacta în curând cu detalii despre următoarele activități.</p>`
      : `<h2>Hi ${escape(d.name)},</h2><p>Thanks for signing up as a volunteer with Rise Up Together. We'll be in touch shortly with details on upcoming activities.</p>`;
  return { subject, html: wrap(body) };
}

// ----- Sponsor -----

export function sponsorAdmin(d: {
  company: string;
  contactName: string;
  email: string;
  phone?: string | null;
  tier?: string | null;
  message: string;
}) {
  const html = wrap(`
    <h2>New sponsor inquiry</h2>
    <p><b>Company:</b> ${escape(d.company)}</p>
    <p><b>Contact:</b> ${escape(d.contactName)} &lt;${escape(d.email)}&gt;</p>
    ${d.phone ? `<p><b>Phone:</b> ${escape(d.phone)}</p>` : ""}
    ${d.tier ? `<p><b>Tier interest:</b> ${escape(d.tier)}</p>` : ""}
    <p><b>Message:</b><br/>${escape(d.message)}</p>
  `);
  return { subject: `Sponsor inquiry: ${d.company}`, html };
}

export function sponsorUser(d: { contactName: string }, locale: Locale | Lang) {
  const l = lang(locale);
  const subject =
    l === "ro"
      ? "Mulțumim pentru interesul tău!"
      : "Thanks for reaching out!";
  const body =
    l === "ro"
      ? `<h2>Salut ${escape(d.contactName)},</h2><p>Am primit cererea ta de parteneriat și o vom analiza. Revenim cu un răspuns în cel mai scurt timp.</p>`
      : `<h2>Hi ${escape(d.contactName)},</h2><p>We've received your partnership inquiry and will review it. We'll get back to you as soon as possible.</p>`;
  return { subject, html: wrap(body) };
}

// ----- Newsletter -----

export function newsletterConfirm(d: { token: string }, locale: Locale | Lang) {
  const l = lang(locale);
  const link = `${SITE}/api/forms/newsletter/confirm?token=${encodeURIComponent(d.token)}`;
  const subject =
    l === "ro" ? "Confirmă abonarea la newsletter" : "Confirm your subscription";
  const body =
    l === "ro"
      ? `<h2>Aproape gata!</h2><p>Apasă butonul de mai jos pentru a confirma abonarea la newsletter-ul Rise Up Together.</p><p><a href="${link}" style="display:inline-block;padding:10px 18px;background:#c8102e;color:#fff;border-radius:6px;text-decoration:none">Confirmă</a></p><p>Dacă nu ai cerut tu acest abonament, ignoră acest mesaj.</p>`
      : `<h2>Almost there!</h2><p>Click the button below to confirm your subscription to the Rise Up Together newsletter.</p><p><a href="${link}" style="display:inline-block;padding:10px 18px;background:#c8102e;color:#fff;border-radius:6px;text-decoration:none">Confirm</a></p><p>If you didn't request this, you can ignore this message.</p>`;
  return { subject, html: wrap(body) };
}

export function newsletterWelcome(d: { unsubToken: string }, locale: Locale | Lang) {
  const l = lang(locale);
  const unsub = `${SITE}/api/forms/newsletter/unsubscribe?token=${encodeURIComponent(d.unsubToken)}`;
  const subject =
    l === "ro" ? "Bine ai venit!" : "Welcome aboard!";
  const body =
    l === "ro"
      ? `<h2>Bine ai venit!</h2><p>Mulțumim că te-ai alăturat comunității Rise Up Together. Îți vom trimite lunar povești, evenimente și moduri de implicare.</p><p style="font-size:12px;color:#6b4f4f"><a href="${unsub}" style="color:#6b4f4f">Dezabonare</a></p>`
      : `<h2>Welcome aboard!</h2><p>Thanks for joining the Rise Up Together community. We'll send you monthly stories, events and ways to get involved.</p><p style="font-size:12px;color:#6b4f4f"><a href="${unsub}" style="color:#6b4f4f">Unsubscribe</a></p>`;
  return { subject, html: wrap(body) };
}

// ----- Team registration decision -----

export function teamRegistrationDecision(
  d: {
    teamName: string;
    tournamentTitle: string;
    approved: boolean;
    note?: string;
  },
  locale: Locale | Lang,
) {
  const l = lang(locale);
  const subject = d.approved
    ? l === "ro"
      ? `Înscriere acceptată: ${d.teamName}`
      : `Registration approved: ${d.teamName}`
    : l === "ro"
      ? `Înscriere respinsă: ${d.teamName}`
      : `Registration declined: ${d.teamName}`;
  const head =
    l === "ro"
      ? d.approved
        ? `Înscrierea echipei <b>${escape(d.teamName)}</b> la turneul <b>${escape(d.tournamentTitle)}</b> a fost acceptată.`
        : `Înscrierea echipei <b>${escape(d.teamName)}</b> la turneul <b>${escape(d.tournamentTitle)}</b> nu poate fi acceptată de această dată.`
      : d.approved
        ? `Your team <b>${escape(d.teamName)}</b> has been accepted into the tournament <b>${escape(d.tournamentTitle)}</b>.`
        : `Your team <b>${escape(d.teamName)}</b> couldn't be accepted into <b>${escape(d.tournamentTitle)}</b> at this time.`;
  const body = `<h2>${subject}</h2><p>${head}</p>${d.note ? `<p>${escape(d.note)}</p>` : ""}`;
  return { subject, html: wrap(body) };
}

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
