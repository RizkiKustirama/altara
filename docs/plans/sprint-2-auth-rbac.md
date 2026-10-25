# Sprint 2: Autentikasi Internal, Sesi Cookie & Guard Otorisasi (RBAC) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Membangun sistem autentikasi pengguna internal kantor (Dimas, Sarah, Rian), pengelolaan sesi aman berbasis cookie `HttpOnly` menggunakan signed token HMAC-SHA256 (Web Crypto API), helper otorisasi role dan proyek (`assertRole`, `assertProjectAccess`), middleware proteksi rute Next.js, serta UI halaman login kantor yang elegan.

**Architecture:** Sesi cookie `HttpOnly; Secure; SameSite=Lax` dengan payload bertanda-tangan digital HMAC-SHA256 yang kompatibel dengan Next.js Edge Middleware dan React Server Components tanpa beban database lookup berulang di setiap request statis. Server Actions bertindak sebagai *thin controller* yang memvalidasi input via Zod, memanggil `assertRole` / `assertProjectAccess`, dan mengembalikan data dalam bungkus `ActionResponse<T>`.

**Tech Stack:** Next.js 14 (App Router), TypeScript Strict (`noImplicitAny`), Drizzle ORM, PostgreSQL, bcryptjs, Web Crypto API (Native Node/Edge), Zod, Tailwind CSS, Shadcn UI, Sonner.

---

## Daftar Tugas Bertahap (Sprint 2)

```
Sprint 2: Autentikasi Internal & Guard Otorisasi (RBAC)
├── Task 2.1: Standarisasi Tipe Response & Error Code (Envelope Pattern)
├── Task 2.2: Modul Sesi Web Crypto HMAC-SHA256 & Cookie Helper
├── Task 2.3: Skema Zod & Server Actions Autentikasi (Login, Logout, GetSession)
├── Task 2.4: Helper Otorisasi Guard (assertRole & assertProjectAccess)
├── Task 2.5: Middleware Proteksi Rute Next.js (Route Matcher & Role Redirects)
└── Task 2.6: UI Halaman & Form Login Internal (Responsive Sprig Minimalist)
```

---

### Task 2.1: Standarisasi Format Respons & Kontrak Tipe Error

**Deskripsi:** Mendefinisikan tipe standar `ActionResponse<T>`, `ActionError`, `ErrorCode`, serta tipe sesi pengguna `UserSession` dan `GlobalRole` untuk menjamin type-safety 100% tanpa tipe `any`.

**Berkas:**
- Buat: `src/types/action-response.ts`
- Buat: `src/types/auth.ts`

**Langkah Implementasi:**

1. **Buat `src/types/action-response.ts`:**
   ```typescript
   export type ErrorCode =
     | "UNAUTHORIZED"       // Pengguna belum login atau sesi telah kedaluwarsa
     | "FORBIDDEN"          // Pengguna tidak memiliki wewenang role / penugasan
     | "NOT_FOUND"          // Data proyek / vendor / user tidak ditemukan
     | "CONFLICT_SCHEDULE"  // Kru bentrok jadwal di tanggal yang sama
     | "VALIDATION_ERROR"   // Input form gagal divalidasi Zod
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

2. **Buat `src/types/auth.ts`:**
   ```typescript
   export type GlobalRole = "OWNER" | "PLANNER" | "CREW";

   export interface UserSession {
     userId: string;
     email: string;
     fullName: string;
     role: GlobalRole;
     expiresAt: number; // Unix timestamp in milliseconds
   }
   ```

**Verifikasi:**
- Jalankan: `npm run typecheck`
- Ekspektasi: Lolos tanpa error.

---

### Task 2.2: Modul Sesi Web Crypto HMAC-SHA256 & Cookie Helper

**Deskripsi:** Membangun modul enkripsi/signing token sesi yang aman, ringan, dan kompatibel dengan runtime Node.js maupun Edge Runtime Next.js Middleware menggunakan native Web Crypto API.

**Berkas:**
- Buat: `src/lib/session.ts`
- Buat: `src/lib/auth.ts`

**Langkah Implementasi:**

1. **Buat `src/lib/session.ts`:**
   - Gunakan `crypto.subtle` untuk menandatangani payload JSON `UserSession` dengan algoritma HMAC-SHA256 dan rahasia `AUTH_SECRET`.
   - Implementasikan fungsi:
     - `signSessionToken(session: UserSession): Promise<string>`
     - `verifySessionToken(token: string): Promise<UserSession | null>`
   - Format token: `base64url(payload).base64url(signature)`.
   - Validasi kedaluwarsa waktu (`expiresAt > Date.now()`).

2. **Buat `src/lib/auth.ts`:**
   - Implementasikan fungsi helper cookie:
     - `getSession(): Promise<UserSession | null>`: Membaca cookie `altara_session` dari `next/headers` cookies, memverifikasi via `verifySessionToken`.
     - `setSessionCookie(session: UserSession): Promise<void>`: Menyimpan token ke cookie dengan konfigurasi:
       `httpOnly: true`, `secure: process.env.NODE_ENV === "production"`, `sameSite: "lax"`, `path: "/"`, `maxAge: 60 * 60 * 24 * 7` (7 hari).
     - `clearSessionCookie(): Promise<void>`: Menghapus cookie `altara_session`.
     - `verifyPassword(password: string, hash: string): Promise<boolean>`: Menggunakan `bcryptjs.compare`.

**Verifikasi:**
- Jalankan: `npm run typecheck`
- Ekspektasi: Lolos tanpa error.

---

### Task 2.3: Skema Zod & Server Actions Autentikasi

**Deskripsi:** Membangun validasi input login menggunakan Zod serta Server Actions untuk proses login, logout, dan pengecekan sesi aktif.

**Berkas:**
- Buat: `src/schemas/auth-schema.ts`
- Buat: `src/actions/auth-actions.ts`

**Langkah Implementasi:**

1. **Buat `src/schemas/auth-schema.ts`:**
   ```typescript
   import { z } from "zod";

   export const LoginSchema = z.object({
     email: z.string().email("Format alamat email tidak valid"),
     password: z.string().min(6, "Kata sandi minimal 6 karakter"),
   });

   export type LoginInput = z.infer<typeof LoginSchema>;
   ```

2. **Buat `src/actions/auth-actions.ts`:**
   - `"use server";`
   - `loginAction(input: LoginInput): Promise<ActionResponse<{ role: GlobalRole; redirectTo: string }>>`
     1. Validasi input via `LoginSchema.safeParse`.
     2. Query user dari database via `db.query.users.findFirst({ where: eq(users.email, input.email) })`.
     3. Cek `user.isActive`. Jika non-aktif, tolak dengan pesan akun dinonaktifkan.
     4. Verifikasi kata sandi via `verifyPassword`.
     5. Jika cocok, buat `UserSession` dengan masa aktif 7 hari.
     6. Panggil `setSessionCookie(session)`.
     7. Tentukan tujuan pengalihan:
        - `OWNER` / `PLANNER` $\rightarrow$ `"/dashboard"`
        - `CREW` $\rightarrow$ `"/field"`
   - `logoutAction(): Promise<ActionResponse<void>>`
     - Panggil `clearSessionCookie()`.
   - `getCurrentUserAction(): Promise<ActionResponse<UserSession | null>>`
     - Mengembalikan sesi aktif saat ini.

**Verifikasi:**
- Jalankan: `npm run typecheck`
- Ekspektasi: Lolos tanpa error.

---

### Task 2.4: Helper Otorisasi Guard (RBAC Service Layer)

**Deskripsi:** Membangun fungsi guard untuk memastikan eksekusi Server Actions terlindungi sesuai matriks wewenang global dan hak akses spesifik per proyek.

**Berkas:**
- Buat: `src/lib/auth-guard.ts`

**Langkah Implementasi:**

1. **Implementasi `assertRole(session, allowedRoles)`:**
   - Jika `!session`, return `{ success: false, error: { code: "UNAUTHORIZED", message: "Sesi kerja telah berakhir. Silakan masuk kembali." } }`.
   - Jika `!allowedRoles.includes(session.role)`, return `{ success: false, error: { code: "FORBIDDEN", message: "Anda tidak memiliki wewenang untuk mengakses data ini." } }`.
   - Return `{ success: true, data: undefined }`.

2. **Implementasi `assertProjectAccess(session, projectId)`:**
   - Jika `session.role === "OWNER" || session.role === "PLANNER"`, izinkan langsung (akses global lintas proyek).
   - Jika `session.role === "CREW"`, periksa tabel `project_crews`:
     ```typescript
     const assignment = await db.query.projectCrews.findFirst({
       where: and(eq(projectCrews.projectId, projectId), eq(projectCrews.userId, session.userId))
     });
     ```
     Jika tidak terdaftar, kembalikan error `FORBIDDEN`: *"Anda tidak terdaftar sebagai staf penugasan pada proyek pernikahan ini."*.

**Verifikasi:**
- Jalankan: `npm run typecheck`
- Ekspektasi: Lolos tanpa error.

---

### Task 2.5: Middleware Proteksi Rute Next.js

**Deskripsi:** Menerapkan pembatasan rute di tingkat Next.js Middleware untuk mencegah akses ilegal ke halaman admin/owner sebelum komponen sempat dimuat.

**Berkas:**
- Buat: `src/middleware.ts`

**Langkah Implementasi:**

1. Ekstrak cookie `altara_session` dari `request.cookies`.
2. Verifikasi token menggunakan `verifySessionToken(token)`.
3. Terapkan aturan pengalihan rute:
   - Rute publik: `/portal/*`, `/_next/*`, `/api/public/*`, `/favicon.ico` $\rightarrow$ Selalu izinkan (*NextResponse.next()*).
   - Rute `/login`: Jika sesi aktif, alihkan ke `/dashboard` (Owner/Planner) atau `/field` (Crew).
   - Rute internal `/(admin)/*`, `/(owner-only)/*`, `/(mobile)/*`:
     - Jika tidak ada sesi valid $\rightarrow$ Alihkan ke `/login?callbackUrl=...`.
     - Jika rute bertarget `/finance/*` atau `/(owner-only)/*` dan role bukan `OWNER` $\rightarrow$ Alihkan ke `/dashboard` (Tolak akses dapur bisnis).
     - Jika rute bertarget `/(admin)/*` dan role adalah `CREW` $\rightarrow$ Alihkan ke `/field` (Kru diarahkan ke tampilan mobile).

**Verifikasi:**
- Jalankan: `npm run typecheck`
- Ekspektasi: Lolos tanpa error.

---

### Task 2.6: UI Halaman & Form Login Internal

**Deskripsi:** Membangun antarmuka login yang responsif, bersih, berestetika Sprig CRM, dengan kemudahan pengujian akun demo untuk pengembang.

**Berkas:**
- Buat: `src/app/(auth)/layout.tsx`
- Buat: `src/app/(auth)/login/page.tsx`
- Buat: `src/components/auth/login-form.tsx`

**Langkah Implementasi:**

1. **`src/app/(auth)/layout.tsx`:**
   - Layout bersih terpusat dengan latar belakang hangat Sprig (`bg-background`).
2. **`src/components/auth/login-form.tsx`:**
   - Form interaktif dengan `Input` email, `Input` password dengan tombol toggle mata (lihat/sembunyikan kata sandi), tombol submit dengan status loading.
   - Penangan submit memanggil `loginAction(data)`:
     - Jika sukses, tampilkan `toast.success("Berhasil masuk")` dan arahkan ke URL tujuan (`router.push(result.data.redirectTo)`).
     - Jika gagal, tampilkan `toast.error(result.error.message)`.
   - **Fitur Demo Cepat (Quick Demo Fill):** Tombol pintas untuk mengisi cepat kredensial:
     - `[Dimas (Owner)]` $\rightarrow$ `dimas@altara.id` / `password123`
     - `[Sarah (Planner)]` $\rightarrow$ `sarah@altara.id` / `password123`
     - `[Rian (Crew)]` $\rightarrow$ `rian@altara.id` / `password123`
3. **`src/app/(auth)/login/page.tsx`:**
   - Membungkus `LoginForm` di dalam `Card` dengan judul *"Masuk ke Sistem Kantor"* dan subjudul *"Sistem Manajemen Wedding Organizer Altara"*.

**Verifikasi:**
- Jalankan: `npm run build`
- Ekspektasi: Build lolos, rute `/login` terdaftar sebagai static/dynamic page tanpa error.

---

## Ringkasan Commit Per Task untuk Sprint 2

| Task | Rencana Pesan Komit |
| :--- | :--- |
| **Task 2.1** | `feat(auth): define ActionResponse and UserSession error contracts (Task 2.1)` |
| **Task 2.2** | `feat(auth): implement Web Crypto HMAC session signing and cookie helper (Task 2.2)` |
| **Task 2.3** | `feat(auth): implement login, logout, and getCurrentUser Server Actions (Task 2.3)` |
| **Task 2.4** | `feat(auth): implement assertRole and assertProjectAccess guards (Task 2.4)` |
| **Task 2.5** | `feat(auth): implement Next.js route protection middleware (Task 2.5)` |
| **Task 2.6** | `feat(auth): build responsive login UI page with demo credentials picker (Task 2.6)` |
| **Complete** | `docs: mark Sprint 2 completed with commit references` |
