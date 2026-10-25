import React from "react";
import type { CompanyAggregatesResult } from "@/lib/finance-math";
import { formatRupiah } from "@/lib/budget-math";
import {
  TrendingUp,
  DollarSign,
  Building2,
  Users,
  ShieldCheck,
  Lock,
} from "lucide-react";

interface ExecutiveMarginCardProps {
  aggregates: CompanyAggregatesResult;
}

export function ExecutiveMarginCard({ aggregates }: ExecutiveMarginCardProps) {
  const {
    totalGrossRevenue,
    totalVendorCost,
    totalCrewExpense,
    totalGrossProfit,
    overallNetMarginPercentage,
    projectCount,
  } = aggregates;

  const isProfitable = totalGrossProfit >= 0;

  return (
    <div className="space-y-4">
      {/* Top Owner Security Assurance Banner */}
      <div className="flex items-center justify-between bg-stone-900 text-stone-100 p-3.5 rounded-2xl border border-amber-500/30 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Tier 2B Executive Vault • Dimas Only
            </h2>
            <p className="text-[11px] text-stone-400">
              Data margin dapur bisnis, dividen, dan biaya riil agensi terenkripsi dan terisolasi penuh.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-2.5 py-1 text-[11px] font-bold">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Privasi Maksimum</span>
        </span>
      </div>

      {/* 4 Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Omzet Bruto */}
        <div className="rounded-2xl bg-card border border-border/70 p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Total Omzet Bruto</span>
            <DollarSign className="h-4 w-4 text-stone-500" />
          </div>
          <div className="mt-2">
            <span className="font-mono text-xl font-black text-foreground">
              {formatRupiah(totalGrossRevenue)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Dari {projectCount} proyek pernikahan aktif
            </p>
          </div>
        </div>

        {/* 2. Modal Vendor Riil */}
        <div className="rounded-2xl bg-card border border-border/70 p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Modal Vendor Riil</span>
            <Building2 className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2">
            <span className="font-mono text-xl font-black text-foreground">
              {formatRupiah(totalVendorCost)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Total tagihan resmi rekanan
            </p>
          </div>
        </div>

        {/* 3. Beban Honor Kru */}
        <div className="rounded-2xl bg-card border border-border/70 p-4 shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Beban Honor Kru</span>
            <Users className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="font-mono text-xl font-black text-foreground">
              {formatRupiah(totalCrewExpense)}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Honor staf lapangan &amp; koordinator
            </p>
          </div>
        </div>

        {/* 4. Laba Bersih & Margin Persentase */}
        <div
          className={`rounded-2xl border p-4 shadow-xs transition-colors ${
            isProfitable
              ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60"
              : "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              Laba Bersih &amp; Net Margin
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl font-black text-emerald-700 dark:text-emerald-300">
                {formatRupiah(totalGrossProfit)}
              </span>
              <span className="text-sm font-bold font-mono text-emerald-800 dark:text-emerald-400">
                ({overallNetMarginPercentage}%)
              </span>
            </div>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
              Margin bersih bisnis setelah seluruh beban
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
