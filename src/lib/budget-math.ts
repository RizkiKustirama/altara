export interface BudgetMetricsInput {
  contractAmount: number;
  categories: { allocatedAmount: number | string }[];
  vendorInvoices: { totalAmount: number | string; status: string }[];
  milestones: { amount: number | string; status: string }[];
}

export interface BudgetMetricsResult {
  contractAmount: number;
  totalAllocated: number;
  remainingAllocation: number;
  allocationPercentage: number;
  isOverBudget: boolean;
  totalVendorInvoiced: number;
  totalVendorPaid: number;
  totalVendorPending: number;
  totalClientMilestones: number;
  totalClientPaid: number;
  totalClientRemaining: number;
}

/**
 * Formats a numeric value into Indonesian Rupiah (e.g. "Rp 150.000.000").
 */
export function formatRupiah(amount: number | string | null | undefined): string {
  const num = typeof amount === "number" ? amount : parseFloat(String(amount ?? "0")) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(num)
    .replace(/\u00a0/g, " ");
}

/**
 * Calculates operational budget metrics, comparing client contract plafon vs allocated categories,
 * vendor invoices, and client payment milestone receipts.
 */
export function calculateBudgetMetrics(input: BudgetMetricsInput): BudgetMetricsResult {
  const contract = typeof input.contractAmount === "number"
    ? input.contractAmount
    : parseFloat(String(input.contractAmount)) || 0;

  const totalAllocated = input.categories.reduce((acc, curr) => {
    const val = typeof curr.allocatedAmount === "number"
      ? curr.allocatedAmount
      : parseFloat(String(curr.allocatedAmount)) || 0;
    return acc + val;
  }, 0);

  const remainingAllocation = contract - totalAllocated;
  const allocationPercentage = contract > 0
    ? Math.round((totalAllocated / contract) * 100)
    : 0;
  const isOverBudget = totalAllocated > contract;

  let totalVendorInvoiced = 0;
  let totalVendorPaid = 0;

  for (const inv of input.vendorInvoices) {
    const amt = typeof inv.totalAmount === "number"
      ? inv.totalAmount
      : parseFloat(String(inv.totalAmount)) || 0;
    totalVendorInvoiced += amt;
    if (inv.status === "PAID") {
      totalVendorPaid += amt;
    }
  }

  const totalVendorPending = totalVendorInvoiced - totalVendorPaid;

  let totalClientMilestones = 0;
  let totalClientPaid = 0;

  for (const ms of input.milestones) {
    const amt = typeof ms.amount === "number"
      ? ms.amount
      : parseFloat(String(ms.amount)) || 0;
    totalClientMilestones += amt;
    if (ms.status === "PAID") {
      totalClientPaid += amt;
    }
  }

  const totalClientRemaining = totalClientMilestones - totalClientPaid;

  return {
    contractAmount: contract,
    totalAllocated,
    remainingAllocation,
    allocationPercentage,
    isOverBudget,
    totalVendorInvoiced,
    totalVendorPaid,
    totalVendorPending,
    totalClientMilestones,
    totalClientPaid,
    totalClientRemaining,
  };
}
