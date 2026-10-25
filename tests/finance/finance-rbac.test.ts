import test from "node:test";
import assert from "node:assert/strict";
import { assertRole } from "../../src/lib/auth-guard";
import {
  BatchCrewPayoutSchema,
} from "../../src/schemas/finance-schema";

test("🧪 Testing Tier 2A vs Tier 2B RBAC Guards & Finance Contracts...", () => {
  const ownerSession = {
    userId: "11111111-1111-1111-1111-111111111111",
    email: "dimas@altara.id",
    fullName: "Dimas Suryo",
    role: "OWNER" as const,
    expiresAt: Date.now() + 3600000,
  };

  const managementSession = {
    userId: "22222222-2222-2222-2222-222222222222",
    email: "maya@altara.id",
    fullName: "Maya Kartika",
    role: "MANAGEMENT" as const,
    expiresAt: Date.now() + 3600000,
  };

  const crewSession = {
    userId: "33333333-3333-3333-3333-333333333333",
    email: "rian@altara.id",
    fullName: "Rian Hidayat",
    role: "CREW" as const,
    expiresAt: Date.now() + 3600000,
  };

  // 1. Tier 2A (Batch Honor Kru): Both OWNER and MANAGEMENT allowed
  const t2aOwner = assertRole(ownerSession, ["OWNER", "MANAGEMENT"]);
  assert.equal(t2aOwner.success, true, "Owner should access Tier 2A");

  const t2aManagement = assertRole(managementSession, ["OWNER", "MANAGEMENT"]);
  assert.equal(t2aManagement.success, true, "Management (Maya) should access Tier 2A");

  const t2aCrew = assertRole(crewSession, ["OWNER", "MANAGEMENT"]);
  assert.equal(t2aCrew.success, false, "Crew must be blocked from Tier 2A");

  // 2. Tier 2B (Dapur Bisnis / Margins): OWNER ONLY (Dimas Exclusive)
  const t2bOwner = assertRole(ownerSession, ["OWNER"]);
  assert.equal(t2bOwner.success, true, "Owner (Dimas) must access Tier 2B");

  const t2bManagement = assertRole(managementSession, ["OWNER"]);
  assert.equal(t2bManagement.success, false, "Management (Maya) must be BLOCKED from Tier 2B");

  const t2bCrew = assertRole(crewSession, ["OWNER"]);
  assert.equal(t2bCrew.success, false, "Crew must be BLOCKED from Tier 2B");

  // 3. Schema validation: BatchCrewPayoutSchema
  const validBatch = BatchCrewPayoutSchema.safeParse({
    payoutIds: [
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    ],
    paymentReference: "BCA-TRF-SENIN-PAGI-001",
  });
  assert.equal(validBatch.success, true, "Valid batch payout schema should pass");

  const emptyBatch = BatchCrewPayoutSchema.safeParse({
    payoutIds: [],
  });
  assert.equal(emptyBatch.success, false, "Empty payoutIds array must be rejected");

  console.log("✅ Tier 2A & Tier 2B RBAC Access Guards and Schemas verified!");
});
