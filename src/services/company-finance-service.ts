import { db } from "@/db";
import { projects } from "@/db/schema/projects";
import { vendorInvoices } from "@/db/schema/operational-budgets";
import { crewPayouts } from "@/db/schema/company-finances";
import {
  calculateProjectProfitability,
  calculateCompanyAggregates,
  type ProfitabilityResult,
  type CompanyAggregatesResult,
} from "@/lib/finance-math";
import { desc } from "drizzle-orm";

export interface ProjectExecutiveFinanceDTO extends ProfitabilityResult {
  projectId: string;
  projectName: string;
  clientName: string;
  weddingDate: string;
  status: string;
}

export interface ExecutiveFinancialOverviewDTO {
  aggregates: CompanyAggregatesResult;
  projects: ProjectExecutiveFinanceDTO[];
}

/**
 * Mengambil rekapitulasi laba kotor & margin bersih perusahaan (Tier 2B: Eksklusif Owner Dimas).
 */
export async function getCompanyExecutiveFinancials(): Promise<ExecutiveFinancialOverviewDTO> {
  // 1. Fetch all projects
  const allProjects = await db
    .select({
      id: projects.id,
      projectName: projects.projectName,
      clientGroomName: projects.clientGroomName,
      clientBrideName: projects.clientBrideName,
      weddingDate: projects.weddingDate,
      contractAmount: projects.contractAmount,
      status: projects.status,
    })
    .from(projects)
    .orderBy(desc(projects.weddingDate));

  // 2. Fetch all vendor invoices
  const allInvoices = await db
    .select({
      projectId: vendorInvoices.projectId,
      totalAmount: vendorInvoices.totalAmount,
    })
    .from(vendorInvoices);

  // 3. Fetch all crew payouts
  const allPayouts = await db
    .select({
      projectId: crewPayouts.projectId,
      totalPayout: crewPayouts.totalPayout,
    })
    .from(crewPayouts);

  // Group vendor costs by project
  const vendorCostMap = new Map<string, number>();
  for (const inv of allInvoices) {
    const prev = vendorCostMap.get(inv.projectId) || 0;
    vendorCostMap.set(inv.projectId, prev + (parseFloat(inv.totalAmount) || 0));
  }

  // Group crew expenses by project
  const crewExpenseMap = new Map<string, number>();
  for (const p of allPayouts) {
    const prev = crewExpenseMap.get(p.projectId) || 0;
    crewExpenseMap.set(p.projectId, prev + (parseFloat(p.totalPayout) || 0));
  }

  // 4. Compute profitability for each project
  const projectFinances: ProjectExecutiveFinanceDTO[] = allProjects.map((p) => {
    const grossContractPrice = parseFloat(p.contractAmount) || 0;
    const vendorRealCost = vendorCostMap.get(p.id) || 0;
    const crewTotalExpense = crewExpenseMap.get(p.id) || 0;

    const metrics = calculateProjectProfitability({
      grossContractPrice,
      vendorRealCost,
      crewTotalExpense,
    });

    return {
      ...metrics,
      projectId: p.id,
      projectName: p.projectName,
      clientName: `${p.clientGroomName} & ${p.clientBrideName}`,
      weddingDate: p.weddingDate,
      status: p.status,
    };
  });

  // 5. Aggregate overall company metrics
  const aggregates = calculateCompanyAggregates(projectFinances);

  return {
    aggregates,
    projects: projectFinances,
  };
}
