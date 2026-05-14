import { prisma } from "@/lib/db";
import { sponsorSchema } from "@/lib/zod-schemas";
import { handleFormSubmit } from "@/server/form-pipeline";
import { adminInbox, sendMail } from "@/server/email";
import { sponsorAdmin, sponsorUser } from "@/server/emails/templates";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return handleFormSubmit(req, {
    endpoint: "sponsor",
    schema: sponsorSchema,
    handler: async ({ input }) => {
      await prisma.sponsorInquiry.create({
        data: {
          company: input.company,
          contactName: input.contactName,
          email: input.email,
          phone: input.phone ?? null,
          tier: input.tier ?? null,
          message: input.message,
        },
      });

      const admin = adminInbox();
      const adminTpl = sponsorAdmin(input);
      const userTpl = sponsorUser({ contactName: input.contactName }, input.locale);
      await Promise.all([
        admin ? sendMail({ to: admin, ...adminTpl, replyTo: input.email }) : null,
        sendMail({ to: input.email, ...userTpl }),
      ]);
    },
  });
}
