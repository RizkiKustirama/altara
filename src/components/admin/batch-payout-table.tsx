"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { CrewPayoutDTO } from "@/services/payout-service";
import { formatRupiah } from "@/lib/budget-math";
import { executeBatchCrewPayoutAction } from "@/actions/finance-actions";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  Search,
  Loader2,
} from "lucide-react";

interface BatchPayoutTableProps {
  initialPayouts: CrewPayoutDTO[];
  canExecute: boolean;
}

export function BatchPayoutTable({
  initialPayouts,
  canExecute,
}: BatchPayoutTableProps) {
  const router = useRouter();
  const [payouts, setPayouts] = useState<CrewPayoutDTO[]>(initialPayouts);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "PAID">("PENDING");
  const [search, setSearch] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    setPayouts(initialPayouts);
  }, [initialPayouts]);

  // Filter list
  const filtered = payouts.filter((p) => {
    if (filter === "PENDING" && p.payoutStatus !== "PENDING") return false;
    if (filter === "PAID" && p.payoutStatus !== "PAID") return false;
    if (!search.trim()) return true;

    const q = search.toLowerCase();
    return (
      p.crewName.toLowerCase().includes(q) ||
      p.projectName.toLowerCase().includes(q) ||
      p.crewPhone.includes(q)
    );
  });

  const pendingList = filtered.filter((p) => p.payoutStatus === "PENDING");
  const isAllPendingSelected =
    pendingList.length > 0 &&
    pendingList.every((p) => selectedIds.includes(p.id));

  const toggleSelectAll = () => {
    if (isAllPendingSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingList.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  // Calculate sum of selected payouts
  const selectedSum = payouts
    .filter((p) => selectedIds.includes(p.id))
    .reduce((acc, curr) => acc + (parseFloat(curr.totalPayout) || 0), 0);

  const handleExecuteBatch = async () => {
    if (selectedIds.length === 0) {
      toast.error("Pilih minimal satu honor kru untuk dicairkan");
      return;
    }

    setLoading(true);
    try {
      const res = await executeBatchCrewPayoutAction({
        payoutIds: selectedIds,
        paymentReference: paymentReference.trim() || null,
      });

      if (res.success) {
        toast.success(
          `Berhasil mencairkan ${res.data?.updatedCount} honor kru secara serentak!`
        );
        setSelectedIds([]);
        setPaymentReference("");
        router.refresh();
      } else {
        toast.error(res.error?.message ?? "Gagal mencairkan honor massal");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search, Filter Tabs, and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/70 shadow-xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama kru atau acara..."
              className="h-8 text-xs pl-8 font-medium"
            />
          </div>

          <div className="flex items-center gap-1 border border-border/80 rounded-lg p-0.5 bg-muted/30">
            <button
              type="button"
              onClick={() => setFilter("PENDING")}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                filter === "PENDING"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Menunggu ({payouts.filter((p) => p.payoutStatus === "PENDING").length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("PAID")}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                filter === "PAID"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sudah Dicairkan ({payouts.filter((p) => p.payoutStatus === "PAID").length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                filter === "ALL"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua ({payouts.length})
            </button>
          </div>
        </div>

        {/* Selected Summary and Batch Trigger */}
        {selectedIds.length > 0 && canExecute && (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 p-1.5 rounded-lg">
            <div className="flex flex-col px-2">
              <span className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                {selectedIds.length} Kru Terpilih:
              </span>
              <span className="font-mono text-xs font-bold text-amber-900 dark:text-amber-200">
                {formatRupiah(selectedSum)}
              </span>
            </div>

            <Input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Ref: BCA Senin 27/10"
              className="h-7 text-xs w-36 bg-card"
            />

            <Button
              size="sm"
              disabled={loading}
              onClick={handleExecuteBatch}
              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1 shadow-xs"
            >
              {loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3 w-3" />
              )}
              <span>Cairkan Honor Massal</span>
            </Button>
          </div>
        )}
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <Table className="text-xs">
          <TableHeader className="bg-stone-50/80 dark:bg-stone-900/50 border-b border-border/70">
            <TableRow>
              {canExecute && (
                <TableHead className="w-[40px] text-center">
                  <input
                    type="checkbox"
                    checked={isAllPendingSelected}
                    onChange={toggleSelectAll}
                    disabled={pendingList.length === 0}
                    className="h-3.5 w-3.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                    title="Pilih semua honor yang belum dicairkan"
                  />
                </TableHead>
              )}
              <TableHead className="w-[180px] font-medium text-stone-700 dark:text-stone-300">
                Kru & Kontak
              </TableHead>
              <TableHead className="w-[200px] font-medium text-stone-700 dark:text-stone-300">
                Proyek & Tanggal Acara
              </TableHead>
              <TableHead className="w-[120px] font-medium text-stone-700 dark:text-stone-300 text-right">
                Daily Rate
              </TableHead>
              <TableHead className="w-[90px] font-medium text-stone-700 dark:text-stone-300 text-center">
                Sesi
              </TableHead>
              <TableHead className="w-[140px] font-medium text-stone-700 dark:text-stone-300 text-right">
                Total Honor
              </TableHead>
              <TableHead className="w-[130px] font-medium text-stone-700 dark:text-stone-300">
                Status Pencairan
              </TableHead>
              <TableHead className="font-medium text-stone-700 dark:text-stone-300">
                Catatan / Ref Transfer
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canExecute ? 8 : 7}
                  className="text-center py-10 text-muted-foreground"
                >
                  Tidak ada data honor kru pada filter ini.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isPending = item.payoutStatus === "PENDING";

                return (
                  <TableRow
                    key={item.id}
                    className={`transition-colors ${
                      isSelected
                        ? "bg-amber-50/60 dark:bg-amber-950/20"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    {canExecute && (
                      <TableCell className="text-center py-3">
                        {isPending ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(item.id)}
                            className="h-3.5 w-3.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                          />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mx-auto opacity-40" />
                        )}
                      </TableCell>
                    )}

                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground">
                          {item.crewName}
                        </span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {item.crewPhone || "-"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">
                          {item.projectName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {item.weddingDate}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-right font-mono text-stone-700 dark:text-stone-300">
                      {formatRupiah(item.dailyRate)}
                    </TableCell>

                    <TableCell className="py-3 text-center font-mono font-bold text-stone-800 dark:text-stone-200">
                      {parseFloat(item.sessionCount) || 1}x
                    </TableCell>

                    <TableCell className="py-3 text-right font-mono font-extrabold text-foreground text-sm">
                      {formatRupiah(item.totalPayout)}
                    </TableCell>

                    <TableCell className="py-3">
                      {!isPending ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-bold gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Sudah Cair (Paid)</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-amber-50 text-amber-800 border-amber-200 font-semibold gap-1"
                        >
                          <Clock className="h-3 w-3 text-amber-600" />
                          <span>Menunggu (Pending)</span>
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="py-3 text-muted-foreground text-[11px]">
                      {item.notes || "-"}
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
