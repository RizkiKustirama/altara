import assert from "node:assert/strict";
import {
  calculateBudgetMetrics,
  formatRupiah,
} from "../../src/lib/budget-math";

console.log("🧪 Testing Wedding Budget Math & Plafon Aggregations...");

// 1. Test formatRupiah
assert.equal(formatRupiah(150000000), "Rp 150.000.000");
assert.equal(formatRupiah(0), "Rp 0");
assert.equal(formatRupiah(50000), "Rp 50.000");
console.log("✅ formatRupiah formats Indonesian currency cleanly");

// 2. Test calculateBudgetMetrics with safe budget (under contract plafon)
const metricsSafe = calculateBudgetMetrics({
  contractAmount: 200000000, // Plafon Rp 200 Juta
  categories: [
    { allocatedAmount: 70000000 }, // Venue 70jt
    { allocatedAmount: 50000000 }, // Catering 50jt
    { allocatedAmount: 30000000 }, // Dekor 30jt
  ],
  vendorInvoices: [
    { totalAmount: 70000000, status: "PAID" },
    { totalAmount: 50000000, status: "PENDING" },
  ],
  milestones: [
    { amount: 50000000, status: "PAID" }, // DP 1 50jt
    { amount: 50000000, status: "PAID" }, // DP 2 50jt
    { amount: 100000000, status: "PENDING" }, // Pelunasan 100jt
  ],
});

assert.equal(metricsSafe.totalAllocated, 150000000);
assert.equal(metricsSafe.remainingAllocation, 50000000);
assert.equal(metricsSafe.allocationPercentage, 75);
assert.equal(metricsSafe.isOverBudget, false);
assert.equal(metricsSafe.totalVendorInvoiced, 120000000);
assert.equal(metricsSafe.totalVendorPaid, 70000000);
assert.equal(metricsSafe.totalClientPaid, 100000000);
assert.equal(metricsSafe.totalClientRemaining, 100000000);
console.log("✅ Safe budget metrics calculated accurately (75% allocation, Rp 50jt remaining)");

// 3. Test calculateBudgetMetrics with OVER BUDGET scenario
const metricsOver = calculateBudgetMetrics({
  contractAmount: 100000000, // Plafon Rp 100 Juta
  categories: [
    { allocatedAmount: 80000000 },
    { allocatedAmount: 30000000 }, // Total Rp 110 Juta -> OVER Rp 10 Juta
  ],
  vendorInvoices: [],
  milestones: [],
});

assert.equal(metricsOver.totalAllocated, 110000000);
assert.equal(metricsOver.remainingAllocation, -10000000);
assert.equal(metricsOver.allocationPercentage, 110);
assert.equal(metricsOver.isOverBudget, true);
console.log("✅ Over budget metrics triggered isOverBudget: true (110% allocation, -Rp 10jt remaining)");

console.log("🎉 All Budget Math & Aggregation tests PASSED!");
