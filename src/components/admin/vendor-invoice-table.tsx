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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { VendorInvoiceDTO } from "@/services/budget-service";
import { formatRupiah } from "@/lib/budget-math";
import {
  Receipt,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Trash2,
  ChevronDown,
} from "lucide-react";
import {
  updateVendorInvoiceStatusAction,
  deleteVendorInvoiceAction,
} from "@/actions/budget-actions";
import { toast } from "sonner";

interface VendorInvoiceTableProps {
  projectId: string;
  invoices: VendorInvoiceDTO[];
  canManage: boolean;
  onAddInvoice: () => void;
  onRefresh: () => void;
}

export function VendorInvoiceTable({
  projectId,
  invoices,
  canManage,
  onAddInvoice,
  onRefresh,
}: VendorInvoiceTableProps) {
  const handleStatusChange = async (
    invoiceId: string,
    newStatus: "PENDING" | "PARTIALLY_PAID" | "PAID" | "OVERDUE"
  ) => {
    try {
      const res = await updateVendorInvoiceStatusAction({
        projectId,
        invoiceId,
        status: newStatus,
      });

      if (res.success) {
        toast.success(`Status invoice diubah ke ${newStatus}`);
        onRefresh();
      } else {
        toast.error(res.error?.message ?? "Gagal memperbarui status");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  const handleDelete = async (invoiceId: string, invoiceNumber: string) => {
    if (!confirm(`Hapus invoice "${invoiceNumber}"?`)) return;

    try {
      const res = await deleteVendorInvoiceAction({ projectId, invoiceId });
      if (res.success) {
        toast.success(`Invoice "${invoiceNumber}" berhasil dihapus`);
        onRefresh();
      } else {
        toast.error(res.error?.message ?? "Gagal menghapus invoice");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge
            variant="outline"
            className="text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-semibold"
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>Lunas (Paid)</span>
          </Badge>
        );
      case "PARTIALLY_PAID":
        return (
          <Badge
            variant="outline"
            className="text-[11px] bg-blue-50 text-blue-700 border-blue-200 gap-1 font-semibold"
          >
            <Clock className="h-3 w-3 text-blue-600" />
            <span>Dibayar Sebagian</span>
          </Badge>
        );
      case "OVERDUE":
        return (
          <Badge
            variant="outline"
            className="text-[11px] bg-rose-50 text-rose-700 border-rose-200 gap-1 font-semibold"
          >
            <AlertCircle className="h-3 w-3 text-rose-600" />
            <span>Jatuh Tempo (Overdue)</span>
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge
            variant="outline"
            className="text-[11px] bg-stone-100 text-stone-700 border-stone-200 gap-1 font-semibold"
          >
            <Clock className="h-3 w-3 text-stone-400" />
            <span>Menunggu (Pending)</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Receipt className="h-4 w-4 text-stone-700" />
            <span>Pelacakan Tagihan Invoice Vendor Rekanan ({invoices.length})</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Daftar tagihan resmi dari mitra vendor yang ditugaskan ke acara pengantin.
          </p>
        </div>

        {canManage && (
          <Button
            size="sm"
            onClick={onAddInvoice}
            className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 gap-1.5 h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Catat Invoice Vendor</span>
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <Table className="text-xs">
          <TableHeader className="bg-stone-50/80 border-b border-border/70">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px] font-mono text-[11px] text-stone-600">No</TableHead>
              <TableHead className="w-[220px] font-medium text-stone-700">Mitra Rekanan & Kategori</TableHead>
              <TableHead className="w-[160px] font-medium text-stone-700">Nomor Invoice</TableHead>
              <TableHead className="w-[150px] font-medium text-stone-700">Nominal Tagihan</TableHead>
              <TableHead className="w-[130px] font-medium text-stone-700">Jatuh Tempo</TableHead>
              <TableHead className="w-[150px] font-medium text-stone-700">Status Pembayaran</TableHead>
              {canManage && <TableHead className="w-[60px] text-right font-medium">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canManage ? 7 : 6}
                  className="text-center py-10 text-muted-foreground"
                >
                  Belum ada tagihan invoice vendor yang dicatat pada proyek ini.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv, index) => {
                const amountNum = parseFloat(inv.totalAmount) || 0;

                return (
                  <TableRow key={inv.id} className="hover:bg-stone-50/50 transition-colors">
                    <TableCell className="font-mono text-stone-400 font-medium py-3">
                      {String(index + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-foreground">{inv.vendorName}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-stone-100 text-stone-700 font-medium px-1.5 py-0"
                          >
                            {inv.category}
                          </Badge>
                          <span className="text-[11px] text-muted-foreground">PIC: {inv.picName}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 font-mono font-semibold text-stone-800">
                      <div className="flex items-center gap-1.5">
                        <span>{inv.invoiceNumber}</span>
                        {inv.invoiceFileUrl && (
                          <a
                            href={inv.invoiceFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="Buka Berkas Tagihan"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 font-mono font-bold text-foreground">
                      {formatRupiah(amountNum)}
                    </TableCell>
                    <TableCell className="py-3 font-mono text-stone-600">
                      {inv.dueDate}
                    </TableCell>
                    <TableCell className="py-3">
                      {canManage ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="outline-none focus:ring-1 focus:ring-ring rounded-md transition-opacity hover:opacity-80 flex items-center gap-1"
                            >
                              {renderStatusBadge(inv.status)}
                              <ChevronDown className="h-3 w-3 text-stone-400" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="text-xs">
                            <DropdownMenuLabel className="text-[10px] text-muted-foreground">
                              Ubah Status Tagihan
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(inv.id, "PENDING")}
                              className="gap-2"
                            >
                              <Clock className="h-3.5 w-3.5 text-stone-400" />
                              <span>Menunggu (Pending)</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(inv.id, "PARTIALLY_PAID")}
                              className="gap-2 text-blue-600"
                            >
                              <Clock className="h-3.5 w-3.5" />
                              <span>Dibayar Sebagian</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(inv.id, "PAID")}
                              className="gap-2 text-emerald-600 font-medium"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Lunas (Paid)</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(inv.id, "OVERDUE")}
                              className="gap-2 text-rose-600"
                            >
                              <AlertCircle className="h-3.5 w-3.5" />
                              <span>Jatuh Tempo (Overdue)</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        renderStatusBadge(inv.status)
                      )}
                    </TableCell>
                    {canManage && (
                      <TableCell className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                          className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    )}
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
