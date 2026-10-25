"use server";

import { revalidatePath } from "next/cache";
import { assertRole } from "@/lib/auth-guard";
import { getSession } from "@/lib/auth";
import {
  getAllCrewPayouts,
  createCrewPayout,
  executeBatchPayout,
  type CrewPayoutDTO,
} from "@/services/payout-service";
import {
  getCompanyExecutiveFinancials,
  type ExecutiveFinancialOverviewDTO,
} from "@/services/company-finance-service";
import {
  BatchCrewPayoutSchema,
  RecordCrewPayoutSchema,
  type BatchCrewPayoutInput,
  type RecordCrewPayoutInput,
} from "@/schemas/finance-schema";
import type { ActionResponse } from "@/types/action-response";
import type { CrewPayout } from "@/db/schema/company-finances";

// ----------------------------------------------------------------------
// Tier 2A: Crew Payouts (Allowed for OWNER and MANAGEMENT - Maya & Dimas)
// ----------------------------------------------------------------------

export async function getAllCrewPayoutsAction(
  filterStatus?: "PENDING" | "PAID"
): Promise<ActionResponse<CrewPayoutDTO[]>> {
  const session = await getSession();
  const auth = assertRole(session, ["OWNER", "MANAGEMENT"]);
  if (!auth.success) return auth;

  try {
    const data = await getAllCrewPayouts(filterStatus);
    return { success: true, data };
  } catch (error) {
    console.error("Error in getAllCrewPayoutsAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal memuat rekapitulasi honor kru" },
    };
  }
}

export async function recordCrewPayoutAction(
  rawInput: RecordCrewPayoutInput
): Promise<ActionResponse<CrewPayout>> {
  const session = await getSession();
  const auth = assertRole(session, ["OWNER", "MANAGEMENT"]);
  if (!auth.success) return auth;

  const parsed = RecordCrewPayoutSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  try {
    const data = await createCrewPayout(parsed.data);
    revalidatePath("/payouts");
    revalidatePath("/finance/margins");
    return { success: true, data };
  } catch (error) {
    console.error("Error in recordCrewPayoutAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal mencatat honor kru" },
    };
  }
}

export async function executeBatchCrewPayoutAction(
  rawInput: BatchCrewPayoutInput
): Promise<ActionResponse<{ updatedCount: number }>> {
  const session = await getSession();
  const auth = assertRole(session, ["OWNER", "MANAGEMENT"]);
  if (!auth.success) return auth;

  const parsed = BatchCrewPayoutSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? "Input tidak valid",
      },
    };
  }

  try {
    const noteText = parsed.data.paymentReference
      ? `Dicairkan massal via ${parsed.data.paymentReference}. ${parsed.data.notes || ""}`
      : parsed.data.notes;

    const data = await executeBatchPayout(parsed.data.payoutIds, noteText);
    revalidatePath("/payouts");
    revalidatePath("/finance/margins");
    return { success: true, data };
  } catch (error) {
    console.error("Error in executeBatchCrewPayoutAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal mencairkan honor massal" },
    };
  }
}

// ----------------------------------------------------------------------
// Tier 2B: Company Executive Profits & Margins (STRICTLY OWNER ONLY - Dimas)
// ----------------------------------------------------------------------

export async function getExecutiveFinancialOverviewAction(): Promise<
  ActionResponse<ExecutiveFinancialOverviewDTO>
> {
  const session = await getSession();
  const auth = assertRole(session, ["OWNER"]);
  if (!auth.success) {
    return {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Akses Ditolak: Laba kotor & margin bersih merupakan informasi eksklusif Owner.",
      },
    };
  }

  try {
    const data = await getCompanyExecutiveFinancials();
    return { success: true, data };
  } catch (error) {
    console.error("Error in getExecutiveFinancialOverviewAction:", error);
    return {
      success: false,
      error: { code: "BAD_REQUEST", message: "Gagal memuat rekapitulasi margin bisnis" },
    };
  }
}
