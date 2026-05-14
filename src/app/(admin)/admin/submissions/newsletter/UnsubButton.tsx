"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteNewsletterSubscriber } from "@/server/submissions";

export function UnsubButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      size="xs"
      variant="ghost"
      disabled={pending}
      onClick={() => {
        if (!confirm("Remove this subscriber?")) return;
        startTransition(async () => {
          try {
            await deleteNewsletterSubscriber(id);
            router.refresh();
          } catch {
            toast.error("Remove failed");
          }
        });
      }}
    >
      Remove
    </Button>
  );
}
