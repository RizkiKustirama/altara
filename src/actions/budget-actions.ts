"use server";

import { revalidatePath } from "next/cache";
import { assertProjectAccess, assertProjectLeadAccess } from "@/lib/auth-guard";
import { getSession } from "@/lib/auth";
import {
  getProjectBudgetOverview,
  createProjectBudgetCategory,
  updateProjectBudgetCategory,
  deleteProjectBudgetCategory,
  createVendorInvoice,
  updateVendorInvoiceStatus,
  deleteVendorInvoice,
  createPaymentMilestone,
  updatePaymentMilestone,
  deletePaymentMilestone,
  type ProjectBudgetOverviewDTO,
} from "@/services/budget-service";
import {
  CreateBudgetCategorySchema,
  UpdateBudgetCategorySchema,
  DeleteBudgetCategorySchema,
  CreateVendorInvoiceSchema,
  UpdateVendorInvoiceStatusSchema,
  DeleteVendorInvoiceSchema,
  CreatePaymentMilestoneSchema,
  UpdatePaymentMilestoneSchema,
  DeletePaymentMilestoneSchema,
  type CreateBudgetCategoryInput,
  type UpdateBudgetCategoryInput,
  type DeleteBudgetCategoryInput,
  type CreateVendorInvoiceInput,
  type UpdateVendorInvoiceStatusInput,
  type DeleteVendorInvoiceInput,
  type CreatePaymentMilestoneInput,
  type UpdatePaymentMilestoneInput,
  type DeletePaymentMilestoneInput,
} from "@/schemas/budget-schema";
import type { ActionResponse } from "@/types/action-response";
import type {
  ProjectBudget,
  VendorInvoice,
  PaymentMilestone,
} from "@/db/schema/operational-budgets";

/**
 * Mengambil ringkasan data bujet operasional proyek.
 */
export async function getProjectBudgetOverviewAction(
  projectId: string
): Promise<ActionResponse<ProjectBudgetOverviewDTO>> {
  const session = await getSession();
  const access = await assertProjectAccess(session, projectId);
  if (!access.success) return access;

  try {
    const data = await getProjectBudgetOverview(projectId);
    if (!data) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Data proyek tidak ditemukan" },
      };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Error in getProjectBudgetOverviewAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal memuat ringkasan bujet acara" },
    };
  }
}

// -------------------------------------------------------------
// Actions: Budget Category Allocations
// -------------------------------------------------------------

export async function allocateBudgetCategoryAction(
  rawInput: CreateBudgetCategoryInput
): Promise<ActionResponse<ProjectBudget>> {
  const session = await getSession();
  const parsed = CreateBudgetCategorySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { projectId, ...itemData } = parsed.data;
  const access = await assertProjectLeadAccess(session, projectId);
  if (!access.success) return access;

  try {
    const data = await createProjectBudgetCategory(projectId, itemData);
    revalidatePath(`/projects/${projectId}/budget`);
    return { success: true, data };
  } catch (error) {
    console.error("Error in allocateBudgetCategoryAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal mengalokasikan bujet kategori" },
    };
  }
}

export async function updateBudgetCategoryAction(
  rawInput: UpdateBudgetCategoryInput
): Promise<ActionResponse<ProjectBudget>> {
  const session = await getSession();
  const parsed = UpdateBudgetCategorySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { budgetId, projectId, ...itemData } = parsed.data;
  const access = await assertProjectLeadAccess(session, projectId);
  if (!access.success) return access;

  try {
    const data = await updateProjectBudgetCategory(budgetId, projectId, itemData);
    if (!data) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Pos alokasi bujet tidak ditemukan" },
      };
    }
    revalidatePath(`/projects/${projectId}/budget`);
    return { success: true, data };
  } catch (error) {
    console.error("Error in updateBudgetCategoryAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal memperbarui pos bujet" },
    };
  }
}

export async function deleteBudgetCategoryAction(
  rawInput: DeleteBudgetCategoryInput
): Promise<ActionResponse<{ success: boolean }>> {
  const session = await getSession();
  const parsed = DeleteBudgetCategorySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { budgetId, projectId } = parsed.data;
  const access = await assertProjectLeadAccess(session, projectId);
  if (!access.success) return access;

  try {
    await deleteProjectBudgetCategory(budgetId, projectId);
    revalidatePath(`/projects/${projectId}/budget`);
    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("Error in deleteBudgetCategoryAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal menghapus pos alokasi bujet" },
    };
  }
}

// -------------------------------------------------------------
// Actions: Vendor Invoices
// -------------------------------------------------------------

export async function recordVendorInvoiceAction(
  rawInput: CreateVendorInvoiceInput
): Promise<ActionResponse<VendorInvoice>> {
  const session = await getSession();
  const parsed = CreateVendorInvoiceSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { projectId, ...invoiceData } = parsed.data;
  const access = await assertProjectLeadAccess(session, projectId);
  if (!access.success) return access;

  try {
    const data = await createVendorInvoice(invoiceData);
    revalidatePath(`/projects/${projectId}/budget`);
    return { success: true, data };
  } catch (error) {
    console.error("Error in recordVendorInvoiceAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal mencatat invoice vendor" },
    };
  }
}

export async function updateVendorInvoiceStatusAction(
  rawInput: UpdateVendorInvoiceStatusInput
): Promise<ActionResponse<VendorInvoice>> {
  const session = await getSession();
  const parsed = UpdateVendorInvoiceStatusSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { projectId, invoiceId, status } = parsed.data;
  const access = await assertProjectLeadAccess(session, projectId);
  if (!access.success) return access;

  try {
    const data = await updateVendorInvoiceStatus(invoiceId, status);
    if (!data) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Invoice vendor tidak ditemukan" },
      };
    }
    revalidatePath(`/projects/${projectId}/budget`);
    return { success: true, data };
  } catch (error) {
    console.error("Error in updateVendorInvoiceStatusAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal memperbarui status invoice" },
    };
  }
}

export async function deleteVendorInvoiceAction(
  rawInput: DeleteVendorInvoiceInput
): Promise<ActionResponse<{ success: boolean }>> {
  const session = await getSession();
  const parsed = DeleteVendorInvoiceSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { projectId, invoiceId } = parsed.data;
  const access = await assertProjectLeadAccess(session, projectId);
  if (!access.success) return access;

  try {
    await deleteVendorInvoice(invoiceId);
    revalidatePath(`/projects/${projectId}/budget`);
    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("Error in deleteVendorInvoiceAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal menghapus invoice vendor" },
    };
  }
}

// -------------------------------------------------------------
// Actions: Client Payment Milestones
// -------------------------------------------------------------

export async function createPaymentMilestoneAction(
  rawInput: CreatePaymentMilestoneInput
): Promise<ActionResponse<PaymentMilestone>> {
  const session = await getSession();
  const parsed = CreatePaymentMilestoneSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { projectId, ...milestoneData } = parsed.data;
  const access = await assertProjectLeadAccess(session, projectId);
  if (!access.success) return access;

  try {
    const data = await createPaymentMilestone(projectId, milestoneData);
    revalidatePath(`/projects/${projectId}/budget`);
    return { success: true, data };
  } catch (error) {
    console.error("Error in createPaymentMilestoneAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal membuat termin pembayaran klien" },
    };
  }
}

export async function updatePaymentMilestoneAction(
  rawInput: UpdatePaymentMilestoneInput
): Promise<ActionResponse<PaymentMilestone>> {
  const session = await getSession();
  const parsed = UpdatePaymentMilestoneSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { projectId, milestoneId, ...milestoneData } = parsed.data;
  const access = await assertProjectLeadAccess(session, projectId);
  if (!access.success) return access;

  try {
    const data = await updatePaymentMilestone(milestoneId, projectId, milestoneData);
    if (!data) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Termin pembayaran tidak ditemukan" },
      };
    }
    revalidatePath(`/projects/${projectId}/budget`);
    return { success: true, data };
  } catch (error) {
    console.error("Error in updatePaymentMilestoneAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal memperbarui termin pembayaran" },
    };
  }
}

export async function deletePaymentMilestoneAction(
  rawInput: DeletePaymentMilestoneInput
): Promise<ActionResponse<{ success: boolean }>> {
  const session = await getSession();
  const parsed = DeletePaymentMilestoneSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { projectId, milestoneId } = parsed.data;
  const access = await assertProjectLeadAccess(session, projectId);
  if (!access.success) return access;

  try {
    await deletePaymentMilestone(milestoneId, projectId);
    revalidatePath(`/projects/${projectId}/budget`);
    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("Error in deletePaymentMilestoneAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal menghapus termin pembayaran" },
    };
  }
}
