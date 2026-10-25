import { nanoid } from "nanoid";
import { CreateProjectSchema } from "../../src/schemas/project-schema";
import { AssignCrewSchema, RemoveCrewSchema } from "../../src/schemas/crew-schema";

async function runProjectActionContractTests() {
  console.log("🧪 Testing Project & Crew action helper contracts and validation pipelines...");

  // 1. Verify nanoid URL-safe 21 chars generation
  const publicToken = nanoid(21);
  if (publicToken.length !== 21) {
    throw new Error(`Expected token length 21, got ${publicToken.length}`);
  }
  if (!/^[A-Za-z0-9_-]+$/.test(publicToken)) {
    throw new Error(`Token contains invalid characters: ${publicToken}`);
  }
  console.log("✅ Public token generated matching contract:", publicToken);

  // 2. Verify CreateProject validation pipeline in Action
  const validCreatePayload = {
    projectName: "The Wedding of Bella & Kevin",
    clientGroomName: "Kevin Sanjaya",
    clientBrideName: "Bella Clarissa",
    weddingDate: "2026-10-24",
    venueName: "Grand Ballroom Hotel Mulia",
    contractAmount: 150000000,
  };
  const parseCreate = CreateProjectSchema.safeParse(validCreatePayload);
  if (!parseCreate.success) {
    throw new Error("Validation pipeline rejected valid project payload");
  }
  console.log("✅ Project creation schema validated for Action input");

  // 3. Verify AssignCrew validation pipeline in Action
  const validAssignPayload = {
    projectId: "123e4567-e89b-12d3-a456-426614174000",
    userId: "123e4567-e89b-12d3-a456-426614174001",
    roleInProject: "LEAD_PLANNER",
    shiftStart: "06:00",
    shiftEnd: "15:00",
  };
  const parseAssign = AssignCrewSchema.safeParse(validAssignPayload);
  if (!parseAssign.success) {
    throw new Error("Validation pipeline rejected valid assign payload");
  }
  console.log("✅ Crew assignment schema validated for Action input");

  // 4. Verify RemoveCrew validation pipeline in Action
  const validRemovePayload = {
    assignmentId: "123e4567-e89b-12d3-a456-426614174000",
    projectId: "123e4567-e89b-12d3-a456-426614174001",
  };
  const parseRemove = RemoveCrewSchema.safeParse(validRemovePayload);
  if (!parseRemove.success) {
    throw new Error("Validation pipeline rejected valid remove payload");
  }
  console.log("✅ Crew removal schema validated for Action input");

  console.log("🎉 All Action contract and validation tests PASSED!");
}

runProjectActionContractTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
