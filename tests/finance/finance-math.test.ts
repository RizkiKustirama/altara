import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateCrewPayout,
  calculateProjectProfitability,
  calculateCompanyAggregates,
} from "../../src/lib/finance-math";

test("🧪 Testing Tier 2A & Tier 2B Finance Math Engines...", () => {
  // 1. Crew payout: 1.5 sessions * 500.000 = 750.000
  const payout1 = calculateCrewPayout(500000, 1.5);
  assert.equal(payout1, 750000, "1.5 session payout should be 750.000");

  const payoutStandard = calculateCrewPayout(400000, 1);
  assert.equal(payoutStandard, 400000, "1 session payout should be 400.000");

  // 2. Project profitability (Tier 2B formula)
  // Contract: 100jt, Vendor cost: 60jt, Crew expense: 15jt
  // Gross profit: 100 - 60 - 15 = 25jt
  // Net margin: (25jt / 100jt) * 100 = 25%
  const project1 = calculateProjectProfitability({
    grossContractPrice: 100000000,
    vendorRealCost: 60000000,
    crewTotalExpense: 15000000,
  });

  assert.equal(project1.grossProfit, 25000000);
  assert.equal(project1.netProfitMargin, 25.0);
  assert.equal(project1.isProfitable, true);

  // 3. Loss-making project
  // Contract: 50jt, Vendor cost: 45jt, Crew expense: 10jt
  // Gross profit: -5jt (-10%)
  const projectLoss = calculateProjectProfitability({
    grossContractPrice: 50000000,
    vendorRealCost: 45000000,
    crewTotalExpense: 10000000,
  });

  assert.equal(projectLoss.grossProfit, -5000000);
  assert.equal(projectLoss.netProfitMargin, -10.0);
  assert.equal(projectLoss.isProfitable, false);

  // 4. Company Executive Aggregates (Dimas Dashboard)
  const aggregates = calculateCompanyAggregates([project1, projectLoss]);
  // Total Revenue: 150jt
  // Total Vendor: 105jt
  // Total Crew: 25jt
  // Total Gross Profit: 20jt
  // Overall Net Margin: (20 / 150) * 100 = 13.3%
  assert.equal(aggregates.totalGrossRevenue, 150000000);
  assert.equal(aggregates.totalVendorCost, 105000000);
  assert.equal(aggregates.totalCrewExpense, 25000000);
  assert.equal(aggregates.totalGrossProfit, 20000000);
  assert.equal(aggregates.overallNetMarginPercentage, 13.3);
  assert.equal(aggregates.projectCount, 2);

  console.log("✅ All Finance Math & Profitability formulas PASSED!");
});
