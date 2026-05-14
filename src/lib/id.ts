// 24-char URL-safe id. Crypto-random, prefix-free.
export function createId(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString("base64url");
}
