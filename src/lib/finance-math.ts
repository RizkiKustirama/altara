/**
 * Math Engine & Formulas for Tier 2A & Tier 2B Internal Agency Finances
 */

export interface ProfitabilityInput {
  grossContractPrice: number | string;
  vendorRealCost: number | string;
  crewTotalExpense: number | string;
}

export interface ProfitabilityResult {
  grossContractPrice: number;
  vendorRealCost: number;
  crewTotalExpense: number;
  grossProfit: number;
  netProfitMargin: number; // percentage e.g. 35.5 (%)
  isProfitable: boolean;
}

export interface CompanyAggregatesResult {
  totalGrossRevenue: number;
  totalVendorCost: number;
  totalCrewExpense: number;
  totalGrossProfit: number;
  overallNetMarginPercentage: number;
  projectCount: number;
}

/**
 * Formula: payout = session_count * daily_rate
 */
export function calculateCrewPayout(
  dailyRate: number | string,
  sessionCount: number | string = 1.0
): number {
  const rate = typeof dailyRate === "number" ? dailyRate : parseFloat(String(dailyRate)) || 0;
  const sessions = typeof sessionCount === "number" ? sessionCount : parseFloat(String(sessionCount)) || 1.0;
  return Math.round(rate * sessions);
}

/**
 * Formula:
 * gross_profit = gross_contract_price - vendor_real_cost - crew_total_expense
 * net_profit_margin = (gross_profit / gross_contract_price) * 100%
 */
export function calculateProjectProfitability(
  input: ProfitabilityInput
): ProfitabilityResult {
  const contract = typeof input.grossContractPrice === "number"
    ? input.grossContractPrice
    : parseFloat(String(input.grossContractPrice)) || 0;

  const vendorCost = typeof input.vendorRealCost === "number"
    ? input.vendorRealCost
    : parseFloat(String(input.vendorRealCost)) || 0;

  const crewExpense = typeof input.crewTotalExpense === "number"
    ? input.crewTotalExpense
    : parseFloat(String(input.crewTotalExpense)) || 0;

  const grossProfit = contract - vendorCost - crewExpense;
  const netProfitMargin = contract > 0
    ? Math.round(((grossProfit / contract) * 100) * 10) / 10
    : 0;

  return {
    grossContractPrice: contract,
    vendorRealCost: vendorCost,
    crewTotalExpense: crewExpense,
    grossProfit,
    netProfitMargin,
    isProfitable: grossProfit >= 0,
  };
}

/**
 * Menghitung akumulasi seluruh proyek perusahaan untuk dasbor eksekutif Dimas (Owner Exclusive).
 */
export function calculateCompanyAggregates(
  projectsList: ProfitabilityResult[]
): CompanyAggregatesResult {
  const totalGrossRevenue = projectsList.reduce((acc, p) => acc + p.grossContractPrice, 0);
  const totalVendorCost = projectsList.reduce((acc, p) => acc + p.vendorRealCost, 0);
  const totalCrewExpense = projectsList.reduce((acc, p) => acc + p.crewTotalExpense, 0);
  const totalGrossProfit = totalGrossRevenue - totalVendorCost - totalCrewExpense;

  const overallNetMarginPercentage = totalGrossRevenue > 0
    ? Math.round(((totalGrossProfit / totalGrossRevenue) * 100) * 10) / 10
    : 0;

  return {
    totalGrossRevenue,
    totalVendorCost,
    totalCrewExpense,
    totalGrossProfit,
    overallNetMarginPercentage,
    projectCount: projectsList.length,
  };
}
