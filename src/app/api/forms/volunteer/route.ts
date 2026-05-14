import { prisma } from "@/lib/db";
import { volunteerSchema } from "@/lib/zod-schemas";
import { handleFormSubmit } from "@/server/form-pipeline";
import { adminInbox, sendMail } from "@/server/email";
import { volunteerAdmin, volunteerUser } from "@/server/emails/templates";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return handleFormSubmit(req, {
    endpoint: "volunteer",
    schema: volunteerSchema,
    handler: async ({ input }) => {
      await prisma.volunteerSubmission.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          interests: input.interests,
          message: input.message ?? null,
        },
      });

      const admin = adminInbox();
      const adminTpl = volunteerAdmin(input);
      const userTpl = volunteerUser({ name: input.name }, input.locale);
      await Promise.all([
        admin ? sendMail({ to: admin, ...adminTpl, replyTo: input.email }) : null,
        sendMail({ to: input.email, ...userTpl }),
      ]);
    },
  });
}
