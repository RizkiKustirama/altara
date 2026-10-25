import {
  sanitizeIndonesianPhone,
  generateVendorTmWhatsappUrl,
  generatePaymentReminderWhatsappUrl,
  generateDirectWhatsappUrl,
} from "../../src/lib/whatsapp";

async function runWhatsappHelperTests() {
  console.log("🧪 Testing WhatsApp Phone Sanitization & Deep-Link Generator...");

  // 1. Test standard 08... format
  const sanitized1 = sanitizeIndonesianPhone("081234567890");
  if (sanitized1 !== "6281234567890") {
    throw new Error(`Expected "6281234567890", got "${sanitized1}"`);
  }
  console.log("✅ 08... standard phone successfully converted to 628...");

  // 2. Test international format with spaces and plus
  const sanitized2 = sanitizeIndonesianPhone("+62 812-3456-7890");
  if (sanitized2 !== "6281234567890") {
    throw new Error(`Expected "6281234567890", got "${sanitized2}"`);
  }
  console.log("✅ +62 812-... formatted phone successfully sanitized to 628...");

  // 3. Test short prefix 8...
  const sanitized3 = sanitizeIndonesianPhone("81234567890");
  if (sanitized3 !== "6281234567890") {
    throw new Error(`Expected "6281234567890", got "${sanitized3}"`);
  }
  console.log("✅ 8... prefix phone successfully converted to 628...");

  // 4. Test generateVendorTmWhatsappUrl
  const tmUrl = generateVendorTmWhatsappUrl({
    vendorPicName: "Robert",
    vendorName: "Hotel Mulia",
    clientNames: "The Wedding of Bella & Kevin",
    meetingDate: "2026-10-10",
    meetingTime: "14:00",
    venueName: "Grand Ballroom Hotel Mulia",
    rawPhone: "081234567890",
  });

  if (!tmUrl.startsWith("https://wa.me/6281234567890?text=")) {
    throw new Error(`Generated URL prefix invalid: ${tmUrl}`);
  }
  if (!tmUrl.includes("Technical%20Meeting") && !tmUrl.includes("Technical+Meeting")) {
    throw new Error("Message text not properly URL-encoded");
  }
  console.log("✅ TM invitation URL generated and encoded correctly:", tmUrl.substring(0, 70) + "...");

  // 5. Test generatePaymentReminderWhatsappUrl
  const reminderUrl = generatePaymentReminderWhatsappUrl({
    clientName: "Bella Clarissa",
    milestoneTitle: "DP 1 Termin Venue",
    amountRupiah: "50.000.000",
    dueDate: "2026-08-01",
    rawPhone: "08119888777",
  });

  if (!reminderUrl.startsWith("https://wa.me/628119888777?text=")) {
    throw new Error(`Generated reminder URL invalid: ${reminderUrl}`);
  }
  console.log("✅ Payment reminder URL generated successfully:", reminderUrl.substring(0, 70) + "...");

  // 6. Test direct link
  const direct = generateDirectWhatsappUrl("+62812-999-000", "Halo Vendor");
  if (!direct.startsWith("https://wa.me/62812999000?text=Halo%20Vendor")) {
    throw new Error(`Direct link failed: ${direct}`);
  }
  console.log("✅ Direct WhatsApp URL generated correctly");

  console.log("🎉 All WhatsApp helper tests PASSED!");
}

runWhatsappHelperTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
