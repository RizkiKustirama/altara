import assert from "node:assert/strict";
import {
  calculateTemplateItemOffsets,
  TemplateItemClonerInput,
} from "../../src/services/template-service";

console.log("🧪 Testing Procession Template Duplication & Offset Calculator...");

const sampleTemplateItems: TemplateItemClonerInput[] = [
  {
    orderIndex: 0,
    startTime: "07:00:00",
    endTime: "08:00:00",
    title: "Persiapan & Final Touch Rias",
    description: "MUA standby di kamar pengantin wanita",
    picRole: "LO_BRIDE",
    musicCue: "Harpa Romantis",
    lightingCue: "Warm Light",
  },
  {
    orderIndex: 1,
    startTime: "08:00:00",
    endTime: "08:30:00",
    title: "Mapag Penganten",
    description: "Penyambutan rombongan CPP",
    picRole: "LO_GROOM",
    musicCue: "Gamelan Degung",
    lightingCue: "Spotlight",
  },
  {
    orderIndex: 2,
    startTime: "08:30:00",
    endTime: "09:30:00",
    title: "Akad Nikah",
    description: "Ijab qabul & penyerahan mahar",
    picRole: "LEAD_PLANNER",
    musicCue: "Hening Khidmat",
    lightingCue: "Focus Light",
  },
];

// 1. Test cloning without custom start time (retains default template schedule)
const clonedDefault = calculateTemplateItemOffsets(sampleTemplateItems);
assert.equal(clonedDefault.length, 3);
assert.equal(clonedDefault[0]?.startTime, "07:00:00");
assert.equal(clonedDefault[0]?.endTime, "08:00:00");
assert.equal(clonedDefault[0]?.title, "Persiapan & Final Touch Rias");
assert.equal(clonedDefault[1]?.startTime, "08:00:00");
assert.equal(clonedDefault[1]?.endTime, "08:30:00");
assert.equal(clonedDefault[2]?.startTime, "08:30:00");
assert.equal(clonedDefault[2]?.endTime, "09:30:00");
console.log("✅ Default template item times retained accurately");

// 2. Test cloning with custom start time (+2 hours offset: 07:00 -> 09:00)
const clonedWithOffset = calculateTemplateItemOffsets(sampleTemplateItems, "09:00:00");
assert.equal(clonedWithOffset.length, 3);
// Item 0: was 07:00-08:00 (60m) -> becomes 09:00-10:00
assert.equal(clonedWithOffset[0]?.startTime, "09:00:00");
assert.equal(clonedWithOffset[0]?.endTime, "10:00:00");
assert.equal(clonedWithOffset[0]?.picRole, "LO_BRIDE");
assert.equal(clonedWithOffset[0]?.musicCue, "Harpa Romantis");

// Item 1: was 08:00-08:30 (30m) -> becomes 10:00-10:30
assert.equal(clonedWithOffset[1]?.startTime, "10:00:00");
assert.equal(clonedWithOffset[1]?.endTime, "10:30:00");
assert.equal(clonedWithOffset[1]?.picRole, "LO_GROOM");

// Item 2: was 08:30-09:30 (60m) -> becomes 10:30-11:30
assert.equal(clonedWithOffset[2]?.startTime, "10:30:00");
assert.equal(clonedWithOffset[2]?.endTime, "11:30:00");
assert.equal(clonedWithOffset[2]?.picRole, "LEAD_PLANNER");
console.log("✅ Custom start time (07:00 -> 09:00) shifted entire procession by +120 minutes with perfect fidelity");

// 3. Test earlier start time (-1 hour offset: 07:00 -> 06:00)
const clonedEarlier = calculateTemplateItemOffsets(sampleTemplateItems, "06:00:00");
assert.equal(clonedEarlier[0]?.startTime, "06:00:00");
assert.equal(clonedEarlier[0]?.endTime, "07:00:00");
assert.equal(clonedEarlier[1]?.startTime, "07:00:00");
assert.equal(clonedEarlier[1]?.endTime, "07:30:00");
assert.equal(clonedEarlier[2]?.startTime, "07:30:00");
assert.equal(clonedEarlier[2]?.endTime, "08:30:00");
console.log("✅ Earlier start time shift (07:00 -> 06:00) verified");

console.log("🎉 All Template Service offset calculation tests PASSED!");
