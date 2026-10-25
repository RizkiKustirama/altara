"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { assertRole, assertProjectLeadAccess } from "@/lib/auth-guard";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import {
  assignCrewToProject,
  removeCrewFromProject,
  getProjectCrews,
  checkCrewAvailability,
  getCrewDirectory,
  type CrewAssignmentDTO,
  type CrewDirectoryItemDTO,
} from "@/services/crew-service";
import {
  AssignCrewSchema,
  RemoveCrewSchema,
  CreateCrewMemberSchema,
  type AssignCrewInput,
  type RemoveCrewInput,
  type CreateCrewMemberInput,
} from "@/schemas/crew-schema";
import type { ActionResponse } from "@/types/action-response";

export interface CrewUserAvailabilityDTO {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isAvailable: boolean;
  bookedProjectName?: string;
}

export async function assignCrewAction(
  input: AssignCrewInput
): Promise<ActionResponse<CrewAssignmentDTO>> {
  const session = await getSession();
  const auth = await assertProjectLeadAccess(session, input.projectId);
  if (!auth.success) return auth;

  const parsed = AssignCrewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Data penugasan kru tidak valid.",
        details: parsed.error.flatten(),
      },
    };
  }

  const result = await assignCrewToProject(parsed.data);
  if (result.success) {
    revalidatePath(`/projects/${input.projectId}/squad`);
    revalidatePath("/dashboard");
    revalidatePath("/projects");
  }
  return result;
}

export async function removeCrewAction(
  input: RemoveCrewInput
): Promise<ActionResponse<{ deletedId: string }>> {
  const session = await getSession();
  const auth = await assertProjectLeadAccess(session, input.projectId);
  if (!auth.success) return auth;

  const parsed = RemoveCrewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Parameter penghapusan kru tidak valid.",
      },
    };
  }

  const result = await removeCrewFromProject(parsed.data.assignmentId, parsed.data.projectId);
  if (result.success) {
    revalidatePath(`/projects/${input.projectId}/squad`);
    revalidatePath("/dashboard");
    revalidatePath("/projects");
  }
  return result;
}

export async function getProjectCrewsAction(
  projectId: string
): Promise<ActionResponse<CrewAssignmentDTO[]>> {
  return getProjectCrews(projectId);
}

export async function getAvailableCrewUsersAction(
  eventDate: string,
  targetProjectId?: string
): Promise<ActionResponse<CrewUserAvailabilityDTO[]>> {
  const session = await getSession();
  const auth = assertRole(session, ["OWNER", "MANAGEMENT", "CREW"]);
  if (!auth.success) return auth;

  try {
    const allUsers = await db.query.users.findMany({
      where: eq(users.isActive, true),
      columns: { id: true, fullName: true, email: true, phone: true, role: true },
      orderBy: [users.fullName],
    });

    const availabilityList: CrewUserAvailabilityDTO[] = await Promise.all(
      allUsers.map(async (u) => {
        const check = await checkCrewAvailability(u.id, eventDate, targetProjectId);
        return {
          userId: u.id,
          fullName: u.fullName,
          email: u.email,
          phone: u.phone,
          role: u.role,
          isAvailable: check.isAvailable,
          bookedProjectName: check.conflictingProjectName,
        };
      })
    );

    return { success: true, data: availabilityList };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal memeriksa ketersediaan staf kru.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

export async function getCrewDirectoryAction(): Promise<ActionResponse<CrewDirectoryItemDTO[]>> {
  const session = await getSession();
  const auth = assertRole(session, ["OWNER", "MANAGEMENT", "CREW"]);
  if (!auth.success) return auth;

  return getCrewDirectory();
}

export async function createCrewMemberAction(
  input: CreateCrewMemberInput
): Promise<ActionResponse<{ userId: string; fullName: string }>> {
  const session = await getSession();
  const auth = assertRole(session, ["OWNER", "MANAGEMENT"]);
  if (!auth.success) return auth;

  const parsed = CreateCrewMemberSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Data pendaftaran kru tidak valid.",
        details: parsed.error.flatten(),
      },
    };
  }

  try {
    // Check if email already registered
    const existing = await db.query.users.findFirst({
      where: eq(users.email, parsed.data.email),
      columns: { id: true },
    });

    if (existing) {
      return {
        success: false,
        error: {
          code: "CONFLICT_SCHEDULE",
          message: "Alamat email sudah terdaftar di sistem Altara.",
        },
      };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password ?? "password123", 10);

    const inserted = await db
      .insert(users)
      .values({
        fullName: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        role: parsed.data.role,
        passwordHash,
        isActive: true,
      })
      .returning({ id: users.id, fullName: users.fullName });

    const newUser = inserted[0];
    if (!newUser) {
      return {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Gagal menyimpan data pengguna ke basis data.",
        },
      };
    }

    revalidatePath("/crew");
    revalidatePath("/dashboard");
    revalidatePath("/projects");

    return {
      success: true,
      data: {
        userId: newUser.id,
        fullName: newUser.fullName,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal mendaftarkan kru baru.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}
