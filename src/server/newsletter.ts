import { randomBytes } from "node:crypto";

export function makeToken(): string {
  return randomBytes(24).toString("base64url");
}
