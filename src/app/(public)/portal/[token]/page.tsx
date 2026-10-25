import React from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getPublicPortalDataByToken } from "@/services/public-portal-service";
import {
  checkRateLimit,
  recordFailedAttempt,
  recordSuccessfulAttempt,
} from "@/lib/rate-limiter";
import { WeddingCountdown } from "@/components/public/wedding-countdown";
import { PreparationProgressCard } from "@/components/public/preparation-progress-card";
import { ConfirmedVendorsGrid } from "@/components/public/confirmed-vendors-grid";
import { PublicRundownHighlights } from "@/components/public/public-rundown-highlights";
import { format, parseISO } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { MapPin, Calendar, ShieldCheck, Heart } from "lucide-react";

export const dynamic = "force-dynamic";

interface PortalPageProps {
  params: {
    token: string;
  };
}

export default async function PublicPortalPage({ params }: PortalPageProps) {
  // Extract client IP address for rate limiting
  const headerList = headers();
  const forwarded = headerList.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0]?.trim() || "127.0.0.1" : "127.0.0.1";

  // Rate Limiting & Anti-Brute-Force check
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return (
      <main className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6 text-center">
        <div className="max-w-md rounded-3xl bg-white border border-stone-200 p-8 shadow-sm">
          <ShieldCheck className="h-10 w-10 text-amber-700 mx-auto mb-3" />
          <h1 className="text-lg font-bold font-serif text-stone-900">
            Akses Ditangguhkan Sementara
          </h1>
          <p className="text-xs text-stone-600 mt-2 leading-relaxed">
            Terlalu banyak permintaan dalam waktu singkat. Demi menjaga keamanan data
            pernikahan klien, silakan tunggu beberapa menit sebelum membuka kembali tautan ini.
          </p>
        </div>
      </main>
    );
  }

  const portalData = await getPublicPortalDataByToken(params.token);

  if (!portalData) {
    recordFailedAttempt(ip);
    notFound();
  }

  recordSuccessfulAttempt(ip);

  let formattedDate = portalData.weddingDate;
  try {
    const parsed = parseISO(portalData.weddingDate);
    formattedDate = format(parsed, "EEEE, d MMMM yyyy", { locale: localeId });
  } catch {
    // fallback
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] text-stone-900 selection:bg-amber-100 selection:text-amber-900 pb-20">
      {/* Top Luxury Header Bar */}
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-base font-extrabold tracking-widest text-stone-900">
              ALTARA
            </span>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
              Wedding Portal
            </span>
          </div>

          <span className="text-[11px] font-serif italic text-stone-500">
            Private Client Access
          </span>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 flex flex-col gap-8">
        {/* Hero Title Section */}
        <section className="text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 text-xs font-serif italic mb-3">
            <Heart className="h-3 w-3 fill-amber-700 text-amber-700" />
            <span>The Wedding of</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-stone-950 leading-tight">
            {portalData.clientGroomName} &amp; {portalData.clientBrideName}
          </h1>

          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-y-1.5 gap-x-4 text-xs text-stone-600">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-amber-700" />
              <span>{formattedDate}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="h-3.5 w-3.5 text-amber-700" />
              <span>{portalData.venueName}</span>
            </div>
          </div>
        </section>

        {/* 1. Real-time Countdown */}
        <section>
          <WeddingCountdown
            targetTimestamp={portalData.weddingDateTimestamp}
            weddingDateFormatted={formattedDate}
          />
        </section>

        {/* 2. Preparation Progress Card */}
        <section>
          <PreparationProgressCard
            progress={portalData.preparationProgress}
            leadPlannerName={portalData.leadPlannerName || "Tim Altara Wedding Planner"}
          />
        </section>

        {/* 3. Confirmed Vendors Grid */}
        <section>
          <ConfirmedVendorsGrid vendors={portalData.confirmedVendors} />
        </section>

        {/* 4. Rundown Highlights */}
        <section>
          <PublicRundownHighlights highlights={portalData.rundownHighlights} />
        </section>

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center border-t border-stone-200 text-xs text-stone-500">
          <p className="font-serif font-bold text-stone-800 tracking-wider">
            ALTARA WEDDING ORGANIZER
          </p>
          <p className="mt-1 text-[11px] text-stone-500">
            Halaman ini diperbarui secara langsung oleh tim wedding planner Anda.
          </p>
        </footer>
      </div>
    </main>
  );
}
