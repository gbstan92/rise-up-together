import { z } from "zod";

const localeEnum = z.enum(["ro", "en"]);

export const volunteerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  phone: z.string().max(40).optional().nullable(),
  interests: z.string().min(2).max(500),
  message: z.string().max(2000).optional().nullable(),
  hcaptchaToken: z.string().optional().nullable(),
  locale: localeEnum,
});

export const sponsorSchema = z.object({
  company: z.string().min(2).max(160),
  contactName: z.string().min(2).max(120),
  email: z.email(),
  phone: z.string().max(40).optional().nullable(),
  tier: z.string().max(40).optional().nullable(),
  message: z.string().min(5).max(2000),
  hcaptchaToken: z.string().optional().nullable(),
  locale: localeEnum,
});

export const newsletterSchema = z.object({
  email: z.email(),
  hcaptchaToken: z.string().optional().nullable(),
  locale: localeEnum,
});

export const teamRegistrationSchema = z.object({
  tournamentId: z.string().min(1),
  teamName: z.string().min(2).max(120),
  captainName: z.string().min(2).max(120),
  captainEmail: z.email(),
  captainPhone: z.string().max(40).optional().nullable(),
  playerCount: z.number().int().min(1).max(50),
  notes: z.string().max(2000).optional().nullable(),
  hcaptchaToken: z.string().optional().nullable(),
  locale: localeEnum,
});

export type VolunteerInput = z.infer<typeof volunteerSchema>;
export type SponsorInput = z.infer<typeof sponsorSchema>;
export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type TeamRegistrationInput = z.infer<typeof teamRegistrationSchema>;
