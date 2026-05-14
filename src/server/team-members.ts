"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Locale } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/server/require-admin";

const upsertSchema = z.object({
  id: z.string().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  photoId: z.string().nullable().optional(),
  ro: z.object({
    name: z.string().min(1).max(120),
    role: z.string().max(120).default(""),
    bio: z.string().max(2000).default(""),
  }),
  en: z.object({
    name: z.string().max(120).default(""),
    role: z.string().max(120).default(""),
    bio: z.string().max(2000).default(""),
  }),
});

export type TeamMemberInput = z.input<typeof upsertSchema>;

export async function upsertTeamMember(input: TeamMemberInput) {
  await requireAdmin();
  const data = upsertSchema.parse(input);

  if (data.id) {
    await prisma.teamMember.update({
      where: { id: data.id },
      data: { sortOrder: data.sortOrder, photoId: data.photoId ?? null },
    });
    await prisma.teamMemberTranslation.upsert({
      where: { memberId_locale: { memberId: data.id, locale: Locale.RO } },
      create: {
        memberId: data.id,
        locale: Locale.RO,
        name: data.ro.name,
        role: data.ro.role,
        bio: data.ro.bio,
      },
      update: { name: data.ro.name, role: data.ro.role, bio: data.ro.bio },
    });
    await prisma.teamMemberTranslation.upsert({
      where: { memberId_locale: { memberId: data.id, locale: Locale.EN } },
      create: {
        memberId: data.id,
        locale: Locale.EN,
        name: data.en.name || data.ro.name,
        role: data.en.role || data.ro.role,
        bio: data.en.bio || data.ro.bio,
      },
      update: {
        name: data.en.name || data.ro.name,
        role: data.en.role || data.ro.role,
        bio: data.en.bio || data.ro.bio,
      },
    });
  } else {
    await prisma.teamMember.create({
      data: {
        sortOrder: data.sortOrder,
        photoId: data.photoId ?? null,
        translations: {
          create: [
            {
              locale: Locale.RO,
              name: data.ro.name,
              role: data.ro.role,
              bio: data.ro.bio,
            },
            {
              locale: Locale.EN,
              name: data.en.name || data.ro.name,
              role: data.en.role || data.ro.role,
              bio: data.en.bio || data.ro.bio,
            },
          ],
        },
      },
    });
  }

  revalidatePath("/admin/team");
  revalidatePath("/ro/cine-suntem");
  revalidatePath("/en/who-we-are");
}

export async function deleteTeamMember(id: string) {
  await requireAdmin();
  await prisma.teamMember.delete({ where: { id } });
  revalidatePath("/admin/team");
  revalidatePath("/ro/cine-suntem");
  revalidatePath("/en/who-we-are");
}
