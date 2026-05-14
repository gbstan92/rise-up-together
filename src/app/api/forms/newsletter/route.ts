import { Locale } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { newsletterSchema } from "@/lib/zod-schemas";
import { handleFormSubmit } from "@/server/form-pipeline";
import { sendMail } from "@/server/email";
import { newsletterConfirm } from "@/server/emails/templates";
import { makeToken } from "@/server/newsletter";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return handleFormSubmit(req, {
    endpoint: "newsletter",
    schema: newsletterSchema,
    handler: async ({ input }) => {
      const existing = await prisma.newsletterSubscriber.findUnique({
        where: { email: input.email },
      });

      // If already confirmed, no-op; we don't reveal subscription state.
      if (existing?.confirmed) return;

      const confirmToken = makeToken();
      const unsubToken = existing?.unsubToken ?? makeToken();
      const locale = input.locale === "en" ? Locale.EN : Locale.RO;

      if (existing) {
        await prisma.newsletterSubscriber.update({
          where: { email: input.email },
          data: { confirmToken, locale },
        });
      } else {
        await prisma.newsletterSubscriber.create({
          data: {
            email: input.email,
            locale,
            confirmToken,
            unsubToken,
          },
        });
      }

      const tpl = newsletterConfirm({ token: confirmToken }, input.locale);
      await sendMail({ to: input.email, ...tpl });
    },
  });
}
