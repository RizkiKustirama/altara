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

  const managementSession: UserSession = {
    userId: "user-2",
    email: "maya@altara.id",
    fullName: "Maya",
    role: "MANAGEMENT",
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
  const unauthCheck = assertRole(null, ["OWNER", "MANAGEMENT"]);
  if (unauthCheck.success || unauthCheck.error.code !== "UNAUTHORIZED") {
    throw new Error("Null session should yield UNAUTHORIZED");
  }
  console.log("✅ Null session correctly rejected as UNAUTHORIZED");

  // 2. Test Owner accessing Owner-Only Tier 2B -> ALLOWED
  const ownerCheck = assertRole(ownerSession, ["OWNER"]);
  if (!ownerCheck.success) {
    throw new Error("Owner should be allowed on OWNER-only route");
  }
  console.log("✅ Owner successfully allowed on OWNER-only check");

  // 3. Test Management accessing Owner-Only Tier 2B -> FORBIDDEN
  const mgmtTier2Check = assertRole(managementSession, ["OWNER"]);
  if (mgmtTier2Check.success || mgmtTier2Check.error.code !== "FORBIDDEN") {
    throw new Error("Management accessing OWNER-only should yield FORBIDDEN");
  }
  console.log("✅ Management accessing OWNER-only correctly rejected as FORBIDDEN");

  // 4. Test Crew accessing Management/Owner routes -> FORBIDDEN
  const crewAdminCheck = assertRole(crewSession, ["OWNER", "MANAGEMENT"]);
  if (crewAdminCheck.success || crewAdminCheck.error.code !== "FORBIDDEN") {
    throw new Error("Crew accessing Admin should yield FORBIDDEN");
  }
  console.log("✅ Crew accessing Admin routes correctly rejected as FORBIDDEN");

  // 5. Test Management accessing Tier 2A / Tier 1 (Owner & Management) -> ALLOWED
  const mgmtTier1Check = assertRole(managementSession, ["OWNER", "MANAGEMENT"]);
  if (!mgmtTier1Check.success) {
    throw new Error("Management should be allowed on Tier 1 & Tier 2A");
  }
  console.log("✅ Management successfully allowed on Tier 1 & 2A check");

  console.log("🎉 All RBAC Guard tests PASSED!");
}

runAuthGuardTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
