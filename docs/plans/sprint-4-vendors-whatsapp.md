# Sprint 4: Vendor Rekanan & Integrasi WhatsApp Quick-Action Implementation Plan

> **For Claude / Superpowers:** Execution plan for Sprint 4. Follow task-by-task execution and commit per task.

**Goal:** Membangun modul manajemen master rekanan vendor terpusat, slotting vendor ke dalam kebutuhan proyek pernikahan pengantin, integrasi tautan pesan instan WhatsApp otomatis untuk undangan Technical Meeting (TM), Server Actions vendor dengan otorisasi RBAC (Owner, Management, dan Lead Planner), serta antarmuka desktop berdesain editorial utilitarian (Sprig CRM aesthetic + Frontend Design principles).

**Architecture:** 
- `src/lib/whatsapp.ts`: Sanitasi nomor telepon Indonesia (`08...`/`+628...` -> `628...`) dan generator deep-link URL WhatsApp (`wa.me`) dengan pesan terstruktur yang di-encode URL (`encodeURIComponent`).
- `src/schemas/vendor-schema.ts`: Skema validasi Zod untuk pembuatan/pembaruan master vendor dan slotting vendor ke proyek acara.
- `src/services/vendor-service.ts`: Lapisan layanan basis data Drizzle ORM untuk query master vendor, pencarian per kategori, slotting ke `project_vendors`, dan pengecekan relasi.
- `src/actions/vendor-actions.ts`: Server Actions yang dilindungi guard RBAC (`assertRole(["OWNER", "MANAGEMENT"])` untuk master vendor, dan `assertProjectLeadAccess` untuk slotting proyek).
- `src/app/(admin)/vendors/page.tsx` & `src/components/admin/vendor-form-dialog.tsx`: Halaman direktori master vendor dengan filter kategori, pencarian real-time, dan form modal tambah/edit.
- `src/app/(admin)/projects/[projectId]/vendors/page.tsx` & `src/components/admin/vendor-slot-card.tsx`: Antarmuka slotting vendor proyek pengantin dengan status kontrak (`INQUIRY`, `BOOKED`, `DP_PAID`, `SETTLED`, `CANCELLED`) dan tombol 1-klik WhatsApp TM.

**Tech Stack:** Next.js 14 App Router, TypeScript Strict, Drizzle ORM, PostgreSQL, Zod, Tailwind CSS, Shadcn UI (`Dialog`, `Badge`, `Card`, `Button`, `Input`, `Select`, `DropdownMenu`), Sonner.

---

## Daftar Tugas Bertahap (Sprint 4)

```
Sprint 4: Vendor Rekanan & Integrasi WhatsApp Quick-Action
├── Task 4.1: Helper Sanitasi Nomor & Generator Deep-Link WhatsApp
│   ├── sanitizeIndonesianPhone (08/628/8 standardization)
│   └── generateVendorTmWhatsappUrl & generatePaymentReminderWhatsappUrl
├── Task 4.2: Skema Zod & Service Vendor
│   ├── CreateVendorSchema, UpdateVendorSchema, SlotVendorSchema
│   └── vendor-service.ts (Master CRUD, project slotting, retrieval with relations)
├── Task 4.3: Server Actions Vendor & Slotting Acara
│   ├── createVendorAction, updateVendorAction, deleteVendorAction
│   └── slotVendorToProjectAction, updateVendorSlotAction, removeVendorFromProjectAction
├── Task 4.4: Desktop UI: Master Katalog Vendor Rekanan (/vendors)
│   ├── Master Vendor Table with Category Filters & Search
│   └── VendorFormDialog (Modal Tambah & Edit Vendor)
└── Task 4.5: Desktop UI: Slotting Vendor Proyek & Integrasi WhatsApp (/projects/[projectId]/vendors)
    ├── VendorSlotCard with Contract Status Badge & 1-Click WhatsApp Button
    └── Slotting Drawer/Dialog untuk Menugaskan Vendor ke Kategori Acara
```

---

### Task 4.1: Helper Sanitasi Nomor & Generator Deep-Link WhatsApp

**Deskripsi:** Membangun modul fungsi utilitas untuk standardisasi nomor handphone format Indonesia dan pembuatan link langsung WhatsApp (`https://wa.me/628...`) dengan template pesan undangan Technical Meeting (TM) otomatis.

**Berkas:**
- Buat: `src/lib/whatsapp.ts`
- Buat Test: `tests/whatsapp/whatsapp.test.ts`

**Langkah Implementasi:**
1. Implementasikan `sanitizeIndonesianPhone(phoneInput: string): string`.
2. Implementasikan antarmuka `TechnicalMeetingDraft` dan fungsi `generateVendorTmWhatsappUrl(data: TechnicalMeetingDraft): string`.
3. Implementasikan antarmuka `PaymentReminderDraft` dan fungsi `generatePaymentReminderWhatsappUrl(data: PaymentReminderDraft): string`.
4. Buat unit test mandiri di `tests/whatsapp/whatsapp.test.ts` untuk menguji berbagai variasi input nomor (`0812...`, `+62812...`, `62812...`, `0812-3456-7890`) dan verifikasi encode pesan.
5. Jalankan test via `npx tsx tests/whatsapp/whatsapp.test.ts`.

---

### Task 4.2: Skema Zod & Service Vendor

**Deskripsi:** Mendefinisikan kontrak schema Zod untuk vendor rekanan dan menyusun query database Drizzle pada `src/services/vendor-service.ts`.

**Berkas:**
- Buat: `src/schemas/vendor-schema.ts`
- Buat: `src/services/vendor-service.ts`
- Buat Test: `tests/vendor/vendor-service.test.ts`

**Langkah Implementasi:**
1. Buat enum schema `vendorCategoryEnumSchema` dan `contractStatusEnumSchema`.
2. Buat `CreateVendorSchema`, `UpdateVendorSchema`, `SlotVendorSchema`, dan `UpdateVendorSlotSchema`.
3. Buat service functions di `src/services/vendor-service.ts`:
   - `getMasterVendors(filters)`
   - `getVendorById(id)`
   - `createMasterVendor(input)`
   - `updateMasterVendor(id, input)`
   - `getProjectVendors(projectId)`
   - `slotVendorToProject(input)`
   - `updateVendorSlot(slotId, input)`
   - `removeVendorSlot(slotId, projectId)`
4. Buat unit test contract di `tests/vendor/vendor-service.test.ts`.

---

### Task 4.3: Server Actions Vendor & Slotting Acara

**Deskripsi:** Menyediakan Server Actions yang aman untuk operasi master vendor dan slotting proyek pengantin dengan proteksi RBAC.

**Berkas:**
- Buat: `src/actions/vendor-actions.ts`
- Buat Test: `tests/vendor/vendor-actions.test.ts`

**Langkah Implementasi:**
1. `createVendorAction`: diproteksi `assertRole(["OWNER", "MANAGEMENT"])`.
2. `updateVendorAction`: diproteksi `assertRole(["OWNER", "MANAGEMENT"])`.
3. `getVendorsAction`: dapat diakses `OWNER`, `MANAGEMENT`, dan `CREW`.
4. `slotVendorToProjectAction`: diproteksi `assertProjectLeadAccess(session, projectId)`.
5. `updateVendorSlotAction`: diproteksi `assertProjectLeadAccess(session, projectId)`.
6. `removeVendorSlotAction`: diproteksi `assertProjectLeadAccess(session, projectId)`.
7. `getProjectVendorsAction`: diproteksi `assertProjectAccess(session, projectId)`.
8. Revalidasi path Next.js cache `/vendors` dan `/projects/[projectId]/vendors`.

---

### Task 4.4: Desktop UI: Master Katalog Vendor Rekanan

**Deskripsi:** Membangun antarmuka manajemen katalog vendor rekanan (`/vendors`) dengan desain calm, dense, keyboard-friendly.

**Berkas:**
- Buat: `src/components/admin/vendor-form-dialog.tsx`
- Buat: `src/app/(admin)/vendors/page.tsx`

**Langkah Implementasi:**
1. Komponen `VendorFormDialog`: Dialog modal untuk membuat master vendor baru atau mengedit data PIC, nomor telepon, kategori, dan alamat.
2. Halaman `/vendors`:
   - Filter tab kategori (Semua, Venue, Catering, MUA, Photo/Video, Decoration, Sound, dll.).
   - Input pencarian live untuk mencari nama vendor atau PIC.
   - Tabel padat memuat kolom: Kategori (Badge), Nama Vendor, PIC, Kontak (tombol chat WA), Alamat, Status Keaktifan, dan Aksi Edit.
   - Empty state jika belum ada vendor pada kategori terpilih.

---

### Task 4.5: Desktop UI: Slotting Vendor Proyek & Integrasi WhatsApp

**Deskripsi:** Membangun antarmuka pemetaan vendor untuk proyek pengantin spesifik (`/projects/[projectId]/vendors`), menampilkan slot kategori, status kontrak, dan tombol 1-klik undang TM WhatsApp.

**Berkas:**
- Buat: `src/components/admin/vendor-slot-card.tsx`
- Buat: `src/components/admin/vendor-slot-dialog.tsx`
- Buat: `src/app/(admin)/projects/[projectId]/vendors/page.tsx`

**Langkah Implementasi:**
1. Komponen `VendorSlotCard`: Menampilkan slot kategori (misal: "MUA & Hairdo"), nama vendor yang terpasang, status kontrak (`INQUIRY`, `BOOKED`, `DP_PAID`, `SETTLED`), dropdown ganti status, dan tombol WhatsApp dengan pesan undangan TM terisi otomatis.
2. Komponen `VendorSlotDialog`: Dialog untuk memilih vendor rekanan dari master katalog untuk dimasukkan ke dalam slot kategori acara pengantin.
3. Halaman `/projects/[projectId]/vendors/page.tsx`:
   - Header proyek: Nama pengantin, tanggal pernikahan, nama venue.
   - Ringkasan slot terisi vs slot kosong.
   - Grid slotting kategori acara dengan kartu responsif dan opsi slot kustom.

---

## Definition of Done (DoD) Sprint 4
1. Seluruh master vendor dapat didata dan dicari berdasarkan kategori.
2. Staf Lead Planner atau Manajemen dapat memasangkan vendor rekanan ke slot proyek pernikahan pengantin.
3. Menekan tombol WhatsApp pada vendor terpasang langsung membuka URL `https://wa.me/628...` dengan draf teks undangan TM yang otomatis memuat nama pengantin, tanggal acara, jam, dan lokasi venue.
4. Lolos typecheck `npx tsc --noEmit`, seluruh unit test di `tests/` berstatus lulus 100%, dan `npm run build` berhasil.
5. Setiap task di-commit secara terpisah dan bertahap ke repositori Git.
