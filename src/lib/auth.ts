import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { signSessionToken, verifySessionToken } from "./session";
import type { UserSession } from "@/types/auth";

export const SESSION_COOKIE_NAME = "altara_session";
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 hari

/**
 * Mendapatkan sesi pengguna yang sedang aktif dari cookie request.
 */
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

/**
 * Menyimpan sesi pengguna ke cookie terenkripsi/ter-sign (HttpOnly).
 */
export async function setSessionCookie(session: UserSession): Promise<void> {
  const token = await signSessionToken(session);
  const cookieStore = cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  });
}

/**
 * Menghapus cookie sesi pengguna saat logout.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Verifikasi kata sandi teks polos terhadap hash bcrypt.
 */
export async function verifyPassword(
  plainText: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}

/**
 * Menghasilkan hash bcrypt dari kata sandi teks polos.
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}
