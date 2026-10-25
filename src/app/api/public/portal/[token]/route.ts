import { NextRequest, NextResponse } from "next/server";
import { getPublicPortalDataByToken } from "@/services/public-portal-service";
import {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
} from "@/lib/rate-limiter";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    token: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  // Extract client IP address
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0]?.trim() || "127.0.0.1" : "127.0.0.1";

  // Check rate limit & anti-brute-force
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    const isThrottled = rateLimit.reason === "THROTTLED";
    return NextResponse.json(
      {
        error: isThrottled
          ? "Terlalu banyak percobaan tidak valid. Akses ditangguhkan sementara demi keamanan."
          : "Batas permintaan per menit tercapai. Silakan tunggu sesaat.",
        retryAfter: rateLimit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds ?? 60),
        },
      }
    );
  }

  const { token } = params;
  const portalData = await getPublicPortalDataByToken(token);

  if (!portalData) {
    // Record failed attempt for anti-token enumeration
    const failure = recordFailedAttempt(ip);
    return NextResponse.json(
      {
        error: "Portal pernikahan tidak ditemukan atau tautan telah kedaluwarsa.",
        isBlocked: failure.isBlocked,
      },
      { status: 404 }
    );
  }

  // Record successful access to reset failure counters
  recordSuccessfulAttempt(ip);

  return NextResponse.json({
    success: true,
    data: portalData,
  });
}
