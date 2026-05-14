"use client";

import { useState } from "react";
import { toast } from "sonner";

export function useFormSubmit<T>(endpoint: string, messages: { success: string; errorGeneric: string; errorCaptcha: string; errorRateLimited: string }) {
  const [pending, setPending] = useState(false);

  async function submit(payload: T): Promise<boolean> {
    setPending(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(messages.success);
        return true;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (data.error === "captcha") toast.error(messages.errorCaptcha);
      else if (data.error === "ratelimited") toast.error(messages.errorRateLimited);
      else toast.error(messages.errorGeneric);
      return false;
    } catch {
      toast.error(messages.errorGeneric);
      return false;
    } finally {
      setPending(false);
    }
  }

  return { submit, pending };
}
