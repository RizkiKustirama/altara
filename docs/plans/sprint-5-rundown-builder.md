# Sprint 5: Pustaka Template Prosesi, Rundown Builder & Propagasi Waktu

> **Status:** ⏳ IN PROGRESS (Executing Task-by-Task)
> **Goal:** Membangun antarmuka penyusunan rundown menit-per-menit (*cue sheet*), pustaka template adat/agama, mesin pergeseran waktu berantai (*Time Propagation Engine*), Server Actions dengan proteksi RBAC dan otorisasi Lead Planner, serta antarmuka desktop berdesain editorial utilitarian padat (*Sprig/Linear CRM aesthetic*).

---

## Arsitektur & Spesifikasi Modul

1. **`src/services/rundown-service.ts`**:
   - `parseTimeToMinutes(timeStr: string): number` ("08:30:00" -> 510)
   - `formatMinutesToTime(minutes: number): string` (510 -> "08:30:00")
   - `calculateDuration(startTime: string, endTime: string): number`
   - `propagateRundownTimes(items: RundownTimeItem[], initialStartTime?: string): RundownTimeItem[]`
   - Database operations: CRUD `project_rundowns`, bulk update order & times, update item status (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `DELAYED`).

2. **`src/services/template-service.ts`**:
   - Pustaka master template: `getEventTemplates()`, `getTemplateByIdWithItems(templateId)`
   - `applyTemplateToProject(projectId: string, templateId: string, projectStartTime?: string)`:
     - Mengambil semua items dari template terurut `orderIndex ASC`.
     - Mengkalkulasi selisih waktu/offset jika jam awal acara berbeda.
     - Menyisipkan seluruh item ke `project_rundowns` dalam 1 transaksi DB atomic.

3. **`src/schemas/rundown-schema.ts`**:
   - Validasi Zod: format jam `HH:mm` / `HH:mm:ss`, positive duration, order index, role/vendor cue text.
   - Schemas: `CreateRundownItemSchema`, `UpdateRundownItemSchema`, `ReorderRundownSchema`, `ShiftRundownTimeSchema`, `ApplyTemplateSchema`.

4. **`src/actions/rundown-actions.ts`**:
   - `getProjectRundownAction(projectId)`
   - `getTemplatesAction()`
   - `applyTemplateToProjectAction(projectId, templateId, startTime)`
   - `createRundownItemAction(projectId, input)`
   - `updateRundownItemAction(projectId, itemId, input)`
   - `deleteRundownItemAction(projectId, itemId)`
   - `reorderRundownAction(projectId, itemIdsInOrder)`
   - `shiftRundownTimeAction(projectId, startFromItemId, deltaMinutes)`
   - Security: Enforce `assertProjectLeadAccess` for mutations, `assertProjectAccess` for queries.

5. **Antarmuka Desktop (`src/app/(admin)/projects/[projectId]/rundown/page.tsx`)**:
   - `RundownTable`: Tabel padat bergaya editorial dengan kolom Jam (Start - End), Durasi, Judul & Deskripsi Sesi, PIC Kru, Cues (Audio, Lighting), Status, dan Tombol Aksi.
   - `CueSheetBadges`: Indikator visual audio/lighting/mic cues dengan kontras tinggi dan tooltip ringkas.
   - `ApplyTemplateDialog`: Dialog 1-klik untuk menerapkan template prosesi adat (Akad Sunda, Holy Matrimony, dll.) dengan pemilihan jam mulai acara.
   - `ShiftTimeDialog`: Dialog pergeseran waktu berantai (misal: "Acara molor 15 menit, majukan seluruh sesi berikutnya").
   - `RundownItemDialog`: Dialog tambah/edit item rundown.

---

## Daftar Tugas Bertahap (Sprint 5)

```
Sprint 5: Pustaka Template Prosesi, Rundown Builder & Propagasi Waktu
├── Task 5.1: Mesin Propagasi Waktu Berantai & Helper Waktu (src/services/rundown-service.ts + tests)
├── Task 5.2: Duplikasi Template Prosesi ke Proyek (src/services/template-service.ts + tests)
├── Task 5.3: Server Actions Rundown & Template dengan Proteksi RBAC / Project Lead
├── Task 5.4: Desktop UI: Master Rundown Builder & Cue Sheet Badges
└── Task 5.5: Desktop UI: Dialog Apply Template, Shift Time & Item Editor Form
```
