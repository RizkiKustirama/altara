import React from "react";
import type { PublicConfirmedVendorDTO } from "@/types/public-portal-dto";
import {
  Building2,
  Utensils,
  Camera,
  Palette,
  Music,
  Sparkles,
  CheckCircle2,
  Heart,
} from "lucide-react";

interface ConfirmedVendorsGridProps {
  vendors: PublicConfirmedVendorDTO[];
}

export function ConfirmedVendorsGrid({ vendors }: ConfirmedVendorsGridProps) {
  const getCategoryIcon = (category: string) => {
    const c = category.toUpperCase();
    if (c.includes("VENUE") || c.includes("GEDUNG")) return Building2;
    if (c.includes("CATERING") || c.includes("KATERING")) return Utensils;
    if (c.includes("PHOTO") || c.includes("VIDEO") || c.includes("DOKUMENTASI"))
      return Camera;
    if (c.includes("DECOR") || c.includes("DEKORASI")) return Palette;
    if (c.includes("SOUND") || c.includes("MUSIC") || c.includes("HIBURAN") || c.includes("MC"))
      return Music;
    return Sparkles;
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
            <Heart className="h-4 w-4 fill-amber-700 text-amber-700" />
            <span>Rekanan Vendor Terpilih ({vendors.length})</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Mitra resmi yang akan mewujudkan setiap momen istimewa pernikahan Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {vendors.length === 0 ? (
          <div className="col-span-full rounded-2xl bg-white/80 border border-stone-200/80 p-6 text-center text-xs text-stone-500">
            Daftar rekanan vendor sedang dalam tahap fiksasi bersama wedding planner.
          </div>
        ) : (
          vendors.map((v, idx) => {
            const Icon = getCategoryIcon(v.category);

            return (
              <div
                key={`${v.category}-${idx}`}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white border border-stone-200/90 p-4 shadow-2xs hover:border-amber-400/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800 border border-amber-200/50">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      {v.category.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-bold text-stone-900 truncate">
                      {v.vendorName}
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 shrink-0 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Siap</span>
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
