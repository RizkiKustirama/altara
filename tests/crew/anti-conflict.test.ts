import { db } from "../../src/db";
import { checkCrewAvailability, assignCrewToProject } from "../../src/services/crew-service";

async function runAntiConflictTests() {
  console.log("🧪 Testing Anti-Collision Service & Crew Assignment logic with mocked queries...");

  // Mock data
  const mockUserId = "11111111-1111-1111-1111-111111111111";
  const mockProjectId = "22222222-2222-2222-2222-222222222222";
  const conflictingProjectId = "33333333-3333-3333-3333-333333333333";
  const eventDate = "2026-10-24";

  // 1. Test checkCrewAvailability when crew is free
  (db.query.projectCrews as unknown as { findFirst: unknown }).findFirst = async () => null;

  const freeResult = await checkCrewAvailability(mockUserId, eventDate);
  if (!freeResult.isAvailable) {
    throw new Error("Expected crew to be available when no assignment exists");
  }
  console.log("✅ Crew availability correctly returned isAvailable: true when free");

  // 2. Test checkCrewAvailability when crew has conflict
  (db.query.projectCrews as unknown as { findFirst: unknown }).findFirst = async () => ({
    projectId: conflictingProjectId,
    userId: mockUserId,
    eventDate,
    project: { id: conflictingProjectId, projectName: "The Wedding of Sarah & Reza" },
    user: { fullName: "Rian Hidayat" },
  });

  const conflictResult = await checkCrewAvailability(mockUserId, eventDate);
  if (conflictResult.isAvailable) {
    throw new Error("Expected crew to NOT be available when conflict exists");
  }
  if (conflictResult.conflictingProjectName !== "The Wedding of Sarah & Reza") {
    throw new Error("Conflicting project name did not match expected");
  }
  console.log("✅ Crew collision correctly detected:", conflictResult.conflictingProjectName);

  // 3. Test assignCrewToProject when project NOT_FOUND
  (db.query.projects as unknown as { findFirst: unknown }).findFirst = async () => null;

  const notFoundResult = await assignCrewToProject({
    projectId: mockProjectId,
    userId: mockUserId,
    roleInProject: "LEAD_PLANNER",
  });

  if (notFoundResult.success || notFoundResult.error.code !== "NOT_FOUND") {
    throw new Error("Expected NOT_FOUND error when project does not exist");
  }
  console.log("✅ assignCrewToProject returned NOT_FOUND as expected");

  // 4. Test assignCrewToProject with schedule conflict
  (db.query.projects as unknown as { findFirst: unknown }).findFirst = async () => ({
    id: mockProjectId,
    weddingDate: eventDate,
    projectName: "The Wedding of Bella & Kevin",
  });
  // Mock conflict in projectCrews
  (db.query.projectCrews as unknown as { findFirst: unknown }).findFirst = async () => ({
    projectId: conflictingProjectId,
    userId: mockUserId,
    eventDate,
    project: { id: conflictingProjectId, projectName: "The Wedding of Sarah & Reza" },
    user: { fullName: "Rian Hidayat" },
  });

  const conflictAssignResult = await assignCrewToProject({
    projectId: mockProjectId,
    userId: mockUserId,
    roleInProject: "LEAD_PLANNER",
  });

  if (conflictAssignResult.success) {
    throw new Error("Expected assignCrewToProject to fail with CONFLICT_SCHEDULE");
  }
  if (conflictAssignResult.error.code !== "CONFLICT_SCHEDULE") {
    throw new Error(`Expected CONFLICT_SCHEDULE, got: ${conflictAssignResult.error.code}`);
  }
  if (!conflictAssignResult.error.message.includes("Rian Hidayat")) {
    throw new Error("Error message should mention crew member's name");
  }
  console.log("✅ assignCrewToProject successfully blocked collision:", conflictAssignResult.error.message);

  console.log("🎉 All Anti-Collision service tests passed successfully!");
}

runAntiConflictTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
