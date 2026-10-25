import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { projectCrews } from "@/db/schema";
import type { UserSession, GlobalRole } from "@/types/auth";
import type { ActionResponse } from "@/types/action-response";

/**
 * Memvalidasi apakah pengguna memiliki salah satu dari global role yang diizinkan.
 */
export function assertRole(
  session: UserSession | null,
  allowedRoles: readonly GlobalRole[]
): ActionResponse<void> {
  if (!session) {
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Sesi kerja telah berakhir. Silakan masuk kembali ke akun Anda.",
      },
    };
  }

  if (!allowedRoles.includes(session.role)) {
    return {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Anda tidak memiliki wewenang untuk mengakses atau memodifikasi data ini.",
      },
    };
  }

  return { success: true, data: undefined };
}

/**
 * Memvalidasi apakah pengguna memiliki hak akses ke proyek pernikahan tertentu.
 * - OWNER & PLANNER: Akses penuh ke seluruh proyek (lintas proyek).
 * - CREW: Hanya diizinkan mengakses proyek tempat ia ditugaskan pada tabel project_crews.
 */
export async function assertProjectAccess(
  session: UserSession | null,
  projectId: string
): Promise<ActionResponse<void>> {
  if (!session) {
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Sesi kerja telah berakhir. Silakan masuk kembali.",
      },
    };
  }

  // OWNER dan PLANNER memiliki hak wewenang lintas seluruh proyek pernikahan
  if (session.role === "OWNER" || session.role === "PLANNER") {
    return { success: true, data: undefined };
  }

  // Untuk CREW, periksa apakah terdaftar di penugasan skuad proyek
  const assignment = await db.query.projectCrews.findFirst({
    where: and(
      eq(projectCrews.projectId, projectId),
      eq(projectCrews.userId, session.userId)
    ),
    columns: { id: true },
  });

  if (!assignment) {
    return {
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Anda tidak terdaftar sebagai staf penugasan pada proyek pernikahan ini.",
      },
    };
  }

  return { success: true, data: undefined };
}
