"use server";

import { revalidatePath } from "next/cache";
import { assertProjectAccess, assertProjectLeadAccess } from "@/lib/auth-guard";
import { getSession } from "@/lib/auth";
import {
  getWeddingPartyMembers,
  createWeddingPartyMember,
  updateWeddingPartyMember,
  deleteWeddingPartyMember,
} from "@/services/wedding-party-service";
import {
  CreateWeddingPartyMemberSchema,
  UpdateWeddingPartyMemberSchema,
  DeleteWeddingPartyMemberSchema,
  type CreateWeddingPartyMemberInput,
  type UpdateWeddingPartyMemberInput,
  type DeleteWeddingPartyMemberInput,
} from "@/schemas/wedding-party-schema";
import type { ActionResponse } from "@/types/action-response";
import type { WeddingParty } from "@/db/schema/wedding-parties";

/**
 * Mengambil daftar anggota keluarga inti, saksi nikah, dan tamu VIP proyek.
 */
export async function getWeddingPartyMembersAction(
  projectId: string
): Promise<ActionResponse<WeddingParty[]>> {
  const session = await getSession();
  const accessCheck = await assertProjectAccess(session, projectId);
  if (!accessCheck.success) return accessCheck;

  try {
    const data = await getWeddingPartyMembers(projectId);
    return { success: true, data };
  } catch (error) {
    console.error("Error in getWeddingPartyMembersAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal memuat daftar keluarga & saksi nikah" },
    };
  }
}

/**
 * Mendaftarkan anggota keluarga / saksi nikah / VIP baru ke proyek.
 */
export async function createWeddingPartyMemberAction(
  rawInput: CreateWeddingPartyMemberInput
): Promise<ActionResponse<WeddingParty>> {
  const session = await getSession();
  const parsed = CreateWeddingPartyMemberSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { projectId, ...memberData } = parsed.data;
  const accessCheck = await assertProjectLeadAccess(session, projectId);
  if (!accessCheck.success) return accessCheck;

  try {
    const data = await createWeddingPartyMember(projectId, memberData);
    revalidatePath(`/projects/${projectId}/rundown`);
    return { success: true, data };
  } catch (error) {
    console.error("Error in createWeddingPartyMemberAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal menambahkan data keluarga" },
    };
  }
}

/**
 * Memperbarui data keluarga / saksi nikah / peran seremonial.
 */
export async function updateWeddingPartyMemberAction(
  rawInput: UpdateWeddingPartyMemberInput
): Promise<ActionResponse<WeddingParty>> {
  const session = await getSession();
  const parsed = UpdateWeddingPartyMemberSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { id, projectId, ...memberData } = parsed.data;
  const accessCheck = await assertProjectLeadAccess(session, projectId);
  if (!accessCheck.success) return accessCheck;

  try {
    const updated = await updateWeddingPartyMember(id, projectId, memberData);
    if (!updated) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Data anggota keluarga tidak ditemukan" },
      };
    }

    revalidatePath(`/projects/${projectId}/rundown`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error in updateWeddingPartyMemberAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal memperbarui data keluarga" },
    };
  }
}

/**
 * Menghapus data anggota keluarga / saksi dari proyek.
 */
export async function deleteWeddingPartyMemberAction(
  rawInput: DeleteWeddingPartyMemberInput
): Promise<ActionResponse<{ success: boolean }>> {
  const session = await getSession();
  const parsed = DeleteWeddingPartyMemberSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  const { id, projectId } = parsed.data;
  const accessCheck = await assertProjectLeadAccess(session, projectId);
  if (!accessCheck.success) return accessCheck;

  try {
    await deleteWeddingPartyMember(id, projectId);
    revalidatePath(`/projects/${projectId}/rundown`);
    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("Error in deleteWeddingPartyMemberAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal menghapus data keluarga" },
    };
  }
}
