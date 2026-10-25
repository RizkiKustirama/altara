import {
  CreateVendorSchema,
  UpdateVendorSchema,
  SlotVendorSchema,
  UpdateVendorSlotSchema,
} from "../../src/schemas/vendor-schema";

async function runVendorSchemaAndContractTests() {
  console.log("🧪 Testing Vendor validation schemas and DTO contracts...");

  // 1. Valid CreateVendor payload
  const validCreate = {
    vendorName: "Grand Ballroom Hotel Mulia",
    category: "VENUE",
    picName: "Robert Setiawan",
    phone: "08111222333",
    email: "banquet@hotelmulia.id",
    address: "Jl. Asia Afrika Senayan, Jakarta",
    isActive: true,
  };
  const parseCreate = CreateVendorSchema.safeParse(validCreate);
  if (!parseCreate.success) {
    throw new Error("Valid vendor creation payload rejected");
  }
  console.log("✅ CreateVendorSchema passed for valid vendor payload");

  // 1b. Valid UpdateVendor payload
  const validUpdate = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    picName: "Robert S.",
    phone: "081299998888",
  };
  const parseUpdate = UpdateVendorSchema.safeParse(validUpdate);
  if (!parseUpdate.success) {
    throw new Error("Valid vendor update payload rejected");
  }
  console.log("✅ UpdateVendorSchema passed for partial update payload");

  const invalidCategory = {
    ...validCreate,
    category: "ASTRONAUT", // invalid
  };
  const parseInvalidCat = CreateVendorSchema.safeParse(invalidCategory);
  if (parseInvalidCat.success) {
    throw new Error("Invalid vendor category should have been rejected");
  }
  console.log("✅ Invalid vendor category correctly rejected");

  // 3. Short phone rejected
  const shortPhone = {
    ...validCreate,
    phone: "123", // too short
  };
  const parseShortPhone = CreateVendorSchema.safeParse(shortPhone);
  if (parseShortPhone.success) {
    throw new Error("Short phone number should have been rejected");
  }
  console.log("✅ Short phone number correctly rejected");

  // 4. Valid SlotVendor payload
  const validSlot = {
    projectId: "123e4567-e89b-12d3-a456-426614174000",
    vendorId: "123e4567-e89b-12d3-a456-426614174001",
    category: "CATERING",
    contractStatus: "BOOKED",
    notes: "Paket 800 pax menu Nusantara & Western",
  };
  const parseSlot = SlotVendorSchema.safeParse(validSlot);
  if (!parseSlot.success) {
    throw new Error("Valid vendor slotting payload rejected");
  }
  console.log("✅ SlotVendorSchema passed for valid slotting payload");

  // 5. Valid UpdateVendorSlot payload
  const validSlotUpdate = {
    slotId: "123e4567-e89b-12d3-a456-426614174000",
    projectId: "123e4567-e89b-12d3-a456-426614174001",
    contractStatus: "DP_PAID",
    notes: "DP 30% sudah ditransfer via BCA",
  };
  const parseSlotUpdate = UpdateVendorSlotSchema.safeParse(validSlotUpdate);
  if (!parseSlotUpdate.success) {
    throw new Error("Valid vendor slot update payload rejected");
  }
  console.log("✅ UpdateVendorSlotSchema passed for status update");

  console.log("🎉 All Vendor schema and contract tests PASSED!");
}

runVendorSchemaAndContractTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
