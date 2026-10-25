import { signSessionToken, verifySessionToken } from "../../src/lib/session";
import type { UserSession } from "../../src/types/auth";

async function runSessionTest() {
  console.log("🧪 Testing session Web Crypto HMAC signature & verification...");

  const mockSession: UserSession = {
    userId: "123e4567-e89b-12d3-a456-426614174000",
    email: "dimas@altara.id",
    fullName: "Dimas Pratama",
    role: "OWNER",
    expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour in future
  };

  // 1. Sign
  const token = await signSessionToken(mockSession);
  console.log("✅ Token successfully generated:", token.slice(0, 30) + "...");
  if (!token.includes(".")) {
    throw new Error("Token format invalid: missing dot separator");
  }

  // 2. Verify Valid Token
  const verified = await verifySessionToken(token);
  if (!verified) {
    throw new Error("Failed to verify valid session token");
  }
  if (verified.email !== mockSession.email || verified.role !== "OWNER") {
    throw new Error("Decoded payload does not match original session");
  }
  console.log("✅ Valid token successfully verified for:", verified.email, verified.role);

  // 3. Test Tampered Signature Rejection
  const tamperedToken = token.slice(0, -5) + "abcde";
  const tamperedResult = await verifySessionToken(tamperedToken);
  if (tamperedResult !== null) {
    throw new Error("Tampered token was not rejected!");
  }
  console.log("✅ Tampered signature correctly rejected as null");

  // 4. Test Expired Session Rejection
  const expiredSession: UserSession = {
    ...mockSession,
    expiresAt: Date.now() - 1000, // expired 1s ago
  };
  const expiredToken = await signSessionToken(expiredSession);
  const expiredResult = await verifySessionToken(expiredToken);
  if (expiredResult !== null) {
    throw new Error("Expired token was not rejected!");
  }
  console.log("✅ Expired session correctly rejected as null");

  console.log("🎉 All session cryptographic tests PASSED!");
}

runSessionTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
