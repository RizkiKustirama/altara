import test from "node:test";
import assert from "node:assert/strict";
import type { PublicPortalDTO } from "../../src/types/public-portal-dto";

test("🧪 Testing Public Portal DTO Sanitization & Zero Financial Leak...", () => {
  const mockPortalData: PublicPortalDTO = {
    projectName: "The Wedding of Bella & Kevin",
    clientGroomName: "Kevin Sanjaya",
    clientBrideName: "Bella Clarissa",
    weddingDate: "2026-11-20",
    venueName: "Grand Ballroom Hotel Mulia Senayan",
    venueAddress: "Jl. Asia Afrika, Senayan, Jakarta",
    leadPlannerName: "Sarah Amalia",
    status: "PLANNING",
    weddingDateTimestamp: new Date("2026-11-20T08:00:00Z").getTime(),
    preparationProgress: {
      totalMilestones: 8,
      completedMilestones: 6,
      percentage: 75,
    },
    confirmedVendors: [
      { category: "VENUE", vendorName: "Hotel Mulia", status: "CONFIRMED" },
      { category: "CATERING", vendorName: "Puspa Catering", status: "CONFIRMED" },
    ],
    rundownHighlights: [
      { orderIndex: 1, startTime: "08:00", endTime: "09:00", title: "Akad Nikah" },
    ],
  };

  // 1. Check prohibited financial keys
  const serialized = JSON.stringify(mockPortalData);
  const prohibitedFinancialKeys = [
    "contractAmount",
    "budget",
    "profit",
    "margin",
    "cost",
    "price",
    "invoice",
    "milestoneAmount",
    "totalAllocated",
    "totalVendorPaid",
  ];

  for (const key of prohibitedFinancialKeys) {
    assert.equal(
      serialized.includes(`"${key}"`),
      false,
      `PublicPortalDTO must never contain financial property: "${key}"`
    );
  }

  // 2. Check prohibited personal telephone keys
  const prohibitedContactKeys = ["phone", "picPhone", "rawPhone", "holderPhone"];
  for (const key of prohibitedContactKeys) {
    assert.equal(
      serialized.includes(`"${key}"`),
      false,
      `PublicPortalDTO must never expose personal phone numbers: "${key}"`
    );
  }

  // 3. Verify public presentation data
  assert.equal(mockPortalData.clientBrideName, "Bella Clarissa");
  assert.equal(mockPortalData.confirmedVendors.length, 2);
  assert.equal(mockPortalData.preparationProgress.percentage, 75);

  console.log("✅ Zero Financial Leak & Zero Personal Phone Leak verified for Public Portal!");
});
