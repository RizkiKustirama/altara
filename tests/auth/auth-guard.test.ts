import { assertRole } from "../../src/lib/auth-guard";
import type { UserSession } from "../../src/types/auth";

async function runAuthGuardTests() {
  console.log("🧪 Testing RBAC Guard assertRole...");

  const ownerSession: UserSession = {
    userId: "user-1",
    email: "dimas@altara.id",
    fullName: "Dimas",
    role: "OWNER",
    expiresAt: Date.now() + 100000,
  };

  const plannerSession: UserSession = {
    userId: "user-2",
    email: "sarah@altara.id",
    fullName: "Sarah",
    role: "PLANNER",
    expiresAt: Date.now() + 100000,
  };

  const crewSession: UserSession = {
    userId: "user-3",
    email: "rian@altara.id",
    fullName: "Rian",
    role: "CREW",
    expiresAt: Date.now() + 100000,
  };

  // 1. Test null session -> UNAUTHORIZED
  const unauthCheck = assertRole(null, ["OWNER", "PLANNER"]);
  if (unauthCheck.success || unauthCheck.error.code !== "UNAUTHORIZED") {
    throw new Error("Null session should yield UNAUTHORIZED");
  }
  console.log("✅ Null session correctly rejected as UNAUTHORIZED");

  // 2. Test Owner accessing Owner-Only Tier 2
  const ownerCheck = assertRole(ownerSession, ["OWNER"]);
  if (!ownerCheck.success) {
    throw new Error("Owner should be allowed on OWNER-only route");
  }
  console.log("✅ Owner successfully allowed on OWNER-only check");

  // 3. Test Planner accessing Owner-Only Tier 2 -> FORBIDDEN
  const plannerTier2Check = assertRole(plannerSession, ["OWNER"]);
  if (plannerTier2Check.success || plannerTier2Check.error.code !== "FORBIDDEN") {
    throw new Error("Planner accessing OWNER-only should yield FORBIDDEN");
  }
  console.log("✅ Planner accessing OWNER-only correctly rejected as FORBIDDEN");

  // 4. Test Crew accessing Admin -> FORBIDDEN
  const crewAdminCheck = assertRole(crewSession, ["OWNER", "PLANNER"]);
  if (crewAdminCheck.success || crewAdminCheck.error.code !== "FORBIDDEN") {
    throw new Error("Crew accessing Admin should yield FORBIDDEN");
  }
  console.log("✅ Crew accessing Admin routes correctly rejected as FORBIDDEN");

  // 5. Test Planner accessing Tier 1 (Owner & Planner) -> ALLOWED
  const plannerTier1Check = assertRole(plannerSession, ["OWNER", "PLANNER"]);
  if (!plannerTier1Check.success) {
    throw new Error("Planner should be allowed on Tier 1");
  }
  console.log("✅ Planner successfully allowed on Tier 1 check");

  console.log("🎉 All RBAC Guard tests PASSED!");
}

runAuthGuardTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
