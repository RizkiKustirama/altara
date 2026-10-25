import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { GuidebookDocument } from "../../src/components/pdf/guidebook-template";
import type { GuidebookTMDTO } from "../../src/types/guidebook-dto";

test("🧪 Testing PDF Generation & Streaming Buffer Integrity...", async () => {
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
        durationMinutes: 60,
        title: "Persiapan & Rias Pengantin",
        picRole: "LO_BRIDE",
        musicCue: "Harpa Romantis",
        lightingCue: "Warm Ambient",
      },
      {
        orderIndex: 2,
        timeRange: "08:00 - 08:30",
        durationMinutes: 30,
        title: "Akad Nikah & Ijab Kabul",
        picRole: "MAIN_COORDINATOR",
        musicCue: "Gamelan Khidmat",
        lightingCue: "Spotlight Meja Akad",
      },
    ],
  };

  // 1. Render React PDF component to binary buffer
  const pdfBuffer = await renderToBuffer(
    React.createElement(GuidebookDocument, { data: mockGuidebookData }) as any
  );

  // 2. Assert Buffer exists and is non-empty
  assert.ok(pdfBuffer instanceof Buffer || pdfBuffer instanceof Uint8Array);
  assert.ok(pdfBuffer.length > 1000, `PDF buffer should have substantial size (>1KB), got ${pdfBuffer.length} bytes`);

  // 3. Assert PDF Magic Bytes (%PDF-)
  const header = Buffer.from(pdfBuffer).subarray(0, 5).toString("utf-8");
  assert.strictEqual(header, "%PDF-", `Binary buffer must start with PDF magic bytes %PDF-, got: ${header}`);

  console.log(`✅ PDF Generation verified! Rendered valid binary buffer (${pdfBuffer.length} bytes, magic: ${header})`);
});
