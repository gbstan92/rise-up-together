"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setSubmissionStatus } from "@/server/submissions";

type Table = "volunteer" | "sponsor";

export function StatusButtons({
  table,
  id,
  status,
}: {
  table: Table;
  id: string;
  status: "NEW" | "HANDLED" | "ARCHIVED";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const set = (next: "NEW" | "HANDLED" | "ARCHIVED") => {
    startTransition(async () => {
      try {
        await setSubmissionStatus(table, id, next);
        router.refresh();
      } catch {
        toast.error("Update failed");
      }
    });
  };

  return (
    <div className="flex gap-1">
      {status !== "HANDLED" && (
        <Button size="xs" variant="outline" disabled={pending} onClick={() => set("HANDLED")}>
          Mark handled
        </Button>
      )}
      {status !== "ARCHIVED" && (
        <Button size="xs" variant="ghost" disabled={pending} onClick={() => set("ARCHIVED")}>
          Archive
        </Button>
      )}
      {status !== "NEW" && (
        <Button size="xs" variant="ghost" disabled={pending} onClick={() => set("NEW")}>
          Reopen
        </Button>
      )}
    </div>
  );
}
