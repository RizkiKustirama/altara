"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProjectBudget } from "@/db/schema/operational-budgets";
import { formatRupiah } from "@/lib/budget-math";
import { Pencil, Trash2, PieChart, Plus } from "lucide-react";
import { deleteBudgetCategoryAction } from "@/actions/budget-actions";
import { toast } from "sonner";

interface BudgetCategoryTableProps {
  projectId: string;
  contractAmount: number;
  categories: ProjectBudget[];
  canManage: boolean;
  onEditCategory: (cat: ProjectBudget) => void;
  onAddCategory: () => void;
  onRefresh: () => void;
}

export function BudgetCategoryTable({
  projectId,
  contractAmount,
  categories,
  canManage,
  onEditCategory,
  onAddCategory,
  onRefresh,
}: BudgetCategoryTableProps) {
  const handleDelete = async (budgetId: string, categoryName: string) => {
    if (!confirm(`Hapus alokasi bujet pos "${categoryName}"?`)) return;

    try {
      const res = await deleteBudgetCategoryAction({ budgetId, projectId });
      if (res.success) {
        toast.success(`Alokasi pos "${categoryName}" berhasil dihapus`);
        onRefresh();
      } else {
        toast.error(res.error?.message ?? "Gagal menghapus pos alokasi");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  const totalAllocated = categories.reduce(
    (acc, c) => acc + (parseFloat(c.allocatedAmount) || 0),
    0
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <PieChart className="h-4 w-4 text-stone-700" />
            <span>Alokasi Pagu Anggaran per Pos Kebutuhan ({categories.length})</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pembagian bujet pengantin untuk tiap pos rekanan (Venue, Catering, Dekor, dll).
          </p>
        </div>

        {canManage && (
          <Button
            size="sm"
            onClick={onAddCategory}
            className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 gap-1.5 h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Alokasikan Pos Baru</span>
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <Table className="text-xs">
          <TableHeader className="bg-stone-50/80 border-b border-border/70">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px] font-mono text-[11px] text-stone-600">No</TableHead>
              <TableHead className="w-[200px] font-medium text-stone-700">Pos Kebutuhan</TableHead>
              <TableHead className="w-[180px] font-medium text-stone-700">Alokasi Nominal</TableHead>
              <TableHead className="w-[120px] font-medium text-stone-700">Porsi Plafon</TableHead>
              <TableHead className="min-w-[200px] font-medium text-stone-700">Catatan Khusus</TableHead>
              {canManage && <TableHead className="w-[80px] text-right font-medium">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canManage ? 6 : 5}
                  className="text-center py-10 text-muted-foreground"
                >
                  Belum ada alokasi pos anggaran. Silakan buat alokasi pos baru.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((c, index) => {
                const amountNum = parseFloat(c.allocatedAmount) || 0;
                const portion = contractAmount > 0
                  ? Math.round((amountNum / contractAmount) * 100)
                  : 0;

                return (
                  <TableRow key={c.id} className="hover:bg-stone-50/50 transition-colors">
                    <TableCell className="font-mono text-stone-400 font-medium py-3">
                      {String(index + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="py-3 font-semibold text-foreground">
                      <Badge
                        variant="outline"
                        className="text-[11px] font-semibold bg-stone-100 text-stone-800 border-border"
                      >
                        {c.category.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 font-mono font-bold text-foreground">
                      {formatRupiah(amountNum)}
                    </TableCell>
                    <TableCell className="py-3 font-mono text-stone-600">
                      {portion}%
                    </TableCell>
                    <TableCell className="py-3 text-muted-foreground">
                      {c.notes || <span className="italic text-stone-400">-</span>}
                    </TableCell>
                    {canManage && (
                      <TableCell className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditCategory(c)}
                            className="h-7 w-7 text-stone-500 hover:text-stone-900"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(c.id, c.category)}
                            className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Footer Summary Row */}
        {categories.length > 0 && (
          <div className="px-5 py-3 border-t border-border/80 bg-stone-50/70 flex items-center justify-between text-xs font-semibold">
            <span>Total Alokasi Terjadwal:</span>
            <span className="font-mono text-stone-900">{formatRupiah(totalAllocated)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
