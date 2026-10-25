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
      // Jika pengguna sudah memiliki sesi aktif, arahkan ke dasbor yang sesuai
      const targetUrl = session.role === "CREW" ? "/field" : "/dashboard";
      return NextResponse.redirect(new URL(targetUrl, request.url));
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

  // 5. Proteksi Rute Eksklusif Owner (Tier 2 Keuangan Internal Dapur Bisnis)
  // Menolak akses jika diakses oleh role PLANNER (Sarah) atau CREW (Rian)
  if (
    pathname.startsWith("/finance") ||
    pathname.startsWith("/margins") ||
    pathname.startsWith("/crew-honor")
  ) {
    if (session.role !== "OWNER") {
      // Alihkan non-owner ke dashboard operasional utama
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 6. Proteksi Rute Kantor Desktop (/dashboard, /projects, /vendors, /templates)
  // Kru lapangan (Rian) diarahkan langsung ke tampilan mobile /field
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/vendors") ||
    pathname.startsWith("/templates")
  ) {
    if (session.role === "CREW") {
      return NextResponse.redirect(new URL("/field", request.url));
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
