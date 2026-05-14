import { NextResponse } from "next/server";
import { PublishStatus, TournamentStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db";
import { teamRegistrationSchema } from "@/lib/zod-schemas";
import { handleFormSubmit } from "@/server/form-pipeline";
import { adminInbox, sendMail } from "@/server/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return handleFormSubmit(req, {
    endpoint: "team-registration",
    schema: teamRegistrationSchema,
    handler: async ({ input }) => {
      const tournament = await prisma.tournament.findUnique({
        where: { id: input.tournamentId },
      });
      if (
        !tournament ||
        tournament.status !== PublishStatus.PUBLISHED ||
        tournament.phase !== TournamentStatus.UPCOMING ||
        !tournament.registrationOpen
      ) {
        throw new Error("Registrations are closed for this tournament");
      }

      await prisma.teamRegistration.create({
        data: {
          tournamentId: input.tournamentId,
          teamName: input.teamName,
          captainName: input.captainName,
          captainEmail: input.captainEmail,
          captainPhone: input.captainPhone ?? null,
          playerCount: input.playerCount,
          notes: input.notes ?? null,
        },
      });

      const admin = adminInbox();
      if (admin) {
        await sendMail({
          to: admin,
          subject: `Team registration: ${input.teamName}`,
          html: `<h2>New team registration</h2>
<p><b>Tournament:</b> ${escape(tournament.venueName)} (${tournament.startDate.toDateString()})</p>
<p><b>Team:</b> ${escape(input.teamName)}</p>
<p><b>Captain:</b> ${escape(input.captainName)} &lt;${escape(input.captainEmail)}&gt;</p>
<p><b>Players:</b> ${input.playerCount}</p>
${input.notes ? `<p><b>Notes:</b> ${escape(input.notes)}</p>` : ""}`,
          replyTo: input.captainEmail,
        });
      }
    },
  });

  function escape(s: string) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
}
