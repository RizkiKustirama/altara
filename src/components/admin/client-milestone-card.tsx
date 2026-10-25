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
import type { PaymentMilestone } from "@/db/schema/operational-budgets";
import { formatRupiah } from "@/lib/budget-math";
import { generatePaymentReminderWhatsappUrl } from "@/lib/whatsapp";
import {
  CreditCard,
  Plus,
  MessageCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Trash2,
} from "lucide-react";
import {
  updatePaymentMilestoneAction,
  deletePaymentMilestoneAction,
} from "@/actions/budget-actions";
import { toast } from "sonner";

interface ClientMilestoneCardProps {
  projectId: string;
  clientName: string;
  clientPhone?: string | null;
  milestones: PaymentMilestone[];
  canManage: boolean;
  onAddMilestone: () => void;
  onRefresh: () => void;
}

export function ClientMilestoneCard({
  projectId,
  clientName,
  clientPhone,
  milestones,
  canManage,
  onAddMilestone,
  onRefresh,
}: ClientMilestoneCardProps) {
  const handleMarkAsPaid = async (milestone: PaymentMilestone) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await updatePaymentMilestoneAction({
        projectId,
        milestoneId: milestone.id,
        status: "PAID",
        paidDate: today,
      });

      if (res.success) {
        toast.success(`Termin "${milestone.title}" ditandai Lunas!`);
        onRefresh();
      } else {
        toast.error(res.error?.message ?? "Gagal memperbarui status termin");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  const handleDelete = async (milestoneId: string, title: string) => {
    if (!confirm(`Hapus termin "${title}"?`)) return;

    try {
      const res = await deletePaymentMilestoneAction({ projectId, milestoneId });
      if (res.success) {
        toast.success(`Termin "${title}" berhasil dihapus`);
        onRefresh();
      } else {
        toast.error(res.error?.message ?? "Gagal menghapus termin");
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
      case "OVERDUE":
        return (
          <Badge
            variant="outline"
            className="text-[11px] bg-rose-50 text-rose-700 border-rose-200 gap-1 font-semibold"
          >
            <AlertCircle className="h-3 w-3 text-rose-600" />
            <span>Jatuh Tempo</span>
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
            <span>Belum Bayar</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-stone-700" />
            <span>Jadwal Termin Pembayaran Klien Pengantin ({milestones.length})</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tahapan setoran biaya pengantin (DP & Pelunasan) dengan tombol reminder WhatsApp otomatis.
          </p>
        </div>

        {canManage && (
          <Button
            size="sm"
            onClick={onAddMilestone}
            className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 gap-1.5 h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Termin</span>
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <Table className="text-xs">
          <TableHeader className="bg-stone-50/80 border-b border-border/70">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40px] font-mono text-[11px] text-stone-600">No</TableHead>
              <TableHead className="w-[200px] font-medium text-stone-700">Nama Termin</TableHead>
              <TableHead className="w-[160px] font-medium text-stone-700">Nominal Tagihan</TableHead>
              <TableHead className="w-[130px] font-medium text-stone-700">Jatuh Tempo</TableHead>
              <TableHead className="w-[140px] font-medium text-stone-700">Status Pembayaran</TableHead>
              <TableHead className="min-w-[150px] font-medium text-stone-700">WhatsApp Reminder</TableHead>
              {canManage && <TableHead className="w-[60px] text-right font-medium">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {milestones.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={canManage ? 7 : 6}
                  className="text-center py-10 text-muted-foreground"
                >
                  Belum ada jadwal termin pembayaran klien yang dicatat.
                </TableCell>
              </TableRow>
            ) : (
              milestones.map((ms, index) => {
                const amountNum = parseFloat(ms.amount) || 0;
                const formattedAmount = formatRupiah(amountNum);

                const waReminderUrl = clientPhone
                  ? generatePaymentReminderWhatsappUrl({
                      clientName,
                      rawPhone: clientPhone,
                      milestoneTitle: ms.title,
                      amountRupiah: formattedAmount.replace(/^Rp\s?/, ""),
                      dueDate: ms.dueDate,
                    })
                  : null;

                return (
                  <TableRow key={ms.id} className="hover:bg-stone-50/50 transition-colors">
                    <TableCell className="font-mono text-stone-400 font-medium py-3">
                      {String(index + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="py-3 font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <span>{ms.title}</span>
                        {ms.proofFileUrl && (
                          <a
                            href={ms.proofFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-800"
                            title="Buka Bukti Bayar"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 font-mono font-bold text-foreground">
                      {formattedAmount}
                    </TableCell>
                    <TableCell className="py-3 font-mono text-stone-600">
                      <div>{ms.dueDate}</div>
                      {ms.paidDate && (
                        <div className="text-[10px] text-emerald-600">Lunas: {ms.paidDate}</div>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(ms.status)}
                        {canManage && ms.status !== "PAID" && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsPaid(ms)}
                            className="text-[10px] text-emerald-600 hover:text-emerald-800 underline font-medium"
                          >
                            Tandai Lunas
                          </button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      {ms.status !== "PAID" ? (
                        waReminderUrl ? (
                          <a
                            href={waReminderUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/70 hover:bg-emerald-100 text-xs font-semibold transition-colors"
                          >
                            <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Kirim Reminder WA</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-stone-400 italic">No HP Klien Kosong</span>
                        )
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Sudah Selesai</span>
                        </span>
                      )}
                    </TableCell>
                    {canManage && (
                      <TableCell className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(ms.id, ms.title)}
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
