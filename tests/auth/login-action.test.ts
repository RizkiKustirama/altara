import { LoginSchema } from "../../src/schemas/auth-schema";

async function runAuthActionTests() {
  console.log("🧪 Testing Auth Schema validation and error handling...");

  // 1. Test validation error (empty email / short password)
  const invalidResult = LoginSchema.safeParse({ email: "invalid-email", password: "123" });
  if (invalidResult.success) {
    throw new Error("Validation should fail for invalid email and short password");
  }
  console.log("✅ Invalid email and short password rejected as expected:", invalidResult.error.flatten().fieldErrors);

  // 2. Test valid input schema
  const validResult = LoginSchema.safeParse({ email: "dimas@altara.id", password: "password123" });
  if (!validResult.success) {
    throw new Error("Validation should pass for valid email and password");
  }
  console.log("✅ Valid input schema passed parsing:", validResult.data);

  console.log("🎉 Auth Schema tests PASSED!");
}

runAuthActionTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
