import test from "node:test";
import assert from "node:assert/strict";
import {
  CreateSacredItemSchema,
  UpdateSacredItemStatusSchema,
} from "../../src/schemas/logistics-schema";

test("🧪 Testing Sacred Belongings Logistics schemas and transitions...", () => {
  const validPayload = {
    projectId: "11111111-2222-3333-4444-555555555555",
    itemName: "Kotak Cincin Berlian",
    currentLocation: "Kamar Pengantin Suite 802",
    status: "NOT_RECEIVED" as const,
    notes: "Wajib diserahkan ke LO Pengantin saat tukar cincin",
  };

  const parsed = CreateSacredItemSchema.safeParse(validPayload);
  assert.equal(parsed.success, true, "Valid sacred item payload should parse cleanly");

  // Invalid UUID
  const invalidUuid = CreateSacredItemSchema.safeParse({
    ...validPayload,
    projectId: "not-a-uuid",
  });
  assert.equal(invalidUuid.success, false, "Invalid UUID should fail");

  // Status transition to WITH_CREW
  const step2Update = UpdateSacredItemStatusSchema.safeParse({
    projectId: "11111111-2222-3333-4444-555555555555",
    itemId: "22222222-3333-4444-5555-666666666666",
    status: "WITH_CREW",
    currentLocation: "Dibawa Rian (Koordinator Lapangan)",
  });
  assert.equal(step2Update.success, true, "Transition to WITH_CREW should be valid");

  // Status transition to AT_STAGE
  const step3Update = UpdateSacredItemStatusSchema.safeParse({
    projectId: "11111111-2222-3333-4444-555555555555",
    itemId: "22222222-3333-4444-5555-666666666666",
    status: "AT_STAGE",
    currentLocation: "Meja Akad / Samping Saksi",
  });
  assert.equal(step3Update.success, true, "Transition to AT_STAGE should be valid");

  // Status transition to RETURNED_TO_FAMILY
  const step4Update = UpdateSacredItemStatusSchema.safeParse({
    projectId: "11111111-2222-3333-4444-555555555555",
    itemId: "22222222-3333-4444-5555-666666666666",
    status: "RETURNED_TO_FAMILY",
    currentLocation: "Diserahkan ke Ibu Pengantin",
  });
  assert.equal(step4Update.success, true, "Transition to RETURNED_TO_FAMILY should be valid");

  console.log("✅ All Sacred Belongings schemas and state transitions PASSED!");
});
