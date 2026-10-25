import assert from "node:assert/strict";
import {
  CreateRundownItemSchema,
  UpdateRundownItemSchema,
  ReorderRundownSchema,
  ShiftRundownTimeSchema,
  ApplyTemplateSchema,
} from "../../src/schemas/rundown-schema";

console.log("🧪 Testing Rundown Zod schemas and validation contracts...");

const validUuid = "11111111-1111-4111-8111-111111111111";
const validTemplateId = "22222222-2222-4222-8222-222222222222";
const validItemId = "33333333-3333-4333-8333-333333333333";

// 1. CreateRundownItemSchema tests
const validCreate = CreateRundownItemSchema.safeParse({
  projectId: validUuid,
  title: "Akad Nikah",
  description: "Ijab qabul dengan penghulu",
  startTime: "08:30:00",
  endTime: "09:30:00",
  picRole: "LEAD_PLANNER",
  musicCue: "Hening Khidmat",
  lightingCue: "Warm 100%",
  status: "PENDING",
});
assert.ok(validCreate.success, "Valid create payload should pass");
console.log("✅ CreateRundownItemSchema passed for valid payload");

// Reject invalid time string
const invalidTimeCreate = CreateRundownItemSchema.safeParse({
  projectId: validUuid,
  title: "Akad Nikah",
  startTime: "25:99:00", // invalid hour and minute
  endTime: "09:30:00",
});
assert.ok(!invalidTimeCreate.success, "Invalid time format should be rejected");
console.log("✅ Invalid time format (25:99:00) rejected");

// 2. UpdateRundownItemSchema tests
const validUpdate = UpdateRundownItemSchema.safeParse({
  itemId: validItemId,
  projectId: validUuid,
  endTime: "09:45:00",
  propagateRemaining: true,
});
assert.ok(validUpdate.success, "Valid update with propagateRemaining should pass");
console.log("✅ UpdateRundownItemSchema passed for partial update");

// 3. ShiftRundownTimeSchema tests
const validShift = ShiftRundownTimeSchema.safeParse({
  projectId: validUuid,
  startFromIndex: 2,
  deltaMinutes: 15,
});
assert.ok(validShift.success, "Valid shift payload should pass");

const zeroShift = ShiftRundownTimeSchema.safeParse({
  projectId: validUuid,
  startFromIndex: 2,
  deltaMinutes: 0,
});
assert.ok(!zeroShift.success, "Zero delta minutes must be rejected");
console.log("✅ ShiftRundownTimeSchema passed and zero delta rejected");

// 4. ApplyTemplateSchema tests
const validApply = ApplyTemplateSchema.safeParse({
  projectId: validUuid,
  templateId: validTemplateId,
  customStartTime: "08:00:00",
  replaceExisting: true,
});
assert.ok(validApply.success, "Valid apply template payload should pass");
console.log("✅ ApplyTemplateSchema passed for valid payload");

// 5. ReorderRundownSchema tests
const validReorder = ReorderRundownSchema.safeParse({
  projectId: validUuid,
  orderedItemIds: [validItemId, validTemplateId],
});
assert.ok(validReorder.success, "Valid reorder payload should pass");

const emptyReorder = ReorderRundownSchema.safeParse({
  projectId: validUuid,
  orderedItemIds: [],
});
assert.ok(!emptyReorder.success, "Empty item array should be rejected");
console.log("✅ ReorderRundownSchema passed and empty list rejected");

console.log("🎉 All Rundown validation & action contracts PASSED!");
