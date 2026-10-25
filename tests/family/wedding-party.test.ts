import assert from "node:assert/strict";
import {
  CreateWeddingPartyMemberSchema,
  UpdateWeddingPartyMemberSchema,
  DeleteWeddingPartyMemberSchema,
} from "../../src/schemas/wedding-party-schema";

console.log("🧪 Testing Wedding Party (Family / VIP) schemas & validation...");

const validProjectId = "44444444-4444-4444-8444-444444444444";
const validMemberId = "55555555-5555-4555-8555-555555555555";

// 1. CreateWeddingPartyMemberSchema test
const validCreate = CreateWeddingPartyMemberSchema.safeParse({
  projectId: validProjectId,
  name: "Bambang Soedarmono",
  relationship: "AYAH_CPW",
  phone: "081234567890",
  ceremonialRole: "Wali Nikah & Ijab",
  notes: "Duduk di sebelah kanan meja akad",
});
assert.ok(validCreate.success, "Valid create family member payload should pass");
console.log("✅ CreateWeddingPartyMemberSchema passed for valid payload");

// Reject missing name
const invalidName = CreateWeddingPartyMemberSchema.safeParse({
  projectId: validProjectId,
  name: "B",
  relationship: "AYAH_CPW",
});
assert.ok(!invalidName.success, "Name shorter than 2 chars should fail");
console.log("✅ Short name rejected");

// Reject invalid relationship
const invalidRel = CreateWeddingPartyMemberSchema.safeParse({
  projectId: validProjectId,
  name: "Bambang Soedarmono",
  relationship: "TETANGGA_JAUH",
});
assert.ok(!invalidRel.success, "Unknown relationship should fail");
console.log("✅ Invalid relationship enum rejected");

// 2. UpdateWeddingPartyMemberSchema test
const validUpdate = UpdateWeddingPartyMemberSchema.safeParse({
  id: validMemberId,
  projectId: validProjectId,
  ceremonialRole: "Saksi Utama",
});
assert.ok(validUpdate.success, "Valid update should pass");
console.log("✅ UpdateWeddingPartyMemberSchema passed for partial payload");

// 3. DeleteWeddingPartyMemberSchema test
const validDelete = DeleteWeddingPartyMemberSchema.safeParse({
  id: validMemberId,
  projectId: validProjectId,
});
assert.ok(validDelete.success, "Valid delete should pass");
console.log("✅ DeleteWeddingPartyMemberSchema passed");

console.log("🎉 All Wedding Party tests PASSED!");
