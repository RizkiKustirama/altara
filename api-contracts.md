# Spesifikasi Kontrak API & Server Actions (API Contracts)
## Single-Tenant Wedding Organizer System

Dokumen ini mendefinisikan kontrak pertukaran data antara UI Components, Server Actions (`src/actions/*`), dan Route Handlers (`src/app/api/*`) berdasarkan [requirements.md](file:///D:/PROJECT/WO/requirements.md), [schema.md](file:///D:/PROJECT/WO/schema.md), [workflows.md](file:///D:/PROJECT/WO/workflows.md), [rbac-security.md](file:///D:/PROJECT/WO/rbac-security.md), dan [.agyrules](file:///D:/PROJECT/WO/.agyrules).

---

## 1. Standar Format Respons & Error Code

Seluruh Server Action wajib mengembalikan respons terbungkus (*Envelope Result Pattern*) tanpa melempar exception tak tertangani ke frontend.

### 1.1 Definisi Tipe TypeScript Strict (`src/types/action-response.ts`)

```typescript
export type ErrorCode =
  | "UNAUTHORIZED"       // User belum login atau sesi berakhir
  | "FORBIDDEN"          // User tidak memiliki hak akses role/proyek
  | "NOT_FOUND"          // Entitas data target tidak ditemukan
  | "CONFLICT_SCHEDULE"  // Kru bentrok jadwal di tanggal yang sama
  | "VALIDATION_ERROR"   // Payload input gagal divalidasi Zod
  | "BAD_REQUEST";       // Operasi bisnis melanggar aturan logika

export interface ActionError {
  code: ErrorCode;
  message: string;       // Pesan ramah pengguna dalam Bahasa Indonesia
  details?: unknown;     // Error path Zod atau metadata debug
}

export type ActionResponse<T = void> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: ActionError };
```

---

## 2. Kontrak Server Actions per Modul

---

### 2.1 Modul Proyek & Skuad

#### A. `createProjectAction`
* **Deskripsi:** Mendaftarkan proyek pernikahan baru dan men-generate `public_token` secara otomatis.
* **Allowed Roles:** `OWNER`, `PLANNER`
* **Input Schema (Zod):**
  ```typescript
  export const CreateProjectSchema = z.object({
    packageId: z.string().uuid().optional(),
    projectName: z.string().min(3, "Nama proyek minimal 3 karakter"),
    clientGroomName: z.string().min(2, "Nama pengantin pria wajib diisi"),
    clientBrideName: z.string().min(2, "Nama pengantin wanita wajib diisi"),
    weddingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
    venueName: z.string().min(3, "Nama venue wajib diisi"),
    venueAddress: z.string().optional(),
    contractAmount: z.number().nonnegative("Nilai kontrak tidak boleh negatif").default(0),
  });
  export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
  ```
* **Return Type DTO:**
  ```typescript
  export interface ProjectCreatedDTO {
    id: string;
    projectName: string;
    weddingDate: string;
    publicToken: string;
    contractAmount: number;
  }
  ```
* **Contoh Request Payload:**
  ```json
  {
    "projectName": "The Wedding of Bella & Kevin",
    "clientGroomName": "Kevin Sanjaya",
    "clientBrideName": "Bella Clarissa",
    "weddingDate": "2026-10-24",
    "venueName": "Grand Ballroom Hotel Mulia Jakarta",
    "contractAmount": 150000000
  }
  ```
* **Contoh Response Sukses:**
  ```json
  {
    "success": true,
    "data": {
      "id": "e3b0c442-98fc-1c14-9af3-4b8c9d0a1b2c",
      "projectName": "The Wedding of Bella & Kevin",
      "weddingDate": "2026-10-24",
      "publicToken": "k9xZ2A8_mQ1vY4pL7rT3w",
      "contractAmount": 150000000
    }
  }
  ```

---

#### B. `assignCrewAction`
* **Deskripsi:** Menugaskan kru ke dalam proyek dengan validasi anti-bentrok jadwal pada tanggal yang sama.
* **Allowed Roles:** `OWNER`, `PLANNER`
* **Input Schema (Zod):**
  ```typescript
  export const AssignCrewSchema = z.object({
    projectId: z.string().uuid(),
    userId: z.string().uuid(),
    roleInProject: z.string().min(2, "Role penugasan wajib diisi"),
    shiftStart: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    shiftEnd: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  });
  ```
* **Return Type DTO:**
  ```typescript
  export interface CrewAssignmentDTO {
    assignmentId: string;
    crewName: string;
    roleInProject: string;
    eventDate: string;
  }
  ```
* **Contoh Response Error (Jadwal Bentrok):**
  ```json
  {
    "success": false,
    "error": {
      "code": "CONFLICT_SCHEDULE",
      "message": "Rian sudah terjadwal bertugas di The Wedding of Sarah & Reza pada tanggal 2026-10-24.",
      "details": {
        "userId": "c7a8b901-2345-6789-abcd-ef0123456789",
        "conflictingProjectId": "a1b2c3d4-e5f6-7890-1234-56789abcdef0",
        "eventDate": "2026-10-24"
      }
    }
  }
  ```

---

#### C. `getProjectOverviewAction`
* **Deskripsi:** Mengambil detail ringkasan operasional proyek (timeline, progres checklist, skuad terpasang).
* **Allowed Roles:** `OWNER`, `PLANNER`, `CREW` (kru hanya untuk proyek penugasannya)
* **Return Type DTO:**
  ```typescript
  export interface ProjectOverviewDTO {
    id: string;
    projectName: string;
    weddingDate: string;
    venueName: string;
    status: string;
    crewCount: number;
    vendorCount: number;
    checklistProgressPercent: number;
    contractAmount?: number; // Hanya muncul jika role OWNER atau PLANNER
  }
  ```

---

### 2.2 Modul Rekanan & Vendor Slotting

#### A. `slotVendorToProjectAction`
* **Deskripsi:** Memasukkan vendor rekanan ke dalam slot kategori kebutuhan acara pengantin.
* **Allowed Roles:** `OWNER`, `PLANNER`
* **Input Schema (Zod):**
  ```typescript
  export const SlotVendorSchema = z.object({
    projectId: z.string().uuid(),
    vendorId: z.string().uuid(),
    category: z.enum([
      "MUA", "DECORATION", "CATERING", "PHOTO_VIDEO",
      "SOUND_LIGHTING", "VENUE", "MC", "ATTIRE", "ENTERTAINMENT", "OTHER"
    ]),
    notes: z.string().optional(),
  });
  ```
* **Return Type DTO:**
  ```typescript
  export interface ProjectVendorSlotDTO {
    slotId: string;
    vendorName: string;
    category: string;
    contractStatus: "INQUIRY" | "BOOKED" | "DP_PAID" | "SETTLED" | "CANCELLED";
  }
  ```

#### B. `updateVendorPaymentStatusAction`
* **Deskripsi:** Memperbarui status transaksi vendor (Tier 1 operasional).
* **Allowed Roles:** `OWNER`, `PLANNER`
* **Input Schema (Zod):**
  ```typescript
  export const UpdateVendorPaymentSchema = z.object({
    projectVendorId: z.string().uuid(),
    contractStatus: z.enum(["INQUIRY", "BOOKED", "DP_PAID", "SETTLED", "CANCELLED"]),
  });
  ```

---

### 2.3 Modul Rundown & Propagasi Waktu

#### A. `reorderRundownAction`
* **Deskripsi:** Mengatur ulang urutan item rundown via drag-and-drop dan menjalankan propagasi waktu berantai jika durasi berubah.
* **Allowed Roles:** `OWNER`, `PLANNER`
* **Input Schema (Zod):**
  ```typescript
  export const ReorderRundownSchema = z.object({
    projectId: z.string().uuid(),
    initialStartTime: z.string().regex(/^\d{2}:\d{2}$/, "Format jam awal HH:mm"),
    orderedItems: z.array(
      z.object({
        id: z.string().uuid(),
        orderIndex: z.number().int().nonnegative(),
        durationMinutes: z.number().int().positive(),
      })
    ),
  });
  ```
* **Return Type DTO:**
  ```typescript
  export interface RundownPropagatedDTO {
    id: string;
    orderIndex: number;
    startTime: string;
    endTime: string;
  }
  ```
* **Contoh Request Payload:**
  ```json
  {
    "projectId": "e3b0c442-98fc-1c14-9af3-4b8c9d0a1b2c",
    "initialStartTime": "08:00",
    "orderedItems": [
      { "id": "11111111-1111-1111-1111-111111111111", "orderIndex": 0, "durationMinutes": 60 },
      { "id": "22222222-2222-2222-2222-222222222222", "orderIndex": 1, "durationMinutes": 30 }
    ]
  }
  ```

#### B. `updateRundownItemAction`
* **Deskripsi:** Mengedit detail teknis sesi rundown (judul, MC cue, lighting, audio).
* **Allowed Roles:** `OWNER`, `PLANNER`

---

### 2.4 Modul Keluarga & VIP

#### A. `createWeddingPartyMemberAction`
* **Deskripsi:** Mendaftarkan anggota keluarga inti atau saksi nikah beserta tugas seremonialnya.
* **Allowed Roles:** `OWNER`, `PLANNER`
* **Input Schema (Zod):**
  ```typescript
  export const CreateWeddingPartySchema = z.object({
    projectId: z.string().uuid(),
    name: z.string().min(2, "Nama anggota keluarga wajib diisi"),
    relationship: z.string().min(2, "Hubungan keluarga wajib diisi"),
    phone: z.string().optional(),
    ceremonialRole: z.string().optional(), // misal: "Saksi Nikah Pihak Wanita", "Pemberi Sambutan"
    notes: z.string().optional(),
  });
  ```

#### B. `getWeddingPartiesAction`
* **Deskripsi:** Mengambil daftar kontak dan peran keluarga inti.
* **Allowed Roles:** `OWNER`, `PLANNER`, `CREW` (untuk koordinasi LO Keluarga)

---

### 2.5 Modul Logistik Sakral Hari-H (Fase 2)

#### A. `updateSacredItemStatusAction`
* **Deskripsi:** Mutasi status dan lokasi fisik barang sakral oleh kru lapangan (cincin kawin, mahar, gaun ganti).
* **Allowed Roles:** `OWNER`, `PLANNER`, `CREW`
* **Input Schema (Zod):**
  ```typescript
  export const UpdateSacredItemStatusSchema = z.object({
    itemId: z.string().uuid(),
    currentLocation: z.string().min(2, "Lokasi fisik wajib diisi"),
    status: z.enum(["NOT_RECEIVED", "WITH_CREW", "AT_STAGE", "RETURNED_TO_FAMILY"]),
    notes: z.string().optional(),
  });
  ```
* **Contoh Request Payload:**
  ```json
  {
    "itemId": "88888888-8888-8888-8888-888888888888",
    "currentLocation": "Meja Akad Nikah Lantai 2",
    "status": "AT_STAGE",
    "notes": "Kotak cincin diserahkan ke penghulu dan saksi"
  }
  ```

---

### 2.6 Modul Tier 1: Bujet Operasional Acara

#### A. `allocateProjectBudgetAction`
* **Deskripsi:** Mengalokasikan bujet pengantin per kategori (Catering, Dekorasi, Venue).
* **Allowed Roles:** `OWNER`, `PLANNER`
* **Input Schema (Zod):**
  ```typescript
  export const AllocateBudgetSchema = z.object({
    projectId: z.string().uuid(),
    category: z.string().min(2),
    allocatedAmount: z.number().positive("Nominal alokasi harus lebih dari 0"),
    notes: z.string().optional(),
  });
  ```

#### B. `recordVendorInvoiceAction`
* **Deskripsi:** Mencatat tagihan dan tanggal jatuh tempo invoice vendor rekanan.
* **Allowed Roles:** `OWNER`, `PLANNER`

#### C. `updatePaymentMilestoneAction`
* **Deskripsi:** Memperbarui status pembayaran termin pengantin (DP 1, DP 2, Pelunasan).
* **Allowed Roles:** `OWNER`, `PLANNER`

---

### 2.7 Modul Tier 2: Keuangan Internal Dapur Bisnis (Owner-Only)

#### A. `getCompanyProfitReportAction`
* **Deskripsi:** Menghitung rekapitulasi laba kotor, biaya modal vendor riil, dan margin profit kantor per proyek.
* **Allowed Roles:** **Eksklusif `OWNER`**
* **Input:** `{ projectId: string }`
* **Return Type DTO:**
  ```typescript
  export interface CompanyProfitReportDTO {
    projectId: string;
    projectName: string;
    grossContractPrice: number;
    vendorRealCost: number;
    crewTotalExpense: number;
    grossProfit: number;
    netProfitMarginPercent: number;
  }
  ```
* **Contoh Response Ditolak (Jika Dipanggil Planner Sarah):**
  ```json
  {
    "success": false,
    "error": {
      "code": "FORBIDDEN",
      "message": "Anda tidak memiliki wewenang untuk mengakses data keuntungan dan modal internal perusahaan."
    }
  }
  ```

#### B. `executeBatchCrewPayoutAction`
* **Deskripsi:** Menjalankan kalkulasi batch pencairan honor harian puluhan kru lapangan setiap akhir pekan.
* **Allowed Roles:** **Eksklusif `OWNER`**
* **Input Schema (Zod):**
  ```typescript
  export const ExecuteBatchPayoutSchema = z.object({
    projectId: z.string().uuid(),
    payouts: z.array(
      z.object({
        userId: z.string().uuid(),
        dailyRate: z.number().positive(),
        sessionCount: z.number().positive().default(1),
        notes: z.string().optional(),
      })
    ),
  });
  ```
* **Return Type DTO:**
  ```typescript
  export interface BatchPayoutResultDTO {
    projectId: string;
    totalCrewPaid: number;
    totalDisbursedAmount: number;
    processedAt: string;
  }
  ```

---

## 3. Kontrak Route Handlers (REST & Streaming Endpoints)

---

### 3.1 Portal Klien Publik (Read-Only Magic Link)
* **Endpoint:** `GET /api/public/portal/:token`
* **Otentikasi:** Tidak perlu login (Token-based URL).
* **Proteksi:** Rate Limited (Maksimal 60 request/menit/IP).
* **Sanitasi Privasi:** Tidak menyertakan nomor HP personal PIC, margin laba, atau biaya modal vendor.

#### Format Respons JSON (`PublicProjectViewDTO`):
```json
{
  "success": true,
  "data": {
    "projectName": "The Wedding of Bella & Kevin",
    "clientGroomName": "Kevin",
    "clientBrideName": "Bella",
    "weddingDate": "2026-10-24",
    "venueName": "Grand Ballroom Hotel Mulia",
    "countdownDays": 120,
    "checklistProgressPercent": 65,
    "confirmedVendors": [
      {
        "category": "VENUE",
        "vendorName": "Hotel Mulia Senayan",
        "status": "BOOKED"
      },
      {
        "category": "CATERING",
        "vendorName": "Mulia Culinary Service",
        "status": "SETTLED"
      },
      {
        "category": "PHOTO_VIDEO",
        "vendorName": "Axioo Photography",
        "status": "BOOKED"
      }
    ]
  }
}
```

---

### 3.2 Generator PDF Guidebook TM
* **Endpoint:** `GET /api/pdf/guidebook/:projectId`
* **Otentikasi:** Wajib sesi aktif (`OWNER` atau `PLANNER`).
* **Format Response:** Binary stream `application/pdf`.
* **Headers:**
  ```http
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="Guidebook-TM-Bella-Kevin.pdf"
  Cache-Control: no-store, max-age=0
  ```
* **Alur Eksekusi:**
  1. Route handler memverifikasi sesi login pengguna via cookie.
  2. Memanggil `aggregateGuidebookData(projectId)` dari `pdf-aggregator-service.ts`.
  3. Mengalirkan buffer PDF yang di-render oleh komponen `@react-pdf/renderer` langsung ke stream response HTTP.
