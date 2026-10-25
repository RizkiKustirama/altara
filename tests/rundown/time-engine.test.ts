import assert from "node:assert/strict";
import {
  parseTimeToMinutes,
  formatMinutesToTime,
  calculateDurationMinutes,
  addMinutesToTime,
  propagateRundownTimes,
} from "../../src/services/rundown-service";

console.log("🧪 Testing Time Propagation Engine & Helper functions...");

// 1. Test parseTimeToMinutes
assert.equal(parseTimeToMinutes("08:00:00"), 480, "08:00:00 should be 480 minutes");
assert.equal(parseTimeToMinutes("08:30"), 510, "08:30 should be 510 minutes");
assert.equal(parseTimeToMinutes("00:00:00"), 0, "00:00:00 should be 0 minutes");
assert.equal(parseTimeToMinutes("23:59:00"), 1439, "23:59:00 should be 1439 minutes");
console.log("✅ parseTimeToMinutes works for various formats");

// 2. Test formatMinutesToTime
assert.equal(formatMinutesToTime(480), "08:00:00", "480 minutes should format to 08:00:00");
assert.equal(formatMinutesToTime(510), "08:30:00", "510 minutes should format to 08:30:00");
assert.equal(formatMinutesToTime(0), "00:00:00", "0 minutes should format to 00:00:00");
assert.equal(formatMinutesToTime(1439), "23:59:00", "1439 minutes should format to 23:59:00");
assert.equal(formatMinutesToTime(510, false), "08:30", "510 minutes without seconds should format to 08:30");
console.log("✅ formatMinutesToTime formats cleanly");

// 3. Test calculateDurationMinutes
assert.equal(calculateDurationMinutes("07:00:00", "08:00:00"), 60, "07:00 to 08:00 should be 60 mins");
assert.equal(calculateDurationMinutes("08:00:00", "08:30:00"), 30, "08:00 to 08:30 should be 30 mins");
assert.equal(calculateDurationMinutes("08:30:00", "09:45:00"), 75, "08:30 to 09:45 should be 75 mins");
console.log("✅ calculateDurationMinutes computes accurate durations");

// 4. Test addMinutesToTime
assert.equal(addMinutesToTime("08:00:00", 30), "08:30:00");
assert.equal(addMinutesToTime("08:45:00", 30), "09:15:00");
assert.equal(addMinutesToTime("09:00:00", -15), "08:45:00");
console.log("✅ addMinutesToTime adds and subtracts offsets correctly");

// 5. Test propagateRundownTimes (sequential propagation)
const sampleItems = [
  { id: "1", orderIndex: 0, startTime: "07:00:00", endTime: "08:00:00", title: "Rias CPW" }, // 60m
  { id: "2", orderIndex: 1, startTime: "08:00:00", endTime: "08:30:00", title: "Mapag Penganten" }, // 30m
  { id: "3", orderIndex: 2, startTime: "08:30:00", endTime: "09:30:00", title: "Akad Nikah" }, // 60m
  { id: "4", orderIndex: 3, startTime: "09:30:00", endTime: "10:15:00", title: "Sungkeman" }, // 45m
];

// Scenario A: Standard recalculation from existing times
const propagatedA = propagateRundownTimes(sampleItems);
assert.equal(propagatedA[0]?.startTime, "07:00:00");
assert.equal(propagatedA[0]?.endTime, "08:00:00");
assert.equal(propagatedA[0]?.durationMinutes, 60);

assert.equal(propagatedA[1]?.startTime, "08:00:00");
assert.equal(propagatedA[1]?.endTime, "08:30:00");
assert.equal(propagatedA[1]?.durationMinutes, 30);

assert.equal(propagatedA[2]?.startTime, "08:30:00");
assert.equal(propagatedA[2]?.endTime, "09:30:00");
assert.equal(propagatedA[2]?.durationMinutes, 60);

assert.equal(propagatedA[3]?.startTime, "09:30:00");
assert.equal(propagatedA[3]?.endTime, "10:15:00");
assert.equal(propagatedA[3]?.durationMinutes, 45);
console.log("✅ Standard sequential propagation verified");

// Scenario B: Item 1 duration changed from 60m to 75m
const modifiedItems = [
  { id: "1", orderIndex: 0, startTime: "07:00:00", endTime: "08:15:00", title: "Rias CPW" }, // 75m
  { id: "2", orderIndex: 1, startTime: "08:00:00", endTime: "08:30:00", title: "Mapag Penganten" }, // 30m
  { id: "3", orderIndex: 2, startTime: "08:30:00", endTime: "09:30:00", title: "Akad Nikah" }, // 60m
  { id: "4", orderIndex: 3, startTime: "09:30:00", endTime: "10:15:00", title: "Sungkeman" }, // 45m
];
const propagatedB = propagateRundownTimes(modifiedItems);
assert.equal(propagatedB[0]?.startTime, "07:00:00");
assert.equal(propagatedB[0]?.endTime, "08:15:00");
assert.equal(propagatedB[0]?.durationMinutes, 75);

// Item 2 now starts at 08:15:00 and lasts 30m -> ends 08:45:00
assert.equal(propagatedB[1]?.startTime, "08:15:00");
assert.equal(propagatedB[1]?.endTime, "08:45:00");
assert.equal(propagatedB[1]?.durationMinutes, 30);

// Item 3 now starts at 08:45:00 and lasts 60m -> ends 09:45:00
assert.equal(propagatedB[2]?.startTime, "08:45:00");
assert.equal(propagatedB[2]?.endTime, "09:45:00");
assert.equal(propagatedB[2]?.durationMinutes, 60);

// Item 4 now starts at 09:45:00 and lasts 45m -> ends 10:30:00
assert.equal(propagatedB[3]?.startTime, "09:45:00");
assert.equal(propagatedB[3]?.endTime, "10:30:00");
assert.equal(propagatedB[3]?.durationMinutes, 45);
console.log("✅ Ripple duration change (60m -> 75m) propagated accurately to all subsequent sessions");

// Scenario C: Custom initialStartTime provided (e.g. whole ceremony moved to 08:00:00)
const propagatedC = propagateRundownTimes(sampleItems, "08:00:00");
assert.equal(propagatedC[0]?.startTime, "08:00:00");
assert.equal(propagatedC[0]?.endTime, "09:00:00");
assert.equal(propagatedC[1]?.startTime, "09:00:00");
assert.equal(propagatedC[1]?.endTime, "09:30:00");
assert.equal(propagatedC[2]?.startTime, "09:30:00");
assert.equal(propagatedC[2]?.endTime, "10:30:00");
assert.equal(propagatedC[3]?.startTime, "10:30:00");
assert.equal(propagatedC[3]?.endTime, "11:15:00");
console.log("✅ Custom initial start time propagation verified");

console.log("🎉 All Time Engine tests PASSED!");
