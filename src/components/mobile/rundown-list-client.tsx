"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProjectRundown } from "@/db/schema/rundowns";
import { LiveRundownCard } from "./live-rundown-card";
import { updateRundownStatusAction } from "@/actions/rundown-actions";
import { toast } from "sonner";
import { Clock, Flame } from "lucide-react";

interface RundownListClientProps {
  projectId: string;
  initialItems: ProjectRundown[];
  canUpdateStatus: boolean;
}

export function RundownListClient({
  projectId,
  initialItems,
  canUpdateStatus,
}: RundownListClientProps) {
  const router = useRouter();
  const [items, setItems] = useState<ProjectRundown[]>(initialItems);
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "PENDING" | "COMPLETED">("ALL");

  React.useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const inProgressIndex = items.findIndex((it) => it.status === "IN_PROGRESS");
  const firstPendingIndex = items.findIndex((it) => it.status === "PENDING");

  const handleStatusChange = async (
    itemId: string,
    newStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "DELAYED"
  ) => {
    // Optimistic UI update
    setItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, status: newStatus } : it))
    );

    try {
      const res = await updateRundownStatusAction({
        projectId,
        itemId,
        status: newStatus,
      });

      if (res.success) {
        toast.success(`Status sesi berhasil diperbarui ke ${newStatus}`);
        router.refresh();
      } else {
        toast.error(res.error?.message ?? "Gagal memperbarui status");
        setItems(initialItems); // rollback
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
      setItems(initialItems);
    }
  };

  const filteredItems = items.filter((it) => {
    if (filter === "ACTIVE") return it.status === "IN_PROGRESS";
    if (filter === "PENDING") return it.status === "PENDING" || it.status === "DELAYED";
    if (filter === "COMPLETED") return it.status === "COMPLETED";
    return true;
  });

  const completedCount = items.filter((it) => it.status === "COMPLETED").length;

  return (
    <div className="flex flex-col gap-3">
      {/* Top Filter Buttons (Touch >= 44px) */}
      <div className="sticky top-14 z-30 bg-stone-900/95 backdrop-blur-md py-2 -mx-4 px-4 border-b border-stone-800/80 flex items-center justify-between gap-1 overflow-x-auto">
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
            className={`min-h-[36px] px-3 rounded-full text-xs font-bold transition-all flex items-center gap-1 ${
              filter === "ACTIVE"
                ? "bg-amber-500 text-stone-950 shadow-sm"
                : "bg-stone-800/80 text-stone-400 hover:text-stone-200"
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>Berjalan ({items.filter((it) => it.status === "IN_PROGRESS").length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter("PENDING")}
            className={`min-h-[36px] px-3 rounded-full text-xs font-bold transition-all ${
              filter === "PENDING"
                ? "bg-amber-500 text-stone-950 shadow-sm"
                : "bg-stone-800/80 text-stone-400 hover:text-stone-200"
            }`}
          >
            Menunggu ({items.length - completedCount})
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
      </div>

      {/* Rundown Cards List */}
      <div className="flex flex-col gap-3 pt-1">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl bg-stone-900/60 border border-stone-800 p-8 text-center text-stone-400">
            <Clock className="h-8 w-8 mx-auto text-stone-600 mb-2" />
            <p className="text-xs font-medium">Tidak ada sesi acara pada filter ini.</p>
          </div>
        ) : (
          filteredItems.map((it, idx) => {
            const isUpNext =
              inProgressIndex !== -1
                ? idx === inProgressIndex + 1
                : idx === firstPendingIndex;

            return (
              <LiveRundownCard
                key={it.id}
                item={it}
                isUpNext={isUpNext}
                canUpdateStatus={canUpdateStatus}
                onStatusChange={(status) => handleStatusChange(it.id, status)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
