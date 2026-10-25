"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { LoginSchema, type LoginInput } from "@/schemas/auth-schema";
import {
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
  getSession,
  SESSION_DURATION_MS,
} from "@/lib/auth";
import type { ActionResponse } from "@/types/action-response";
import type { UserSession, GlobalRole } from "@/types/auth";

export interface LoginResultDTO {
  role: GlobalRole;
  redirectTo: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: GlobalRole;
  };
}

/**
 * Server Action untuk autentikasi pengguna internal kantor (Dimas, Sarah, Rian).
 */
export async function loginAction(
  input: LoginInput
): Promise<ActionResponse<LoginResultDTO>> {
  // 1. Validasi skema input Zod
  const validation = LoginSchema.safeParse(input);
  if (!validation.success) {
    const firstError = validation.error.errors[0]?.message ?? "Input tidak valid";
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: firstError,
        details: validation.error.flatten(),
      },
    };
  }

  const { email, password } = validation.data;

  try {
    // 2. Query user berdasarkan email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    if (!user) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Email atau kata sandi tidak sesuai.",
        },
      };
    }

    // 3. Cek status keaktifan akun
    if (!user.isActive) {
      return {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Akun Anda telah dinonaktifkan. Silakan hubungi Owner sistem.",
        },
      };
    }

    // 4. Verifikasi kecocokan kata sandi
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Email atau kata sandi tidak sesuai.",
        },
      };
    }

    // 5. Konstruksi payload sesi
    const session: UserSession = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      expiresAt: Date.now() + SESSION_DURATION_MS,
    };

    // 6. Set HttpOnly session cookie
    await setSessionCookie(session);

    // 7. Tentukan halaman pengalihan sesuai peran pengguna
    const redirectTo = user.role === "CREW" ? "/field" : "/dashboard";

    return {
      success: true,
      data: {
        role: user.role,
        redirectTo,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    };
  } catch (err) {
    console.error("Kesalahan saat eksekusi loginAction:", err);
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Terjadi kesalahan pada sistem saat memproses login. Silakan coba kembali.",
      },
    };
  }
}

/**
 * Server Action untuk keluar dari sesi internal.
 */
export async function logoutAction(): Promise<ActionResponse<void>> {
  try {
    await clearSessionCookie();
    return {
      success: true,
      data: undefined,
    };
  } catch (err) {
    console.error("Kesalahan saat eksekusi logoutAction:", err);
    return {
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Gagal menghapus sesi login.",
      },
    };
  }
}

/**
 * Server Action untuk mengambil data sesi pengguna aktif saat ini.
 */
export async function getCurrentUserAction(): Promise<ActionResponse<UserSession | null>> {
  try {
    const session = await getSession();
    return {
      success: true,
      data: session,
    };
  } catch (err) {
    console.error("Kesalahan saat eksekusi getCurrentUserAction:", err);
    return {
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Gagal memverifikasi sesi aktif.",
      },
    };
  }
}
