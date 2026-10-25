# Sprint 3: Manajemen Proyek, Skuad & Mesin Anti-Bentrok Penjadwalan Kru Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Membangun modul pendaftaran proyek pernikahan baru dengan auto-generated `public_token`, mesin validasi anti-bentrok jadwal kru 2-lapis (Service query check + PostgreSQL UNIQUE constraint fallback), Server Actions proyek & penugasan kru dengan guard RBAC, antarmuka desktop kalender operasional multi-event (Sprig CRM dense aesthetic) berfitur *Live Time Marker*, serta slide-over drawer (`Sheet`) alokasi skuad kru dengan deteksi bentrok real-time.

**Architecture:** Operasi mutasi proyek dan penugasan kru dilayani oleh Next.js Server Actions yang diamankan oleh guard RBAC (`assertRole(["OWNER", "PLANNER"])`). Validasi bentrok kru dieksekusi secara preventif di service layer (`crew-service.ts`) sebelum mutasi database dan dijamin integritasnya oleh database constraint `unique_crew_event_date` (`UNIQUE(user_id, event_date)`). Tampilan desktop mengadopsi estetika Sprig CRM dengan layout shell terstruktur, grid kalender operasional Jumat–Minggu, dan slide-over sheet untuk alokasi kru.

**Tech Stack:** Next.js 14 (App Router), TypeScript Strict (`noImplicitAny`), Drizzle ORM, PostgreSQL, Zod, nanoid, date-fns, Tailwind CSS, Shadcn UI primitives (`Sheet`, `Dialog`, `Table`, `Badge`, `Card`, `Button`, `Input`, `DropdownMenu`), Sonner.

---

## Daftar Tugas Bertahap (Sprint 3)

```
Sprint 3: Manajemen Proyek, Skuad & Mesin Anti-Bentrok Penjadwalan Kru
├── Task 3.1: Skema Validasi Zod Proyek & Penugasan Kru
│   ├── CreateProjectSchema, UpdateProjectSchema
│   └── AssignCrewSchema, RemoveCrewSchema
├── Task 3.2: Mesin Validasi Anti-Bentrok Kru (Anti-Collision Engine)
│   ├── checkCrewAvailability (Service Query Check)
│   ├── assignCrewToProject (Preventive validation & error CONFLICT_SCHEDULE)
│   └── removeCrewFromProject & getProjectCrews
├── Task 3.3: Server Actions Proyek & Kru Skuad
│   ├── createProjectAction (nanoid publicToken generation)
│   ├── getProjectsAction & getProjectOverviewAction (RBAC financial privacy)
│   └── assignCrewAction, removeCrewAction, getAvailableCrewUsersAction
├── Task 3.4: Desktop UI: Shell Navigasi & Multi-Event Operational Calendar Grid
│   ├── Layout Admin Shell (Collapsible Sidebar & Top Bar Sprig Theme)
│   ├── Calendar Grid Operasional Akhir Pekan (Jumat-Minggu, 06:00-23:00)
│   └── Live Time Marker Line (Now Line dengan Indikator Real-Time)
└── Task 3.5: UI Registrasi Proyek & Slide-Over Alokasi Skuad Kru
    ├── Halaman Daftar Proyek & Form Registrasi Proyek (/projects/new)
    ├── Halaman Alokasi Skuad (/projects/[projectId]/squad)
    └── Slide-Over Drawer Alokasi Kru dengan Deteksi Bentrok & Sonner Toast
```

---

### Task 3.1: Skema Validasi Zod Proyek & Penugasan Kru

**Deskripsi:** Mendefinisikan skema validasi Zod untuk pembuatan proyek pernikahan, pembaruan status proyek, penugasan kru ke acara dengan role tertentu, serta pembatalan penugasan. Skema ini memastikan input form dan payload Server Actions tervalidasi secara ketat dan konsisten dengan tipe relasional basis data.

**Berkas:**
- Buat: `src/schemas/project-schema.ts`
- Buat: `src/schemas/crew-schema.ts`
- Buat Test: `tests/schemas/project-crew-schema.test.ts`

**Langkah Implementasi:**

1. **Step 1: Tulis unit test untuk validasi skema proyek dan kru (`tests/schemas/project-crew-schema.test.ts`):**
   ```typescript
   import { CreateProjectSchema, UpdateProjectSchema } from "../../src/schemas/project-schema";
   import { AssignCrewSchema, RemoveCrewSchema } from "../../src/schemas/crew-schema";

   async function runSchemaTests() {
     console.log("🧪 Testing Project & Crew Zod validation schemas...");

     // 1. Valid Create Project
     const validProject = CreateProjectSchema.safeParse({
       projectName: "The Wedding of Bella & Kevin",
       clientGroomName: "Kevin Sanjaya",
       clientBrideName: "Bella Clarissa",
       weddingDate: "2026-10-24",
       venueName: "Grand Ballroom Hotel Mulia",
       venueAddress: "Jl. Asia Afrika Senayan Jakarta",
       contractAmount: 150000000,
     });
     if (!validProject.success) throw new Error("Valid project schema rejected: " + JSON.stringify(validProject.error));
     console.log("✅ Valid project schema passed");

     // 2. Invalid Date format
     const invalidDateProject = CreateProjectSchema.safeParse({
       projectName: "Project Test",
       clientGroomName: "Groom",
       clientBrideName: "Bride",
       weddingDate: "24-10-2026", // Wrong format
       venueName: "Venue Test",
       contractAmount: 10000000,
     });
     if (invalidDateProject.success) throw new Error("Invalid date format was accepted!");
     console.log("✅ Invalid weddingDate correctly rejected");

     // 3. Valid Assign Crew
     const validCrew = AssignCrewSchema.safeParse({
       projectId: "123e4567-e89b-12d3-a456-426614174000",
       userId: "123e4567-e89b-12d3-a456-426614174001",
       roleInProject: "LEAD_PLANNER",
       shiftStart: "06:00",
       shiftEnd: "15:00",
     });
     if (!validCrew.success) throw new Error("Valid crew assignment schema rejected");
     console.log("✅ Valid crew assignment passed");

     // 4. Invalid Shift Time
     const invalidTimeCrew = AssignCrewSchema.safeParse({
       projectId: "123e4567-e89b-12d3-a456-426614174000",
       userId: "123e4567-e89b-12d3-a456-426614174001",
       roleInProject: "RUNNER",
       shiftStart: "25:99", // Invalid time
     });
     if (invalidTimeCrew.success) throw new Error("Invalid shift time was accepted!");
     console.log("✅ Invalid shift time correctly rejected");

     console.log("🎉 All schema tests passed successfully!");
   }

   runSchemaTests().catch((err) => {
     console.error("❌ Test failed:", err);
     process.exit(1);
   });
   ```

2. **Step 2: Jalankan test untuk memverifikasi kegagalan:**
   - Jalankan: `npx tsx tests/schemas/project-crew-schema.test.ts`
   - Ekspektasi: FAIL (Cannot find module `../../src/schemas/project-schema`).

3. **Step 3: Implementasikan `src/schemas/project-schema.ts`:**
   ```typescript
   import { z } from "zod";

   export const projectStatusEnumSchema = z.enum([
     "LEAD",
     "PLANNING",
     "READY",
     "IN_PROGRESS",
     "COMPLETED",
     "CANCELLED",
   ]);

   export const CreateProjectSchema = z.object({
     packageId: z.string().uuid("Format ID paket tidak valid").optional(),
     projectName: z.string().min(3, "Nama proyek minimal 3 karakter"),
     clientGroomName: z.string().min(2, "Nama pengantin pria wajib diisi"),
     clientBrideName: z.string().min(2, "Nama pengantin wanita wajib diisi"),
     weddingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
     venueName: z.string().min(3, "Nama venue wajib diisi"),
     venueAddress: z.string().optional(),
     contractAmount: z.number().nonnegative("Nilai kontrak tidak boleh negatif").default(0),
   });

   export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
     id: z.string().uuid("ID proyek wajib berupa UUID"),
     status: projectStatusEnumSchema.optional(),
   });

   export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
   export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
   ```

4. **Step 4: Implementasikan `src/schemas/crew-schema.ts`:**
   ```typescript
   import { z } from "zod";

   export const crewRoleEnumSchema = z.enum([
     "LEAD_PLANNER",
     "LO_BRIDE",
     "LO_GROOM",
     "LO_FAMILY",
     "RUNNER",
     "LOGISTICS",
     "CEREMONY_OFFICER",
     "USHER",
   ]);

   export const AssignCrewSchema = z.object({
     projectId: z.string().uuid("ID proyek tidak valid"),
     userId: z.string().uuid("ID pengguna tidak valid"),
     roleInProject: z.string().min(2, "Role penugasan wajib diisi"),
     shiftStart: z
       .string()
       .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam mulai harus HH:mm")
       .optional(),
     shiftEnd: z
       .string()
       .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam selesai harus HH:mm")
       .optional(),
   });

   export const RemoveCrewSchema = z.object({
     assignmentId: z.string().uuid("ID penugasan tidak valid"),
     projectId: z.string().uuid("ID proyek tidak valid"),
   });

   export type AssignCrewInput = z.infer<typeof AssignCrewSchema>;
   export type RemoveCrewInput = z.infer<typeof RemoveCrewSchema>;
   ```

5. **Step 5: Jalankan test kembali:**
   - Jalankan: `npx tsx tests/schemas/project-crew-schema.test.ts`
   - Ekspektasi: PASS (semua 4 pengujian skema lolos).

6. **Step 6: Commit:**
   - `git add src/schemas/project-schema.ts src/schemas/crew-schema.ts tests/schemas/project-crew-schema.test.ts`
   - `git commit -m "feat(schema): implement Zod validation schemas for projects and crew assignments (Task 3.1)"`

---

### Task 3.2: Mesin Validasi Anti-Bentrok Kru (Anti-Collision Engine)

**Deskripsi:** Membangun *Anti-Collision Engine* pada service layer (`src/services/crew-service.ts`) untuk memeriksa jadwal kru sebelum penugasan ke proyek pernikahan. Jika kru sudah ditugaskan pada proyek lain di tanggal yang sama (`event_date`), batalkan operasi dan kembalikan error `ActionError` berkode `CONFLICT_SCHEDULE` dengan nama kru, nama proyek bentrok, dan tanggal acara. Sediakan pula database unique constraint fallback untuk menjaga integritas data konkurensi.

**Berkas:**
- Buat: `src/services/crew-service.ts`
- Buat Test: `tests/crew/anti-conflict.test.ts`

**Langkah Implementasi:**

1. **Step 1: Tulis unit test untuk logika anti-bentrok (`tests/crew/anti-conflict.test.ts`):**
   ```typescript
   import { checkCrewAvailability } from "../../src/services/crew-service";

   async function runAntiConflictTest() {
     console.log("🧪 Testing Anti-Collision Service logic...");

     // Tes ketersediaan kru: fungsi murni / query check
     // Pastikan interface mengembalikan flag isAvailable dan detail proyek jika bentrok
     const mockUserId = "123e4567-e89b-12d3-a456-426614174000";
     const mockEventDate = "2026-10-24";

     const result = await checkCrewAvailability(mockUserId, mockEventDate);
     console.log("✅ checkCrewAvailability returned availability contract:", typeof result.isAvailable === "boolean");

     console.log("🎉 Anti-conflict test passed!");
   }

   runAntiConflictTest().catch((err) => {
     console.error("❌ Test failed:", err);
     process.exit(1);
   });
   ```

2. **Step 2: Jalankan test untuk memverifikasi kegagalan:**
   - Jalankan: `npx tsx tests/crew/anti-conflict.test.ts`
   - Ekspektasi: FAIL (Cannot find module `../../src/services/crew-service`).

3. **Step 3: Implementasikan `src/services/crew-service.ts`:**
   ```typescript
   import { db } from "@/db";
   import { projectCrews, projects, users } from "@/db/schema";
   import { eq, and, ne } from "drizzle-orm";
   import type { ActionResponse } from "@/types/action-response";
   import type { AssignCrewInput } from "@/schemas/crew-schema";

   export interface CrewAvailabilityCheckResult {
     isAvailable: boolean;
     conflictingProjectName?: string;
     conflictingProjectId?: string;
     crewName?: string;
   }

   export interface CrewAssignmentDTO {
     assignmentId: string;
     projectId: string;
     userId: string;
     crewName: string;
     crewEmail: string;
     crewPhone: string;
     eventDate: string;
     roleInProject: string;
     shiftStart: string | null;
     shiftEnd: string | null;
   }

   export async function checkCrewAvailability(
     userId: string,
     eventDate: string,
     excludeProjectId?: string
   ): Promise<CrewAvailabilityCheckResult> {
     const conditions = [
       eq(projectCrews.userId, userId),
       eq(projectCrews.eventDate, eventDate),
     ];

     if (excludeProjectId) {
       conditions.push(ne(projectCrews.projectId, excludeProjectId));
     }

     const existing = await db.query.projectCrews.findFirst({
       where: and(...conditions),
       with: {
         project: {
           columns: { id: true, projectName: true },
         },
         user: {
           columns: { fullName: true },
         },
       },
     });

     if (existing) {
       return {
         isAvailable: false,
         conflictingProjectId: existing.projectId,
         conflictingProjectName: existing.project?.projectName ?? "proyek lain",
         crewName: existing.user?.fullName ?? "Kru",
       };
     }

     return { isAvailable: true };
   }

   export async function assignCrewToProject(
     input: AssignCrewInput
   ): Promise<ActionResponse<CrewAssignmentDTO>> {
     try {
       // 1. Ambil data proyek untuk mendapatkan wedding_date
       const project = await db.query.projects.findFirst({
         where: eq(projects.id, input.projectId),
         columns: { id: true, weddingDate: true, projectName: true },
       });

       if (!project) {
         return {
           success: false,
           error: {
             code: "NOT_FOUND",
             message: "Data proyek pernikahan tidak ditemukan.",
           },
         };
       }

       // 2. Validasi Anti-Bentrok Jadwal pada Application Layer
       const availability = await checkCrewAvailability(
         input.userId,
         project.weddingDate,
         input.projectId
       );

       if (!availability.isAvailable) {
         const crewName = availability.crewName ?? "Kru";
         const conflictProject = availability.conflictingProjectName ?? "proyek lain";

         return {
           success: false,
           error: {
             code: "CONFLICT_SCHEDULE",
             message: `${crewName} sudah terjadwal bertugas di ${conflictProject} pada tanggal ${project.weddingDate}.`,
             details: {
               conflictingProjectId: availability.conflictingProjectId,
               eventDate: project.weddingDate,
               userId: input.userId,
             },
           },
         };
       }

       // 3. Simpan ke database
       const [newAssignment] = await db
         .insert(projectCrews)
         .values({
           projectId: input.projectId,
           userId: input.userId,
           eventDate: project.weddingDate,
           roleInProject: input.roleInProject,
           shiftStart: input.shiftStart ?? null,
           shiftEnd: input.shiftEnd ?? null,
         })
         .returning();

       // 4. Ambil profil user untuk respons DTO lengkap
       const userProfile = await db.query.users.findFirst({
         where: eq(users.id, input.userId),
         columns: { fullName: true, email: true, phone: true },
       });

       return {
         success: true,
         data: {
           assignmentId: newAssignment.id,
           projectId: newAssignment.projectId,
           userId: newAssignment.userId,
           crewName: userProfile?.fullName ?? "Kru",
           crewEmail: userProfile?.email ?? "",
           crewPhone: userProfile?.phone ?? "",
           eventDate: newAssignment.eventDate,
           roleInProject: newAssignment.roleInProject,
           shiftStart: newAssignment.shiftStart,
           shiftEnd: newAssignment.shiftEnd,
         },
       };
     } catch (err: unknown) {
       // Database Unique Constraint Fallback ("unique_crew_event_date")
       const dbError = err as { code?: string; constraint?: string; message?: string };
       if (dbError.constraint === "unique_crew_event_date" || dbError.code === "23505") {
         return {
           success: false,
           error: {
             code: "CONFLICT_SCHEDULE",
             message: "Kru tersebut sudah ditugaskan pada tanggal acara yang sama (Constraint Database).",
             details: dbError.message,
           },
         };
       }

       return {
         success: false,
         error: {
           code: "BAD_REQUEST",
           message: "Gagal menugaskan kru ke proyek.",
           details: err instanceof Error ? err.message : String(err),
         },
       };
     }
   }

   export async function removeCrewFromProject(
     assignmentId: string,
     projectId: string
   ): Promise<ActionResponse<{ deletedId: string }>> {
     try {
       const deleted = await db
         .delete(projectCrews)
         .where(
           and(
             eq(projectCrews.id, assignmentId),
             eq(projectCrews.projectId, projectId)
           )
         )
         .returning({ id: projectCrews.id });

       if (!deleted.length) {
         return {
           success: false,
           error: {
             code: "NOT_FOUND",
             message: "Data penugasan kru tidak ditemukan.",
           },
         };
       }

       return {
         success: true,
         data: { deletedId: deleted[0].id },
       };
     } catch (err: unknown) {
       return {
         success: false,
         error: {
           code: "BAD_REQUEST",
           message: "Gagal menghapus penugasan kru.",
           details: err instanceof Error ? err.message : String(err),
         },
       };
     }
   }

   export async function getProjectCrews(
     projectId: string
   ): Promise<ActionResponse<CrewAssignmentDTO[]>> {
     try {
       const list = await db.query.projectCrews.findMany({
         where: eq(projectCrews.projectId, projectId),
         with: {
           user: {
             columns: { fullName: true, email: true, phone: true },
           },
         },
         orderBy: [projectCrews.createdAt],
       });

       return {
         success: true,
         data: list.map((item) => ({
           assignmentId: item.id,
           projectId: item.projectId,
           userId: item.userId,
           crewName: item.user?.fullName ?? "Kru",
           crewEmail: item.user?.email ?? "",
           crewPhone: item.user?.phone ?? "",
           eventDate: item.eventDate,
           roleInProject: item.roleInProject,
           shiftStart: item.shiftStart,
           shiftEnd: item.shiftEnd,
         })),
       };
     } catch (err: unknown) {
       return {
         success: false,
         error: {
           code: "BAD_REQUEST",
           message: "Gagal mengambil daftar kru proyek.",
           details: err instanceof Error ? err.message : String(err),
         },
       };
     }
   }
   ```

4. **Step 4: Jalankan test anti-bentrok:**
   - Jalankan: `npx tsx tests/crew/anti-conflict.test.ts`
   - Ekspektasi: PASS.

5. **Step 5: Verifikasi typecheck:**
   - Jalankan: `npm run typecheck`
   - Ekspektasi: Clean (0 errors).

6. **Step 6: Commit:**
   - `git add src/services/crew-service.ts tests/crew/anti-conflict.test.ts`
   - `git commit -m "feat(crew): implement anti-collision engine and crew assignment service (Task 3.2)"`

---

### Task 3.3: Server Actions Proyek & Kru Skuad

**Deskripsi:** Membangun Server Actions untuk pembuatan proyek pernikahan dengan pembuatan `public_token` instan via `nanoid(21)`, pengambilan daftar proyek, ringkasan operasional proyek berprivasi finansial RBAC (sembunyikan `contractAmount` untuk role CREW), penugasan kru dengan anti-bentrok, serta pengecekan ketersediaan kru di tanggal acara tertentu.

**Berkas:**
- Buat: `src/actions/project-actions.ts`
- Buat: `src/actions/crew-actions.ts`
- Buat Test: `tests/project/project-actions.test.ts`

**Langkah Implementasi:**

1. **Step 1: Tulis unit test untuk verifikasi kontrak Server Actions (`tests/project/project-actions.test.ts`):**
   ```typescript
   import { nanoid } from "nanoid";

   async function runProjectActionContractTest() {
     console.log("🧪 Testing Project & Crew action helper contracts...");

     // Test publicToken generator: nanoid length 21 URL-safe
     const token = nanoid(21);
     if (token.length !== 21) throw new Error("Public token must be 21 chars");
     if (!/^[A-Za-z0-9_-]+$/.test(token)) throw new Error("Public token must be URL-safe");
     console.log("✅ Public token generated correctly:", token);

     console.log("🎉 Project actions contract test passed!");
   }

   runProjectActionContractTest().catch((err) => {
     console.error("❌ Test failed:", err);
     process.exit(1);
   });
   ```

2. **Step 2: Jalankan test:**
   - Jalankan: `npx tsx tests/project/project-actions.test.ts`
   - Ekspektasi: PASS.

3. **Step 3: Implementasikan `src/actions/project-actions.ts`:**
   ```typescript
   "use server";

   import { db } from "@/db";
   import { projects, projectCrews, projectVendors } from "@/db/schema";
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
     contractAmount?: number; // Eksklusif OWNER & PLANNER
     crewCount: number;
     vendorCount: number;
   }

   export async function createProjectAction(
     input: CreateProjectInput
   ): Promise<ActionResponse<{ id: string; publicToken: string; projectName: string }>> {
     const auth = await assertRole(["OWNER", "PLANNER"]);
     if (!auth.authorized) return auth.response;

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
         // Nilai kontrak dirahasiakan dari role CREW
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
     const access = await assertProjectAccess(projectId);
     if (!access.authorized) return access.response;

     const session = await getSession();

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
   ```

4. **Step 4: Implementasikan `src/actions/crew-actions.ts`:**
   ```typescript
   "use server";

   import { db } from "@/db";
   import { users } from "@/db/schema";
   import { eq } from "drizzle-orm";
   import { revalidatePath } from "next/cache";
   import { assertRole } from "@/lib/auth-guard";
   import {
     assignCrewToProject,
     removeCrewFromProject,
     getProjectCrews,
     checkCrewAvailability,
     type CrewAssignmentDTO,
   } from "@/services/crew-service";
   import {
     AssignCrewSchema,
     RemoveCrewSchema,
     type AssignCrewInput,
     type RemoveCrewInput,
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
     const auth = await assertRole(["OWNER", "PLANNER"]);
     if (!auth.authorized) return auth.response;

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
     }
     return result;
   }

   export async function removeCrewAction(
     input: RemoveCrewInput
   ): Promise<ActionResponse<{ deletedId: string }>> {
     const auth = await assertRole(["OWNER", "PLANNER"]);
     if (!auth.authorized) return auth.response;

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
     const auth = await assertRole(["OWNER", "PLANNER"]);
     if (!auth.authorized) return auth.response;

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
           message: "Gagal mengambil daftar ketersediaan kru.",
           details: err instanceof Error ? err.message : String(err),
         },
       };
     }
   }
   ```

5. **Step 5: Verifikasi typecheck:**
   - Jalankan: `npm run typecheck`
   - Ekspektasi: Clean (0 errors).

6. **Step 6: Commit:**
   - `git add src/actions/project-actions.ts src/actions/crew-actions.ts tests/project/project-actions.test.ts`
   - `git commit -m "feat(actions): implement project and crew Server Actions with RBAC protection (Task 3.3)"`

---

### Task 3.4: Desktop UI: Shell Navigasi & Multi-Event Operational Calendar Grid

**Deskripsi:** Membangun antarmuka utama desktop untuk perencana pernikahan (*Planner*) dan pemilik (*Owner*), mengadopsi estetika Sprig CRM (`impeccable` Operate mode). Mencakup collapsible sidebar dengan *workspace pill* Altara, top bar dengan pencarian instan dan profil pengguna, serta grid kalender operasional multi-event (Jumat–Minggu) dengan slot jam operasional (06:00–23:00) dan *Live Time Marker* dinamis.

**Berkas:**
- Buat: `src/components/admin/sidebar.tsx`
- Buat: `src/components/admin/top-bar.tsx`
- Buat: `src/app/(admin)/layout.tsx`
- Buat: `src/components/admin/live-time-marker.tsx`
- Buat: `src/components/admin/calendar-grid.tsx`
- Modifikasi/Buat: `src/app/(admin)/dashboard/page.tsx`

**Langkah Implementasi:**

1. **Step 1: Implementasikan `src/components/admin/sidebar.tsx`:**
   - Komponen Sidebar desktop responsif dengan logo "Altara Wedding Organizer", navigasi utama (Dashboard, Proyek, Vendor Rekanan, Skuad Kru, Dapur Finansial).
   - Menu Finansial disembunyikan otomatis jika user bukan `OWNER`.
   - Profil pill di bagian bawah dengan inisial avatar dan tombol sign out.

2. **Step 2: Implementasikan `src/components/admin/top-bar.tsx`:**
   - Tinggi `h-14`, border bawah halus (`border-b border-border/60`), indikator tanggal hari ini dalam format Bahasa Indonesia (misal: "Minggu, 25 Oktober 2026"), quick button "+ Proyek Baru" yang mengarahkan ke `/projects/new`.

3. **Step 3: Implementasikan `src/app/(admin)/layout.tsx`:**
   - Server Component membaca `getSession()`. Jika tidak ada sesi, redirect ke `/login`.
   - Merender `<Sidebar>` di sisi kiri dan `<TopBar>` di atas konten utama dengan background netral tenang `bg-stone-50/50`.

4. **Step 4: Implementasikan `src/components/admin/live-time-marker.tsx`:**
   - Komponen penanda waktu real-time berupa garis horizontal beraksen merah muda (`h-0.5 bg-rose-500 relative z-20`) yang menghitung posisi persentase top berdasarkan jam dan menit saat ini (antara 06:00 hingga 23:00).
   - Menampilkan dot berkedip (`animate-ping`) dan badge jam WIB sekarang ("13:45 WIB").

5. **Step 5: Implementasikan `src/components/admin/calendar-grid.tsx`:**
   - Grid 3 kolom utama berfokus pada akhir pekan operasional pernikahan (Jumat, Sabtu, Minggu) atau navigasi minggu sebelumnya/berikutnya.
   - Kolom waktu vertikal (06:00 - 23:00).
   - Menempatkan kartu proyek (*Project Block Cards*) sesuai `weddingDate`:
     - Nama pengantin & venue.
     - Badge status (Planning / Ready / In Progress).
     - Jumlah kru yang telah ditugaskan.
     - Tautan langsung ke detail alokasi kru `/projects/[id]/squad`.

6. **Step 6: Implementasikan `src/app/(admin)/dashboard/page.tsx`:**
   - Server Component mengambil data proyek via `getProjectsAction()`.
   - Merender metrik ringkas operasional (Total Proyek Aktif, Pernikahan Akhir Pekan Ini, Total Kru Bertugas) dan komponen `<CalendarGrid>`.

7. **Step 7: Verifikasi typecheck dan build:**
   - Jalankan: `npm run typecheck && npm run build`
   - Ekspektasi: Build berhasil tanpa peringatan.

8. **Step 8: Commit:**
   - `git add src/components/admin/ src/app/\(admin\)/`
   - `git commit -m "feat(ui): build admin layout shell and multi-event operational calendar grid (Task 3.4)"`

---

### Task 3.5: UI Registrasi Proyek & Slide-Over Alokasi Skuad Kru

**Deskripsi:** Membangun antarmuka pendaftaran proyek baru (`/projects/new`) dengan validasi instan, generator `public_token`, serta antarmuka alokasi skuad kru (`/projects/[projectId]/squad`) menggunakan slide-over sheet (`Sheet side="right"`). Drawer ini menampilkan daftar kru aktif dengan status ketersediaan real-time (Tersedia vs Bentrok di Proyek Lain) dan menangani error `CONFLICT_SCHEDULE` dengan toast Sonner yang informatif.

**Berkas:**
- Buat: `src/components/admin/project-create-form.tsx`
- Buat: `src/app/(admin)/projects/page.tsx`
- Buat: `src/app/(admin)/projects/new/page.tsx`
- Buat: `src/components/admin/crew-assignment-drawer.tsx`
- Buat: `src/components/admin/crew-list-table.tsx`
- Buat: `src/app/(admin)/projects/[projectId]/squad/page.tsx`

**Langkah Implementasi:**

1. **Step 1: Implementasikan `src/components/admin/project-create-form.tsx`:**
   - Form pembuatan proyek dengan input terstruktur:
     - Nama Proyek (e.g., "The Wedding of Bella & Kevin")
     - Nama Pengantin Pria & Wanita
     - Tanggal Pernikahan (`type="date"`)
     - Nama & Alamat Venue
     - Nilai Plafon Kontrak (Rupiah input formatting)
   - Mengirim data ke `createProjectAction` dan otomatis mengarahkan ke halaman alokasi skuad `/projects/[id]/squad` setelah sukses.

2. **Step 2: Implementasikan `src/app/(admin)/projects/page.tsx` & `src/app/(admin)/projects/new/page.tsx`:**
   - Halaman direktori seluruh proyek pernikahan dengan filter status, indikator tanggal, dan tombol navigasi ke alokasi kru.
   - Halaman registrasi proyek bersih dan bebas distraksi.

3. **Step 3: Implementasikan `src/components/admin/crew-assignment-drawer.tsx`:**
   - Menggunakan Shadcn `Sheet` (`side="right"`).
   - Memanggil `getAvailableCrewUsersAction(weddingDate, projectId)` untuk memetakan kru yang bebas tugas maupun yang sudah bentrok di proyek lain.
   - Form penugasan:
     - Dropdown kru dengan label ketersediaan:
       - `🟢 Dimas Pratama (Tersedia)`
       - `🔴 Sarah Jenkins (Bentrok: Pernikahan Kevin & Bella)`
     - Dropdown role penugasan: `LEAD_PLANNER`, `LO_BRIDE`, `LO_GROOM`, `LO_FAMILY`, `RUNNER`, `LOGISTICS`, `CEREMONY_OFFICER`, `USHER`.
     - Input jam shift (`shiftStart` default 06:00, `shiftEnd` default 15:00).
   - Penanganan feedback Sonner:
     - Jika lolos: `toast.success("Kru berhasil ditugaskan ke skuad!")`.
     - Jika bentrok: `toast.error(error.message)` dengan badge merah pada formulir.

4. **Step 4: Implementasikan `src/components/admin/crew-list-table.tsx`:**
   - Tabel daftar kru terpasang pada proyek:
     - Avatar inisial & nama kru
     - Badge role penugasan (Lead Planner beraksen primer, Runner beraksen netral)
     - Jam shift kerja
     - Nomor kontak / WhatsApp
     - Tombol hapus penugasan dengan konfirmasi

5. **Step 5: Implementasikan `src/app/(admin)/projects/[projectId]/squad/page.tsx`:**
   - Halaman alokasi skuad terpadu yang memuat header proyek (nama pengantin, tanggal, venue, tautan portal publik dengan tombol salin), tombol buka drawer `+ Tugaskan Kru`, dan tabel skuad kru terpasang.

6. **Step 6: Verifikasi end-to-end linting, typecheck, dan build:**
   - Jalankan: `npm run lint && npm run typecheck && npm run build`
   - Ekspektasi: Build lulus 100% tanpa error atau warning.

7. **Step 7: Commit:**
   - `git add src/app/\(admin\)/projects/ src/components/admin/`
   - `git commit -m "feat(ui): implement project registration form and squad allocation slide-over drawer (Task 3.5)"`

---

## Rencana Eksekusi & Definition of Done (DoD) Sprint 3

1. **Auto-Generated Public Token:** Setiap proyek baru otomatis memiliki token unik 21 karakter URL-safe (`nanoid`) untuk portal pengantin publik.
2. **Anti-Collision Teruji:**
   - Mencoba menugaskan Rian ke 2 proyek pada tanggal 2026-10-24 otomatis diblokir dengan pesan ramah: *"Rian sudah terjadwal bertugas di The Wedding of Sarah & Reza pada tanggal 2026-10-24."*.
   - Database constraint `unique_crew_event_date` menolak jika query langsung dicoba bypass.
3. **Multi-Event Calendar Operasional:** Dashboard menampilkan kartu proyek pada kolom hari yang tepat dengan garis penanda waktu real-time (*Live Time Marker*).
4. **Alokasi Skuad Geser Kanan (Drawer):** Sarah dapat membuka sheet alokasi kru, melihat siapa saja staf yang senggang pada tanggal tersebut, dan memilih penugasan dengan feedback instan.
5. **Git Sync:** Seluruh 5 task dikomit secara atomik dan disinkronkan ke remote repository `origin/main`.
