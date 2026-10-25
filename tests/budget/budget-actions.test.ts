import assert from "node:assert/strict";
import {
  CreateBudgetCategorySchema,
  UpdateBudgetCategorySchema,
  CreateVendorInvoiceSchema,
  UpdateVendorInvoiceStatusSchema,
  CreatePaymentMilestoneSchema,
  UpdatePaymentMilestoneSchema,
} from "../../src/schemas/budget-schema";

console.log("🧪 Testing Budget Zod schemas and Server Actions contracts...");

const validProjectId = "66666666-6666-4666-8666-666666666666";
const validBudgetId = "77777777-7777-4777-8777-777777777777";
const validVendorSlotId = "88888888-8888-4888-8888-888888888888";
const validInvoiceId = "99999999-9999-4999-8999-999999999999";
const validMilestoneId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

// 1. CreateBudgetCategorySchema & Update
const validBudgetCreate = CreateBudgetCategorySchema.safeParse({
  projectId: validProjectId,
  category: "CATERING",
  allocatedAmount: "75000000.00",
  notes: "Menu 800 porsi buffet",
});
assert.ok(validBudgetCreate.success, "Valid budget category payload should pass");

const validBudgetUpdate = UpdateBudgetCategorySchema.safeParse({
  budgetId: validBudgetId,
  projectId: validProjectId,
  allocatedAmount: "80000000",
});
assert.ok(validBudgetUpdate.success, "Valid budget update should pass");

const invalidAmount = CreateBudgetCategorySchema.safeParse({
  projectId: validProjectId,
  category: "CATERING",
  allocatedAmount: "abc",
});
assert.ok(!invalidAmount.success, "Non-numeric allocatedAmount should fail");
console.log("✅ CreateBudgetCategorySchema & Update passed");

// 2. CreateVendorInvoiceSchema & Update
const validInvoiceCreate = CreateVendorInvoiceSchema.safeParse({
  projectId: validProjectId,
  projectVendorId: validVendorSlotId,
  invoiceNumber: "INV/MULIA/2026/001",
  totalAmount: "85000000",
  dueDate: "2026-10-10",
  status: "PENDING",
});
assert.ok(validInvoiceCreate.success, "Valid vendor invoice should pass");

const validInvoiceUpdate = UpdateVendorInvoiceStatusSchema.safeParse({
  projectId: validProjectId,
  invoiceId: validInvoiceId,
  status: "PAID",
});
assert.ok(validInvoiceUpdate.success, "Valid invoice status update should pass");

const invalidDate = CreateVendorInvoiceSchema.safeParse({
  projectId: validProjectId,
  projectVendorId: validVendorSlotId,
  invoiceNumber: "INV/001",
  totalAmount: "5000000",
  dueDate: "10-10-2026", // should be YYYY-MM-DD
});
assert.ok(!invalidDate.success, "Invalid date format should fail");
console.log("✅ CreateVendorInvoiceSchema & Status Update passed");

// 3. CreatePaymentMilestoneSchema & Update
const validMilestoneCreate = CreatePaymentMilestoneSchema.safeParse({
  projectId: validProjectId,
  title: "DP 1 (Booking Acara)",
  amount: "50000000",
  dueDate: "2026-05-01",
  status: "PAID",
  paidDate: "2026-05-01",
});
assert.ok(validMilestoneCreate.success, "Valid payment milestone should pass");

const validMilestoneUpdate = UpdatePaymentMilestoneSchema.safeParse({
  projectId: validProjectId,
  milestoneId: validMilestoneId,
  status: "PAID",
  paidDate: "2026-05-02",
});
assert.ok(validMilestoneUpdate.success, "Valid milestone update should pass");

const invalidMilestoneStatus = CreatePaymentMilestoneSchema.safeParse({
  projectId: validProjectId,
  title: "DP 1",
  amount: "50000000",
  dueDate: "2026-05-01",
  status: "COMPLETED", // not a valid paymentStatus
});
assert.ok(!invalidMilestoneStatus.success, "Invalid payment status should fail");
console.log("✅ CreatePaymentMilestoneSchema & Update passed");

console.log("🎉 All Budget Action contract tests PASSED!");
