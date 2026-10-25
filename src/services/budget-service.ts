import { db } from "../db";
import { projects } from "../db/schema/projects";
import {
  projectBudgets,
  vendorInvoices,
  paymentMilestones,
  ProjectBudget,
  VendorInvoice,
  PaymentMilestone,
} from "../db/schema/operational-budgets";
import { projectVendors, vendors } from "../db/schema/vendors";
import { eq, and, desc, asc } from "drizzle-orm";
import {
  calculateBudgetMetrics,
  type BudgetMetricsResult,
} from "../lib/budget-math";

export interface VendorInvoiceDTO extends VendorInvoice {
  vendorName: string;
  category: string;
  picName: string;
  phone: string;
}

export interface ProjectBudgetOverviewDTO {
  contractAmount: number;
  metrics: BudgetMetricsResult;
  categories: ProjectBudget[];
  vendorInvoices: VendorInvoiceDTO[];
  milestones: PaymentMilestone[];
}

/**
 * Mengambil ringkasan lengkap bujet operasional proyek pernikahan (Tier 1).
 */
export async function getProjectBudgetOverview(
  projectId: string
): Promise<ProjectBudgetOverviewDTO | null> {
  // 1. Fetch Project Contract Plafon
  const [project] = await db
    .select({
      id: projects.id,
      contractAmount: projects.contractAmount,
    })
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project) return null;

  // 2. Fetch Allocated Categories
  const categories = await db
    .select()
    .from(projectBudgets)
    .where(eq(projectBudgets.projectId, projectId))
    .orderBy(desc(projectBudgets.createdAt));

  // 3. Fetch Vendor Invoices with Vendor Information
  const rawInvoices = await db
    .select({
      id: vendorInvoices.id,
      projectVendorId: vendorInvoices.projectVendorId,
      invoiceNumber: vendorInvoices.invoiceNumber,
      totalAmount: vendorInvoices.totalAmount,
      dueDate: vendorInvoices.dueDate,
      status: vendorInvoices.status,
      invoiceFileUrl: vendorInvoices.invoiceFileUrl,
      createdAt: vendorInvoices.createdAt,
      updatedAt: vendorInvoices.updatedAt,
      vendorName: vendors.vendorName,
      category: projectVendors.category,
      picName: vendors.picName,
      phone: vendors.phone,
    })
    .from(vendorInvoices)
    .innerJoin(projectVendors, eq(vendorInvoices.projectVendorId, projectVendors.id))
    .innerJoin(vendors, eq(projectVendors.vendorId, vendors.id))
    .where(eq(projectVendors.projectId, projectId))
    .orderBy(asc(vendorInvoices.dueDate));

  // 4. Fetch Client Payment Milestones
  const milestones = await db
    .select()
    .from(paymentMilestones)
    .where(eq(paymentMilestones.projectId, projectId))
    .orderBy(asc(paymentMilestones.dueDate));

  const contractNum = parseFloat(project.contractAmount) || 0;

  const metrics = calculateBudgetMetrics({
    contractAmount: contractNum,
    categories,
    vendorInvoices: rawInvoices,
    milestones,
  });

  return {
    contractAmount: contractNum,
    metrics,
    categories,
    vendorInvoices: rawInvoices,
    milestones,
  };
}

// -------------------------------------------------------------
// CRUD Operations: Project Budget Categories
// -------------------------------------------------------------

export async function createProjectBudgetCategory(
  projectId: string,
  input: {
    category: string;
    allocatedAmount: string;
    notes?: string | null;
  }
): Promise<ProjectBudget> {
  const [created] = await db
    .insert(projectBudgets)
    .values({
      projectId,
      category: input.category,
      allocatedAmount: input.allocatedAmount,
      notes: input.notes ?? null,
    })
    .returning();

  if (!created) {
    throw new Error("Gagal membuat alokasi bujet kategori");
  }

  return created;
}

export async function updateProjectBudgetCategory(
  budgetId: string,
  projectId: string,
  input: Partial<{
    category: string;
    allocatedAmount: string;
    notes: string | null;
  }>
): Promise<ProjectBudget | null> {
  const [updated] = await db
    .update(projectBudgets)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(projectBudgets.id, budgetId), eq(projectBudgets.projectId, projectId)))
    .returning();

  return updated ?? null;
}

export async function deleteProjectBudgetCategory(
  budgetId: string,
  projectId: string
): Promise<boolean> {
  await db
    .delete(projectBudgets)
    .where(and(eq(projectBudgets.id, budgetId), eq(projectBudgets.projectId, projectId)));

  return true;
}

// -------------------------------------------------------------
// CRUD Operations: Vendor Invoices
// -------------------------------------------------------------

export async function createVendorInvoice(input: {
  projectVendorId: string;
  invoiceNumber: string;
  totalAmount: string;
  dueDate: string;
  status?: "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
  invoiceFileUrl?: string | null;
}): Promise<VendorInvoice> {
  const [created] = await db
    .insert(vendorInvoices)
    .values({
      projectVendorId: input.projectVendorId,
      invoiceNumber: input.invoiceNumber,
      totalAmount: input.totalAmount,
      dueDate: input.dueDate,
      status: input.status ?? "PENDING",
      invoiceFileUrl: input.invoiceFileUrl ?? null,
    })
    .returning();

  if (!created) {
    throw new Error("Gagal mencatat tagihan invoice vendor");
  }

  return created;
}

export async function updateVendorInvoiceStatus(
  invoiceId: string,
  status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE"
): Promise<VendorInvoice | null> {
  const [updated] = await db
    .update(vendorInvoices)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(vendorInvoices.id, invoiceId))
    .returning();

  return updated ?? null;
}

export async function deleteVendorInvoice(invoiceId: string): Promise<boolean> {
  await db.delete(vendorInvoices).where(eq(vendorInvoices.id, invoiceId));
  return true;
}

// -------------------------------------------------------------
// CRUD Operations: Payment Milestones (Client Termins)
// -------------------------------------------------------------

export async function createPaymentMilestone(
  projectId: string,
  input: {
    title: string;
    amount: string;
    dueDate: string;
    paidDate?: string | null;
    status?: "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
    proofFileUrl?: string | null;
  }
): Promise<PaymentMilestone> {
  const [created] = await db
    .insert(paymentMilestones)
    .values({
      projectId,
      title: input.title,
      amount: input.amount,
      dueDate: input.dueDate,
      paidDate: input.paidDate ?? null,
      status: input.status ?? "PENDING",
      proofFileUrl: input.proofFileUrl ?? null,
    })
    .returning();

  if (!created) {
    throw new Error("Gagal membuat termin pembayaran klien");
  }

  return created;
}

export async function updatePaymentMilestone(
  milestoneId: string,
  projectId: string,
  input: Partial<{
    title: string;
    amount: string;
    dueDate: string;
    paidDate: string | null;
    status: "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
    proofFileUrl: string | null;
  }>
): Promise<PaymentMilestone | null> {
  const [updated] = await db
    .update(paymentMilestones)
    .set(input)
    .where(and(eq(paymentMilestones.id, milestoneId), eq(paymentMilestones.projectId, projectId)))
    .returning();

  return updated ?? null;
}

export async function deletePaymentMilestone(
  milestoneId: string,
  projectId: string
): Promise<boolean> {
  await db
    .delete(paymentMilestones)
    .where(and(eq(paymentMilestones.id, milestoneId), eq(paymentMilestones.projectId, projectId)));

  return true;
}
