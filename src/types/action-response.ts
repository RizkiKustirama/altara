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
