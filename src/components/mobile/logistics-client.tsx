"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { SacredBelongingDTO } from "@/services/logistics-service";
import { SacredItemCard } from "./sacred-item-card";
import {
  updateSacredItemStatusAction,
  createSacredItemAction,
} from "@/actions/logistics-actions";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LogisticsClientProps {
  projectId: string;
  initialItems: SacredBelongingDTO[];
  crews: Array<{ id: string; fullName: string; role: string }>;
}

export function LogisticsClient({
  projectId,
  initialItems,
  crews,
}: LogisticsClientProps) {
  const router = useRouter();
  const [items, setItems] = useState<SacredBelongingDTO[]>(initialItems);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // New item form state
  const [newItemName, setNewItemName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newHolderId, setNewHolderId] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [savingNew, setSavingNew] = useState(false);

  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleStatusChange = async (
    itemId: string,
    newStatus: "NOT_RECEIVED" | "WITH_CREW" | "AT_STAGE" | "RETURNED_TO_FAMILY",
    newLocation?: string,
    newHolderId?: string | null
  ) => {
    // Optimistic UI update
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        return {
          ...it,
          status: newStatus,
          currentLocation: newLocation ?? it.currentLocation,
          currentHolderId:
            newHolderId !== undefined ? newHolderId : it.currentHolderId,
          holderName:
            newHolderId !== undefined
              ? crews.find((c) => c.id === newHolderId)?.fullName ?? null
              : it.holderName,
        };
      })
    );

    try {
      const res = await updateSacredItemStatusAction({
        projectId,
        itemId,
        status: newStatus,
        currentLocation: newLocation,
        currentHolderId: newHolderId,
      });

      if (res.success) {
        toast.success("Status barang sakral berhasil diperbarui!");
        router.refresh();
      } else {
        toast.error(res.error?.message ?? "Gagal memperbarui status");
        setItems(initialItems);
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
      setItems(initialItems);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newLocation.trim()) {
      toast.error("Nama barang dan lokasi fisik wajib diisi");
      return;
    }

    setSavingNew(true);
    try {
      const res = await createSacredItemAction({
        projectId,
        itemName: newItemName.trim(),
        currentLocation: newLocation.trim(),
        currentHolderId: newHolderId || null,
        notes: newNotes.trim() || null,
        status: "NOT_RECEIVED",
      });

      if (res.success) {
        toast.success("Barang sakral baru berhasil dicatat!");
        setAddDialogOpen(false);
        setNewItemName("");
        setNewLocation("");
        setNewHolderId("");
        setNewNotes("");
        router.refresh();
      } else {
        toast.error(res.error?.message ?? "Gagal menambahkan barang sakral");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setSavingNew(false);
    }
  };

  const filteredItems = items.filter((it) => {
    if (filter === "ACTIVE") return it.status !== "RETURNED_TO_FAMILY";
    if (filter === "COMPLETED") return it.status === "RETURNED_TO_FAMILY";
    return true;
  });

  const activeCount = items.filter((it) => it.status !== "RETURNED_TO_FAMILY").length;
  const completedCount = items.filter((it) => it.status === "RETURNED_TO_FAMILY").length;

  return (
    <div className="flex flex-col gap-3">
      {/* Top Filter Buttons & Add Button */}
      <div className="sticky top-14 z-30 bg-stone-900/95 backdrop-blur-md py-2 -mx-4 px-4 border-b border-stone-800/80 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`min-h-[36px] px-3 rounded-full text-xs font-bold transition-all ${
              filter === "ALL"
                ? "bg-amber-500 text-stone-950 shadow-sm"
                : "bg-stone-800/80 text-stone-400 hover:text-stone-200"
            }`}
          >
            Semua ({items.length})
          </button>

          <button
            type="button"
            onClick={() => setFilter("ACTIVE")}
            className={`min-h-[36px] px-3 rounded-full text-xs font-bold transition-all ${
              filter === "ACTIVE"
                ? "bg-amber-500 text-stone-950 shadow-sm"
                : "bg-stone-800/80 text-stone-400 hover:text-stone-200"
            }`}
          >
            Aktif ({activeCount})
          </button>

          <button
            type="button"
            onClick={() => setFilter("COMPLETED")}
            className={`min-h-[36px] px-3 rounded-full text-xs font-bold transition-all ${
              filter === "COMPLETED"
                ? "bg-amber-500 text-stone-950 shadow-sm"
                : "bg-stone-800/80 text-stone-400 hover:text-stone-200"
            }`}
          >
            Selesai ({completedCount})
          </button>
        </div>

        <button
          type="button"
          onClick={() => setAddDialogOpen(true)}
          className="min-h-[36px] flex items-center gap-1 px-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold active:scale-95 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Belongings List */}
      <div className="flex flex-col gap-3 pt-1">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl bg-stone-900/60 border border-stone-800 p-8 text-center text-stone-400">
            <Package className="h-8 w-8 mx-auto text-stone-600 mb-2" />
            <p className="text-xs font-medium">Tidak ada barang sakral pada filter ini.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <SacredItemCard
              key={item.id}
              item={item}
              projectId={projectId}
              crews={crews}
              onStatusChange={(newStatus, newLocation, newHolderId) =>
                handleStatusChange(item.id, newStatus, newLocation, newHolderId)
              }
            />
          ))
        )}
      </div>

      {/* Add Item Modal */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[420px] bg-stone-900 text-stone-100 border-stone-800">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-stone-100">
              Catat Barang Sakral Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-400">
              Dokumentasikan benda berharga pengantin yang wajib dijaga ketat selama acara.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateItem} className="space-y-3.5 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300 block">
                Nama Barang Sakral <span className="text-red-500">*</span>
              </label>
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Contoh: Kotak Seserahan Adat"
                required
                className="bg-stone-950 border-stone-700 text-xs text-stone-100 placeholder:text-stone-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300 block">
                Lokasi Fisik Awal <span className="text-red-500">*</span>
              </label>
              <Input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Contoh: Kamar Rias Pengantin / Meja Akad"
                required
                className="bg-stone-950 border-stone-700 text-xs text-stone-100 placeholder:text-stone-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300 block">
                Kru Pemegang Awal (Opsional)
              </label>
              <select
                value={newHolderId}
                onChange={(e) => setNewHolderId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-1 text-xs text-stone-100 focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Belum Ditugaskan --</option>
                {crews.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.role.replace(/_/g, " ")})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300 block">
                Catatan Petunjuk Khusus
              </label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Contoh: Diserahkan langsung ke Ibu Pengantin saat selesai akad"
                rows={2}
                className="flex min-h-[50px] w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-2 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAddDialogOpen(false)}
                className="text-xs text-stone-400 hover:text-stone-200"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={savingNew}
                className="text-xs bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
              >
                {savingNew ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  "Simpan Barang Sakral"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
