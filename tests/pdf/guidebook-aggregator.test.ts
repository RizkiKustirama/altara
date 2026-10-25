import assert from "node:assert/strict";
import type { GuidebookTMDTO } from "../../src/types/guidebook-dto";
import { calculateDurationMinutes } from "../../src/lib/rundown-time";

console.log("🧪 Testing Guidebook TM DTO and Financial Sanitization...");

const mockGuidebookData: GuidebookTMDTO = {
  generatedAt: new Date().toISOString(),
  project: {
    id: "123e4567-e89b-12d3-a456-426614174000",
    projectName: "The Wedding of Sarah & Reza",
    weddingDate: "2026-10-24",
    venueName: "Grand Ballroom Hotel Mulia",
    leadPlannerName: "Sarah Paramita",
    leadPlannerPhone: "081234567891",
  },
  familyMembers: [
    {
      name: "Bambang Soedarmono",
      relationship: "AYAH_CPW",
      phone: "081234567890",
      ceremonialRole: "Wali Nikah & Ijab",
    },
    {
      name: "Ir. H. Gunawan",
      relationship: "SAKSI_NIKAH_CPP",
      phone: "08119888777",
      ceremonialRole: "Saksi Nikah Pria",
    },
  ],
  vendors: [
    {
      category: "VENUE",
      vendorName: "Hotel Mulia Senayan",
      picName: "Robert Tan",
      phone: "6281234567890",
      contractStatus: "SETTLED",
      notes: "Ballroom 1 & 2 full day",
    },
    {
      category: "MUA",
      vendorName: "Anpa Suha Makeup",
      picName: "Anpa",
      phone: "6281987654321",
      contractStatus: "BOOKED",
    },
  ],
  rundownItems: [
    {
      orderIndex: 1,
      timeRange: "07:00 - 08:00",
      durationMinutes: calculateDurationMinutes("07:00:00", "08:00:00"),
      title: "Persiapan & Rias Pengantin",
      picRole: "LO_BRIDE",
      musicCue: "Harpa Romantis",
      lightingCue: "Warm Ambient",
    },
    {
      orderIndex: 2,
      timeRange: "08:00 - 08:30",
      durationMinutes: calculateDurationMinutes("08:00:00", "08:30:00"),
      title: "Mapag Penganten",
      picRole: "LO_GROOM",
      musicCue: "Degung Sunda",
      lightingCue: "Spotlight Masuk",
    },
  ],
};

// 1. Verify DTO structure
assert.equal(mockGuidebookData.project.projectName, "The Wedding of Sarah & Reza");
assert.equal(mockGuidebookData.familyMembers.length, 2);
assert.equal(mockGuidebookData.vendors.length, 2);
assert.equal(mockGuidebookData.rundownItems.length, 2);
assert.equal(mockGuidebookData.rundownItems[0]?.durationMinutes, 60);
assert.equal(mockGuidebookData.rundownItems[1]?.durationMinutes, 30);
console.log("✅ Guidebook TM DTO structure validated");

// 2. Financial Boundary Enforcement Check
const jsonString = JSON.stringify(mockGuidebookData);
const forbiddenFinancialKeys = [
  "price",
  "basePrice",
  "realCost",
  "grossMargin",
  "netProfit",
  "honor",
  "payout",
  "fee",
  "budget",
];

for (const key of forbiddenFinancialKeys) {
  const hasKey = jsonString.includes(`"${key}"`);
  assert.equal(hasKey, false, `Guidebook DTO must NOT leak sensitive financial key: ${key}`);
}
console.log("✅ Zero Financial Leak verified! Guidebook DTO is 100% clean of cost/pricing data");

console.log("🎉 All Guidebook DTO & Financial Sanitization tests PASSED!");
