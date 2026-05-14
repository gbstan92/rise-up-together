"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.email("Invalid email"),
  password: z.string().min(1, "Required"),
  from: z.string().optional(),
});

export type LoginState = { error?: string } | undefined;

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    from: formData.get("from"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limit = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return { error: "Too many attempts. Try again in a few minutes." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: parsed.data.from || "/admin",
    });
    return undefined;
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password" };
    }
    throw err;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
