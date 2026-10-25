import type { UserSession } from "@/types/auth";

const SESSION_SECRET =
  process.env.AUTH_SECRET || "super-secret-altara-session-key-for-development-32chars";

// Helper to convert Uint8Array to Base64URL
function toBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Helper to convert Base64URL to Uint8Array
function fromBase64Url(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Import or create crypto HMAC key
async function getCryptoKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SESSION_SECRET);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Sign session data into a compact, cryptographically verifiable token.
 * Format: `<base64url_payload>.<base64url_signature>`
 */
export async function signSessionToken(session: UserSession): Promise<string> {
  const encoder = new TextEncoder();
  const payloadStr = JSON.stringify(session);
  const payloadBytes = encoder.encode(payloadStr);
  const payloadB64 = toBase64Url(payloadBytes);

  const key = await getCryptoKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadB64)
  );
  const signatureB64 = toBase64Url(signatureBuffer);

  return `${payloadB64}.${signatureB64}`;
}

/**
 * Verify a signed session token. Returns UserSession if signature and expiry are valid.
 * Returns null if tampered, malformed, or expired.
 */
export async function verifySessionToken(token: string): Promise<UserSession | null> {
  if (!token || !token.includes(".")) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [payloadB64, signatureB64] = parts;
  if (!payloadB64 || !signatureB64) {
    return null;
  }

  try {
    const encoder = new TextEncoder();
    const key = await getCryptoKey();
    const signatureBytes = fromBase64Url(signatureB64);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      encoder.encode(payloadB64)
    );

    if (!isValid) {
      return null;
    }

    const payloadBytes = fromBase64Url(payloadB64);
    const decoder = new TextDecoder();
    const jsonStr = decoder.decode(payloadBytes);
    const session = JSON.parse(jsonStr) as UserSession;

    // Check expiry
    if (session.expiresAt && session.expiresAt < Date.now()) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}
