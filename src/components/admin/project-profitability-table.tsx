import React from "react";
import type { ProjectExecutiveFinanceDTO } from "@/services/company-finance-service";
import { formatRupiah } from "@/lib/budget-math";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface ProjectProfitabilityTableProps {
  projects: ProjectExecutiveFinanceDTO[];
}

export function ProjectProfitabilityTable({
  projects,
}: ProjectProfitabilityTableProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span>Rincian Margin &amp; Laba Kotor Tiap Proyek Acara ({projects.length})</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Analisis perbandingan nilai kontrak pengantin terhadap pengeluaran riil vendor dan kru.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <Table className="text-xs">
          <TableHeader className="bg-stone-50/80 dark:bg-stone-900/50 border-b border-border/70">
            <TableRow>
              <TableHead className="w-[40px] font-mono text-[11px]">No</TableHead>
              <TableHead className="w-[200px] font-medium text-stone-700 dark:text-stone-300">
                Proyek &amp; Pengantin
              </TableHead>
              <TableHead className="w-[120px] font-medium text-stone-700 dark:text-stone-300">
                Tanggal Acara
              </TableHead>
              <TableHead className="w-[140px] font-medium text-stone-700 dark:text-stone-300 text-right">
                Nilai Kontrak
              </TableHead>
              <TableHead className="w-[130px] font-medium text-stone-700 dark:text-stone-300 text-right">
                Beban Vendor
              </TableHead>
              <TableHead className="w-[120px] font-medium text-stone-700 dark:text-stone-300 text-right">
                Beban Kru
              </TableHead>
              <TableHead className="w-[140px] font-medium text-stone-700 dark:text-stone-300 text-right">
                Laba Bersih
              </TableHead>
              <TableHead className="w-[110px] font-medium text-stone-700 dark:text-stone-300 text-center">
                Net Margin
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {projects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-10 text-muted-foreground"
                >
                  Belum ada proyek pernikahan yang tercatat di sistem.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p, index) => {
                const isProfitable = p.isProfitable;

                return (
                  <TableRow
                    key={p.projectId}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="font-mono text-muted-foreground font-medium py-3">
                      {String(index + 1).padStart(2, "0")}
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">
                          {p.projectName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {p.clientName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 font-mono text-stone-600 dark:text-stone-400">
                      {p.weddingDate}
                    </TableCell>

                    <TableCell className="py-3 text-right font-mono font-bold text-foreground">
                      {formatRupiah(p.grossContractPrice)}
                    </TableCell>

                    <TableCell className="py-3 text-right font-mono text-stone-700 dark:text-stone-300">
                      {formatRupiah(p.vendorRealCost)}
                    </TableCell>

                    <TableCell className="py-3 text-right font-mono text-stone-700 dark:text-stone-300">
                      {formatRupiah(p.crewTotalExpense)}
                    </TableCell>

                    <TableCell className="py-3 text-right font-mono font-extrabold text-sm">
                      <span
                        className={
                          isProfitable
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }
                      >
                        {formatRupiah(p.grossProfit)}
                      </span>
                    </TableCell>

                    <TableCell className="py-3 text-center">
                      {isProfitable ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-bold gap-1"
                        >
                          <TrendingUp className="h-3 w-3 text-emerald-600" />
                          <span>{p.netProfitMargin}%</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-rose-50 text-rose-700 border-rose-200 font-bold gap-1"
                        >
                          <TrendingDown className="h-3 w-3 text-rose-600" />
                          <span>{p.netProfitMargin}%</span>
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
