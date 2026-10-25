"use server";

import { revalidatePath } from "next/cache";
import { assertRole, assertProjectAccess, assertProjectLeadAccess } from "@/lib/auth-guard";
import { getSession } from "@/lib/auth";
import {
  getMasterVendors,
  getVendorById,
  createMasterVendor,
  updateMasterVendor,
  getProjectVendors,
  slotVendorToProject,
  updateVendorSlot,
  removeVendorFromProject,
  type VendorDTO,
  type ProjectVendorSlotDTO,
  type MasterVendorFilter,
} from "@/services/vendor-service";
import {
  CreateVendorSchema,
  UpdateVendorSchema,
  SlotVendorSchema,
  UpdateVendorSlotSchema,
  type CreateVendorInput,
  type UpdateVendorInput,
  type SlotVendorInput,
  type UpdateVendorSlotInput,
} from "@/schemas/vendor-schema";
import type { ActionResponse } from "@/types/action-response";

/**
 * Mengambil daftar master vendor rekanan dengan proteksi sesi internal.
 */
export async function getVendorsAction(
  filters?: MasterVendorFilter
): Promise<ActionResponse<VendorDTO[]>> {
  const session = await getSession();
  const auth = assertRole(session, ["OWNER", "MANAGEMENT", "CREW"]);
  if (!auth.success) return auth;

  return getMasterVendors(filters);
}

/**
 * Mengambil detail satu master vendor.
 */
export async function getVendorByIdAction(id: string): Promise<ActionResponse<VendorDTO>> {
  const session = await getSession();
  const auth = assertRole(session, ["OWNER", "MANAGEMENT", "CREW"]);
  if (!auth.success) return auth;

  return getVendorById(id);
}

/**
 * Mendaftarkan master vendor rekanan baru ke direktori kantor.
 * Diizinkan untuk OWNER & MANAGEMENT.
 */
export async function createVendorAction(
  input: CreateVendorInput
): Promise<ActionResponse<VendorDTO>> {
  const session = await getSession();
  const auth = assertRole(session, ["OWNER", "MANAGEMENT"]);
  if (!auth.success) return auth;

  const parsed = CreateVendorSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Data formulir vendor tidak valid.",
        details: parsed.error.flatten(),
      },
    };
  }

  const result = await createMasterVendor(parsed.data);
  if (result.success) {
    revalidatePath("/vendors");
  }
  return result;
}

/**
 * Memperbarui data master vendor rekanan.
 * Diizinkan untuk OWNER & MANAGEMENT.
 */
export async function updateVendorAction(
  input: UpdateVendorInput
): Promise<ActionResponse<VendorDTO>> {
  const session = await getSession();
  const auth = assertRole(session, ["OWNER", "MANAGEMENT"]);
  if (!auth.success) return auth;

  const parsed = UpdateVendorSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Data pembaruan vendor tidak valid.",
        details: parsed.error.flatten(),
      },
    };
  }

  const result = await updateMasterVendor(parsed.data);
  if (result.success) {
    revalidatePath("/vendors");
  }
  return result;
}

/**
 * Mengambil daftar vendor yang terpasang pada suatu proyek pernikahan.
 */
export async function getProjectVendorsAction(
  projectId: string
): Promise<ActionResponse<ProjectVendorSlotDTO[]>> {
  const session = await getSession();
  const access = await assertProjectAccess(session, projectId);
  if (!access.success) return access;

  return getProjectVendors(projectId);
}

/**
 * Memasangkan vendor rekanan ke slot kategori acara pengantin.
 * Diizinkan untuk OWNER, MANAGEMENT, dan LEAD_PLANNER proyek ini.
 */
export async function slotVendorToProjectAction(
  input: SlotVendorInput
): Promise<ActionResponse<ProjectVendorSlotDTO>> {
  const session = await getSession();
  const auth = await assertProjectLeadAccess(session, input.projectId);
  if (!auth.success) return auth;

  const parsed = SlotVendorSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Data slotting vendor tidak valid.",
        details: parsed.error.flatten(),
      },
    };
  }

  const result = await slotVendorToProject(parsed.data);
  if (result.success) {
    revalidatePath(`/projects/${input.projectId}/vendors`);
    revalidatePath(`/projects/${input.projectId}/overview`);
    revalidatePath("/dashboard");
  }
  return result;
}

/**
 * Memperbarui status kontrak atau catatan vendor pada proyek pengantin.
 * Diizinkan untuk OWNER, MANAGEMENT, dan LEAD_PLANNER proyek ini.
 */
export async function updateVendorSlotAction(
  input: UpdateVendorSlotInput
): Promise<ActionResponse<{ slotId: string; contractStatus?: string; notes?: string | null }>> {
  const session = await getSession();
  const auth = await assertProjectLeadAccess(session, input.projectId);
  if (!auth.success) return auth;

  const parsed = UpdateVendorSlotSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Data pembaruan slot vendor tidak valid.",
        details: parsed.error.flatten(),
      },
    };
  }

  const result = await updateVendorSlot(parsed.data);
  if (result.success) {
    revalidatePath(`/projects/${input.projectId}/vendors`);
    revalidatePath(`/projects/${input.projectId}/overview`);
  }
  return result;
}

/**
 * Melepaskan vendor dari slot proyek acara pengantin.
 * Diizinkan untuk OWNER, MANAGEMENT, dan LEAD_PLANNER proyek ini.
 */
export async function removeVendorFromProjectAction(
  slotId: string,
  projectId: string
): Promise<ActionResponse<{ deletedId: string }>> {
  const session = await getSession();
  const auth = await assertProjectLeadAccess(session, projectId);
  if (!auth.success) return auth;

  const result = await removeVendorFromProject(slotId, projectId);
  if (result.success) {
    revalidatePath(`/projects/${projectId}/vendors`);
    revalidatePath(`/projects/${projectId}/overview`);
    revalidatePath("/dashboard");
  }
  return result;
}
