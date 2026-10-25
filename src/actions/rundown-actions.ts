"use server";

import { revalidatePath } from "next/cache";
import { assertRole, assertProjectAccess, assertProjectLeadAccess } from "@/lib/auth-guard";
import { getSession } from "@/lib/auth";
import {
  getProjectRundowns,
  createProjectRundownItem,
  updateProjectRundownItem,
  deleteProjectRundownItem,
  reorderAndPropagateProjectRundown,
  shiftProjectRundownTimes,
  propagateRundownTimes,
} from "@/services/rundown-service";
import {
  getEventTemplates,
  applyTemplateToProject,
} from "@/services/template-service";
import {
  CreateRundownItemSchema,
  UpdateRundownItemSchema,
  DeleteRundownItemSchema,
  ReorderRundownSchema,
  ShiftRundownTimeSchema,
  ApplyTemplateSchema,
  type CreateRundownItemInput,
  type UpdateRundownItemInput,
  type DeleteRundownItemInput,
  type ReorderRundownInput,
  type ShiftRundownTimeInput,
  type ApplyTemplateInput,
} from "@/schemas/rundown-schema";
import type { ActionResponse } from "@/types/action-response";
import type { ProjectRundown, EventTemplate } from "@/db/schema/rundowns";
import { db } from "@/db";
import { projectRundowns } from "@/db/schema/rundowns";
import { eq } from "drizzle-orm";

/**
 * Mengambil daftar item rundown untuk suatu proyek acara.
 */
export async function getProjectRundownAction(
  projectId: string
): Promise<ActionResponse<ProjectRundown[]>> {
  const session = await getSession();
  const accessCheck = await assertProjectAccess(session, projectId);
  if (!accessCheck.success) return accessCheck;

  try {
    const data = await getProjectRundowns(projectId);
    return { success: true, data };
  } catch (error) {
    console.error("Error in getProjectRundownAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal memuat susunan acara proyek" },
    };
  }
}

/**
 * Mengambil daftar pustaka template prosesi pernikahan (Adat Sunda, Jawa, Holy Matrimony, dll.).
 */
export async function getEventTemplatesAction(): Promise<
  ActionResponse<(EventTemplate & { itemCount: number })[]>
> {
  const session = await getSession();
  const roleCheck = assertRole(session, ["OWNER", "MANAGEMENT", "CREW"]);
  if (!roleCheck.success) return roleCheck;

  try {
    const data = await getEventTemplates();
    return { success: true, data };
  } catch (error) {
    console.error("Error in getEventTemplatesAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal memuat pustaka template prosesi" },
    };
  }
}

/**
 * Menerapkan template prosesi ke proyek pengantin baru.
 */
export async function applyTemplateToProjectAction(
  rawInput: ApplyTemplateInput
): Promise<ActionResponse<ProjectRundown[]>> {
  const session = await getSession();
  const parsed = ApplyTemplateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { projectId, templateId, customStartTime, replaceExisting } = parsed.data;
  const accessCheck = await assertProjectLeadAccess(session, projectId);
  if (!accessCheck.success) return accessCheck;

  try {
    const data = await applyTemplateToProject(
      projectId,
      templateId,
      customStartTime ?? undefined,
      replaceExisting
    );
    revalidatePath(`/projects/${projectId}/rundown`);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error in applyTemplateToProjectAction:", error);
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: error.message || "Gagal menerapkan template prosesi ke proyek",
      },
    };
  }
}

/**
 * Membuat item rundown baru di dalam proyek.
 */
export async function createRundownItemAction(
  rawInput: CreateRundownItemInput
): Promise<ActionResponse<ProjectRundown>> {
  const session = await getSession();
  const parsed = CreateRundownItemSchema.safeParse(rawInput);
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
  const accessCheck = await assertProjectLeadAccess(session, projectId);
  if (!accessCheck.success) return accessCheck;

  try {
    const data = await createProjectRundownItem(projectId, itemData);
    revalidatePath(`/projects/${projectId}/rundown`);
    return { success: true, data };
  } catch (error) {
    console.error("Error in createRundownItemAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal menambahkan agenda acara" },
    };
  }
}

/**
 * Memperbarui item agenda rundown dan merambatkan waktu ke sesi berikutnya jika diminta.
 */
export async function updateRundownItemAction(
  rawInput: UpdateRundownItemInput
): Promise<ActionResponse<ProjectRundown>> {
  const session = await getSession();
  const parsed = UpdateRundownItemSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { itemId, projectId, propagateRemaining, ...updates } = parsed.data;
  const accessCheck = await assertProjectLeadAccess(session, projectId);
  if (!accessCheck.success) return accessCheck;

  try {
    const updated = await updateProjectRundownItem(itemId, projectId, updates);
    if (!updated) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Item rundown tidak ditemukan" },
      };
    }

    // Jika waktu berubah dan propagateRemaining diaktifkan, sesuaikan seluruh sesi berikutnya
    if (propagateRemaining) {
      const allItems = await getProjectRundowns(projectId);
      const targetIndex = allItems.findIndex((it) => it.id === itemId);

      if (targetIndex !== -1 && targetIndex < allItems.length - 1) {
        const subsequentItems = allItems.slice(targetIndex + 1);
        const propagated = propagateRundownTimes(subsequentItems, updated.endTime);

        await db.transaction(async (tx) => {
          for (const item of propagated) {
            await tx
              .update(projectRundowns)
              .set({
                startTime: item.startTime,
                endTime: item.endTime,
                updatedAt: new Date(),
              })
              .where(eq(projectRundowns.id, item.id));
          }
        });
      }
    }

    revalidatePath(`/projects/${projectId}/rundown`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error in updateRundownItemAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal memperbarui agenda acara" },
    };
  }
}

/**
 * Menghapus agenda acara dari rundown proyek.
 */
export async function deleteRundownItemAction(
  rawInput: DeleteRundownItemInput
): Promise<ActionResponse<{ success: boolean }>> {
  const session = await getSession();
  const parsed = DeleteRundownItemSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { itemId, projectId } = parsed.data;
  const accessCheck = await assertProjectLeadAccess(session, projectId);
  if (!accessCheck.success) return accessCheck;

  try {
    await deleteProjectRundownItem(itemId, projectId);
    revalidatePath(`/projects/${projectId}/rundown`);
    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("Error in deleteRundownItemAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal menghapus agenda acara" },
    };
  }
}

/**
 * Mengubah susunan urutan agenda dan menyelaraskan waktu secara berantai.
 */
export async function reorderRundownAction(
  rawInput: ReorderRundownInput
): Promise<ActionResponse<ProjectRundown[]>> {
  const session = await getSession();
  const parsed = ReorderRundownSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { projectId, orderedItemIds } = parsed.data;
  const accessCheck = await assertProjectLeadAccess(session, projectId);
  if (!accessCheck.success) return accessCheck;

  try {
    const data = await reorderAndPropagateProjectRundown(projectId, orderedItemIds);
    revalidatePath(`/projects/${projectId}/rundown`);
    return { success: true, data };
  } catch (error) {
    console.error("Error in reorderRundownAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal menyusun ulang agenda acara" },
    };
  }
}

/**
 * Menggeser jadwal (delay / maju) dari nomor urut tertentu sebesar delta menit.
 */
export async function shiftRundownTimeAction(
  rawInput: ShiftRundownTimeInput
): Promise<ActionResponse<ProjectRundown[]>> {
  const session = await getSession();
  const parsed = ShiftRundownTimeSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { projectId, startFromIndex, deltaMinutes } = parsed.data;
  const accessCheck = await assertProjectLeadAccess(session, projectId);
  if (!accessCheck.success) return accessCheck;

  try {
    const data = await shiftProjectRundownTimes(projectId, startFromIndex, deltaMinutes);
    revalidatePath(`/projects/${projectId}/rundown`);
    return { success: true, data };
  } catch (error) {
    console.error("Error in shiftRundownTimeAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal menggeser waktu agenda acara" },
    };
  }
}
