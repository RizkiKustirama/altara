import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { assertRole } from "@/lib/auth-guard";
import { getCompanyExecutiveFinancials } from "@/services/company-finance-service";
import { ExecutiveMarginCard } from "@/components/admin/executive-margin-card";
import { ProjectProfitabilityTable } from "@/components/admin/project-profitability-table";
import { ShieldAlert, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExecutiveMarginsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Strict Tier 2B Owner Exclusive Check
  const auth = assertRole(session, ["OWNER"]);
  if (!auth.success) {
    // Non-owner users (Management, Crew) are strictly denied
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto">
        <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 mb-3 border border-rose-200">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-lg font-bold text-foreground">
          Akses Ditolak: Khusus Owner
        </h1>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
          Halaman ini memuat kalkulasi laba bersih, dividen, dan dapur keuangan internal
          yang hanya dapat diakses oleh Dimas (Owner). Akun Anda tidak memiliki otoritas
          untuk melihat data ini.
        </p>
      </div>
    );
  }

  const financials = await getCompanyExecutiveFinancials();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <span>Dapur Bisnis &amp; Margin Keuntungan (Tier 2B)</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Rekapitulasi omzet bruto, modal riil vendor, pengeluaran kru, dan margin laba bersih tiap proyek pernikahan.
        </p>
      </div>

      {/* Aggregate Cards */}
      <ExecutiveMarginCard aggregates={financials.aggregates} />

      {/* Breakdown Table */}
      <ProjectProfitabilityTable projects={financials.projects} />
    </div>
  );
}
