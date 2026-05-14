// hCaptcha server-side verification.
// Skipped when HCAPTCHA_SECRET is not set (e.g. local dev without keys).
export async function verifyHcaptcha(token: string | undefined | null) {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("HCAPTCHA_SECRET missing in production");
      return false;
    }
    return true; // dev convenience
  }
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  try {
    const res = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error("hcaptcha verify failed", err);
    return false;
  }
}
