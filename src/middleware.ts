import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Lewati pengecekan untuk aset statis dan rute publik
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/public") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // 2. Ambil token sesi dari cookie
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // 3. Penanganan rute login (/login)
  if (pathname === "/login") {
    if (session) {
      // Jika pengguna sudah memiliki sesi aktif, arahkan ke dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 4. Seluruh rute internal di bawah ini wajib memiliki sesi aktif
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/login") {
      loginUrl.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 5. Proteksi Rute Eksklusif Owner (Tier 2B Keuangan Internal Dapur Bisnis & Margin)
  if (
    pathname.startsWith("/finance") ||
    pathname.startsWith("/margins")
  ) {
    if (session.role !== "OWNER") {
      // Alihkan non-owner ke dashboard operasional utama
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 6. Proteksi Rute Pencairan Honor Kru Mingguan (Tier 2A: OWNER & MANAGEMENT)
  if (pathname.startsWith("/payouts")) {
    if (session.role !== "OWNER" && session.role !== "MANAGEMENT") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json).*)",
  ],
};
