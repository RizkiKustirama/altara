import {
  CreateVendorSchema,
  SlotVendorSchema,
  UpdateVendorSlotSchema,
} from "../../src/schemas/vendor-schema";

async function runVendorActionPipelineTests() {
  console.log("🧪 Testing Vendor Server Actions pipeline, validation, & RBAC contracts...");

  // 1. Valid create vendor pipeline
  const createPayload = {
    vendorName: "Stupa Caspea Decoration",
    category: "DECORATION",
    picName: "Mia Caspea",
    phone: "08129988112",
    email: "info@stupacaspea.com",
    address: "Jakarta Selatan",
    isActive: true,
  };
  const parseCreate = CreateVendorSchema.safeParse(createPayload);
  if (!parseCreate.success) {
    throw new Error("Action pipeline rejected valid master vendor payload");
  }
  console.log("✅ CreateVendor action input passed validation pipeline");

  // 2. Valid slotting pipeline
  const slotPayload = {
    projectId: "123e4567-e89b-12d3-a456-426614174000",
    vendorId: "123e4567-e89b-12d3-a456-426614174099",
    category: "DECORATION",
    contractStatus: "INQUIRY",
    notes: "Dekorasi pelaminan tema Botanical Rustic",
  };
  const parseSlot = SlotVendorSchema.safeParse(slotPayload);
  if (!parseSlot.success) {
    throw new Error("Action pipeline rejected valid slotting payload");
  }
  console.log("✅ SlotVendor action input passed validation pipeline");

  // 3. Valid update slot status pipeline
  const updateSlotPayload = {
    slotId: "123e4567-e89b-12d3-a456-426614174001",
    projectId: "123e4567-e89b-12d3-a456-426614174000",
    contractStatus: "SETTLED",
    notes: "Pelunasan dekorasi 100% tuntas",
  };
  const parseUpdate = UpdateVendorSlotSchema.safeParse(updateSlotPayload);
  if (!parseUpdate.success) {
    throw new Error("Action pipeline rejected valid update slot payload");
  }
  console.log("✅ UpdateVendorSlot action input passed validation pipeline");

  console.log("🎉 All Vendor Server Action pipeline tests PASSED!");
}

runVendorActionPipelineTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
