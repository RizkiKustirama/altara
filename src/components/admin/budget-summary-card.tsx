"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BudgetMetricsResult } from "@/lib/budget-math";
import { formatRupiah } from "@/lib/budget-math";
import {
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  CreditCard,
} from "lucide-react";

interface BudgetSummaryCardProps {
  metrics: BudgetMetricsResult;
}

export function BudgetSummaryCard({ metrics }: BudgetSummaryCardProps) {
  const {
    contractAmount,
    totalAllocated,
    remainingAllocation,
    allocationPercentage,
    isOverBudget,
    totalVendorInvoiced,
    totalVendorPaid,
    totalVendorPending,
    totalClientMilestones,
    totalClientPaid,
    totalClientRemaining,
  } = metrics;

  const barColor = isOverBudget
    ? "bg-rose-500"
    : allocationPercentage > 90
    ? "bg-amber-500"
    : "bg-emerald-500";

  const barWidth = Math.min(allocationPercentage, 100);

  return (
    <Card className="p-6 rounded-xl border border-border/80 bg-card shadow-xs space-y-6">
      {/* Top Header & Plafon Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-stone-100 text-stone-800">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground">
                Plafon Kontrak Acara Pengantin
              </h2>
              {isOverBudget ? (
                <Badge
                  variant="outline"
                  className="text-xs bg-rose-50 text-rose-700 border-rose-200 gap-1 font-semibold"
                >
                  <AlertTriangle className="h-3 w-3 text-rose-600" />
                  <span>Over Budget ({allocationPercentage}%)</span>
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-semibold"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>Aman ({allocationPercentage}%)</span>
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pagu anggaran operasional pernikahan yang disepakati bersama pengantin.
            </p>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {formatRupiah(contractAmount)}
          </span>
        </div>
      </div>

      {/* Progress Bar Plafon vs Alokasi */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-medium">
            Total Alokasi Pos:{" "}
            <strong className="text-foreground font-mono">
              {formatRupiah(totalAllocated)}
            </strong>
          </span>
          <span className="font-medium">
            {isOverBudget ? (
              <span className="text-rose-600 font-mono">
                Melebihi Plafon: +{formatRupiah(Math.abs(remainingAllocation))}
              </span>
            ) : (
              <span className="text-emerald-700 font-mono">
                Sisa Plafon Bebas: {formatRupiah(remainingAllocation)}
              </span>
            )}
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden border border-border/50">
          <div
            className={`h-full transition-all duration-500 rounded-full ${barColor}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      {/* Secondary Metrics: Vendor Invoices & Client Payment Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/60">
        {/* Vendor Invoices Status */}
        <div className="p-4 rounded-lg bg-stone-50/60 border border-border/70 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-700 shrink-0">
            <Receipt className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Tagihan Vendor Masuk</span>
              <span className="font-mono font-bold text-foreground">
                {formatRupiah(totalVendorInvoiced)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] mt-1 text-muted-foreground">
              <span>Sudah Lunas: <strong className="text-emerald-600 font-mono">{formatRupiah(totalVendorPaid)}</strong></span>
              <span>Pending: <strong className="text-amber-600 font-mono">{formatRupiah(totalVendorPending)}</strong></span>
            </div>
          </div>
        </div>

        {/* Client Payment Progress */}
        <div className="p-4 rounded-lg bg-stone-50/60 border border-border/70 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
            <CreditCard className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Penerimaan Termin Klien</span>
              <span className="font-mono font-bold text-emerald-700">
                {formatRupiah(totalClientPaid)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] mt-1 text-muted-foreground">
              <span>Total Termin: <strong className="font-mono text-foreground">{formatRupiah(totalClientMilestones)}</strong></span>
              <span>Sisa Piutang: <strong className="text-stone-700 font-mono">{formatRupiah(totalClientRemaining)}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
