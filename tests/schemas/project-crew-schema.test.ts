import { CreateProjectSchema, UpdateProjectSchema } from "../../src/schemas/project-schema";
import { AssignCrewSchema, RemoveCrewSchema } from "../../src/schemas/crew-schema";

async function runSchemaTests() {
  console.log("🧪 Testing Project & Crew Zod validation schemas...");

  // 1. Valid Create Project
  const validProject = CreateProjectSchema.safeParse({
    projectName: "The Wedding of Bella & Kevin",
    clientGroomName: "Kevin Sanjaya",
    clientBrideName: "Bella Clarissa",
    weddingDate: "2026-10-24",
    venueName: "Grand Ballroom Hotel Mulia",
    venueAddress: "Jl. Asia Afrika Senayan Jakarta",
    contractAmount: 150000000,
  });
  if (!validProject.success) {
    throw new Error("Valid project schema rejected: " + JSON.stringify(validProject.error));
  }
  console.log("✅ Valid project schema passed");

  // 2. Invalid Date format rejection
  const invalidDateProject = CreateProjectSchema.safeParse({
    projectName: "Project Test",
    clientGroomName: "Groom",
    clientBrideName: "Bride",
    weddingDate: "24-10-2026", // Wrong format: must be YYYY-MM-DD
    venueName: "Venue Test",
    contractAmount: 10000000,
  });
  if (invalidDateProject.success) {
    throw new Error("Invalid date format was accepted!");
  }
  console.log("✅ Invalid weddingDate correctly rejected");

  // 3. Negative Contract Amount rejection
  const negativeAmountProject = CreateProjectSchema.safeParse({
    projectName: "Negative Test",
    clientGroomName: "Groom",
    clientBrideName: "Bride",
    weddingDate: "2026-10-24",
    venueName: "Venue Test",
    contractAmount: -50000,
  });
  if (negativeAmountProject.success) {
    throw new Error("Negative contractAmount was accepted!");
  }
  console.log("✅ Negative contractAmount correctly rejected");

  // 4. Valid Assign Crew
  const validCrew = AssignCrewSchema.safeParse({
    projectId: "123e4567-e89b-12d3-a456-426614174000",
    userId: "123e4567-e89b-12d3-a456-426614174001",
    roleInProject: "LEAD_PLANNER",
    shiftStart: "06:00",
    shiftEnd: "15:00",
  });
  if (!validCrew.success) {
    throw new Error("Valid crew assignment schema rejected: " + JSON.stringify(validCrew.error));
  }
  console.log("✅ Valid crew assignment passed");

  // 5. Invalid Shift Time format rejection
  const invalidTimeCrew = AssignCrewSchema.safeParse({
    projectId: "123e4567-e89b-12d3-a456-426614174000",
    userId: "123e4567-e89b-12d3-a456-426614174001",
    roleInProject: "RUNNER",
    shiftStart: "25:99", // Invalid time
  });
  if (invalidTimeCrew.success) {
    throw new Error("Invalid shift time was accepted!");
  }
  console.log("✅ Invalid shift time correctly rejected");

  // 6. Valid Remove Crew
  const validRemove = RemoveCrewSchema.safeParse({
    assignmentId: "123e4567-e89b-12d3-a456-426614174000",
    projectId: "123e4567-e89b-12d3-a456-426614174001",
  });
  if (!validRemove.success) {
    throw new Error("Valid remove crew schema rejected: " + JSON.stringify(validRemove.error));
  }
  console.log("✅ Valid remove crew schema passed");

  // 7. Valid Update Project
  const validUpdate = UpdateProjectSchema.safeParse({
    id: "123e4567-e89b-12d3-a456-426614174000",
    status: "READY",
  });
  if (!validUpdate.success) {
    throw new Error("Valid update project schema rejected: " + JSON.stringify(validUpdate.error));
  }
  console.log("✅ Valid update project schema passed");

  console.log("🎉 All Project & Crew schema tests passed successfully!");
}

runSchemaTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
