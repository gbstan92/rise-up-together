"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { decideRegistration } from "@/server/submissions";

export function DecisionButtons({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const decide = (decision: "APPROVED" | "REJECTED") => {
    const note =
      decision === "REJECTED"
        ? prompt("Optional note to the captain (sent in email):") ?? undefined
        : undefined;
    startTransition(async () => {
      try {
        await decideRegistration(id, decision, note ?? undefined);
        toast.success(decision === "APPROVED" ? "Approved" : "Rejected");
        router.refresh();
      } catch (err) {
        toast.error("Failed");
        console.error(err);
      }
    });
  };

  return (
    <div className="flex gap-1">
      <Button size="xs" disabled={pending} onClick={() => decide("APPROVED")}>
        Approve
      </Button>
      <Button size="xs" variant="outline" disabled={pending} onClick={() => decide("REJECTED")}>
        Reject
      </Button>
    </div>
  );
}
