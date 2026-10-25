"use server";

import { db } from "@/db";
import { projects, projectCrews } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { assertRole, assertProjectAccess } from "@/lib/auth-guard";
import { getSession } from "@/lib/auth";
import { CreateProjectSchema, type CreateProjectInput } from "@/schemas/project-schema";
import type { ActionResponse } from "@/types/action-response";

export interface ProjectItemDTO {
  id: string;
  projectName: string;
  clientGroomName: string;
  clientBrideName: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string | null;
  status: string;
  publicToken: string;
  contractAmount?: number;
  crewCount: number;
  createdAt: string;
}

export interface ProjectOverviewDTO {
  id: string;
  projectName: string;
  clientGroomName: string;
  clientBrideName: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string | null;
  status: string;
  publicToken: string;
  contractAmount?: number; // Eksklusif OWNER & PLANNER (disembunyikan dari CREW)
  crewCount: number;
  vendorCount: number;
}

export async function createProjectAction(
  input: CreateProjectInput
): Promise<ActionResponse<{ id: string; publicToken: string; projectName: string }>> {
  const session = await getSession();
  const auth = assertRole(session, ["OWNER", "PLANNER"]);
  if (!auth.success) return auth;

  const parsed = CreateProjectSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Input formulir proyek tidak valid.",
        details: parsed.error.flatten(),
      },
    };
  }

  try {
    const publicToken = nanoid(21);

    const [newProject] = await db
      .insert(projects)
      .values({
        projectName: parsed.data.projectName,
        clientGroomName: parsed.data.clientGroomName,
        clientBrideName: parsed.data.clientBrideName,
        weddingDate: parsed.data.weddingDate,
        venueName: parsed.data.venueName,
        venueAddress: parsed.data.venueAddress ?? null,
        contractAmount: String(parsed.data.contractAmount),
        packageId: parsed.data.packageId ?? null,
        publicToken,
        status: "PLANNING",
      })
      .returning();

    if (!newProject) {
      return {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Gagal menyimpan proyek ke database.",
        },
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/projects");

    return {
      success: true,
      data: {
        id: newProject.id,
        publicToken: newProject.publicToken,
        projectName: newProject.projectName,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal membuat proyek pernikahan baru.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

export async function getProjectsAction(): Promise<ActionResponse<ProjectItemDTO[]>> {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Sesi login Anda telah berakhir. Silakan login kembali.",
      },
    };
  }

  try {
    let projectList;

    if (session.role === "CREW") {
      // Kru hanya dapat melihat proyek di mana mereka ditugaskan
      const assigned = await db.query.projectCrews.findMany({
        where: eq(projectCrews.userId, session.userId),
        columns: { projectId: true },
      });

      const projectIds = assigned.map((a) => a.projectId);
      if (projectIds.length === 0) {
        return { success: true, data: [] };
      }

      projectList = await db.query.projects.findMany({
        where: inArray(projects.id, projectIds),
        with: {
          crews: { columns: { id: true } },
        },
        orderBy: [desc(projects.weddingDate)],
      });
    } else {
      // OWNER & PLANNER melihat seluruh proyek
      projectList = await db.query.projects.findMany({
        with: {
          crews: { columns: { id: true } },
        },
        orderBy: [desc(projects.weddingDate)],
      });
    }

    const result: ProjectItemDTO[] = projectList.map((p) => ({
      id: p.id,
      projectName: p.projectName,
      clientGroomName: p.clientGroomName,
      clientBrideName: p.clientBrideName,
      weddingDate: p.weddingDate,
      venueName: p.venueName,
      venueAddress: p.venueAddress,
      status: p.status,
      publicToken: p.publicToken,
      // Privasi finansial: contractAmount disembunyikan untuk role CREW
      contractAmount:
        session.role === "CREW" ? undefined : Number(p.contractAmount),
      crewCount: p.crews.length,
      createdAt: p.createdAt.toISOString(),
    }));

    return { success: true, data: result };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal mengambil daftar proyek.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}

export async function getProjectOverviewAction(
  projectId: string
): Promise<ActionResponse<ProjectOverviewDTO>> {
  const session = await getSession();
  const access = await assertProjectAccess(session, projectId);
  if (!access.success) return access;

  try {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, projectId),
      with: {
        crews: { columns: { id: true } },
        vendors: { columns: { id: true } },
      },
    });

    if (!project) {
      return {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Data proyek tidak ditemukan.",
        },
      };
    }

    return {
      success: true,
      data: {
        id: project.id,
        projectName: project.projectName,
        clientGroomName: project.clientGroomName,
        clientBrideName: project.clientBrideName,
        weddingDate: project.weddingDate,
        venueName: project.venueName,
        venueAddress: project.venueAddress,
        status: project.status,
        publicToken: project.publicToken,
        contractAmount:
          session?.role === "CREW" ? undefined : Number(project.contractAmount),
        crewCount: project.crews.length,
        vendorCount: project.vendors.length,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal mengambil ringkasan proyek.",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
}
