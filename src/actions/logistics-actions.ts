"use server";

import { revalidatePath } from "next/cache";
import { assertProjectAccess, assertProjectLeadAccess } from "@/lib/auth-guard";
import { getSession } from "@/lib/auth";
import {
  getSacredBelongings,
  createSacredItem,
  updateSacredItemStatus,
  deleteSacredItem,
  type SacredBelongingDTO,
} from "@/services/logistics-service";
import {
  CreateSacredItemSchema,
  UpdateSacredItemStatusSchema,
  DeleteSacredItemSchema,
  type CreateSacredItemInput,
  type UpdateSacredItemStatusInput,
  type DeleteSacredItemInput,
} from "@/schemas/logistics-schema";
import type { ActionResponse } from "@/types/action-response";
import type { SacredBelonging } from "@/db/schema/supporting-phase2";

export async function getSacredBelongingsAction(
  projectId: string
): Promise<ActionResponse<SacredBelongingDTO[]>> {
  const session = await getSession();
  const access = await assertProjectAccess(session, projectId);
  if (!access.success) return access;

  try {
    const data = await getSacredBelongings(projectId);
    return { success: true, data };
  } catch (error) {
    console.error("Error in getSacredBelongingsAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal memuat daftar logistik sakral" },
    };
  }
}

export async function createSacredItemAction(
  rawInput: CreateSacredItemInput
): Promise<ActionResponse<SacredBelonging>> {
  const session = await getSession();
  const parsed = CreateSacredItemSchema.safeParse(rawInput);
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
  const access = await assertProjectAccess(session, projectId);
  if (!access.success) return access;

  try {
    const data = await createSacredItem(projectId, itemData);
    revalidatePath(`/field/${projectId}`);
    revalidatePath(`/field/${projectId}/logistics`);
    return { success: true, data };
  } catch (error) {
    console.error("Error in createSacredItemAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal menambahkan barang sakral" },
    };
  }
}

export async function updateSacredItemStatusAction(
  rawInput: UpdateSacredItemStatusInput
): Promise<ActionResponse<SacredBelonging>> {
  const session = await getSession();
  const parsed = UpdateSacredItemStatusSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { itemId, projectId, ...updates } = parsed.data;
  // All assigned crews can update the status/location of sacred items in real-time
  const access = await assertProjectAccess(session, projectId);
  if (!access.success) return access;

  try {
    const data = await updateSacredItemStatus(itemId, projectId, updates);
    if (!data) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Barang sakral tidak ditemukan" },
      };
    }

    revalidatePath(`/field/${projectId}`);
    revalidatePath(`/field/${projectId}/logistics`);
    return { success: true, data };
  } catch (error) {
    console.error("Error in updateSacredItemStatusAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal memperbarui status barang sakral" },
    };
  }
}

export async function deleteSacredItemAction(
  rawInput: DeleteSacredItemInput
): Promise<ActionResponse<{ success: boolean }>> {
  const session = await getSession();
  const parsed = DeleteSacredItemSchema.safeParse(rawInput);
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
  const access = await assertProjectLeadAccess(session, projectId);
  if (!access.success) return access;

  try {
    await deleteSacredItem(itemId, projectId);
    revalidatePath(`/field/${projectId}`);
    revalidatePath(`/field/${projectId}/logistics`);
    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("Error in deleteSacredItemAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal menghapus barang sakral" },
    };
  }
}
