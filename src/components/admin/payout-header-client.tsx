"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RecordPayoutDialog } from "./record-payout-dialog";
import { Banknote, Plus, Shield } from "lucide-react";

interface PayoutHeaderClientProps {
  projects: Array<{ id: string; projectName: string }>;
  crews: Array<{ id: string; fullName: string }>;
}

export function PayoutHeaderClient({
  projects,
  crews,
}: PayoutHeaderClientProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Banknote className="h-5 w-5 text-emerald-600" />
              <span>Pencairan Honor Kru Lapangan (Tier 2A)</span>
            </h1>
            <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 dark:bg-stone-800 px-2 py-0.5 text-[10px] font-bold text-stone-700 dark:text-stone-300">
              <Shield className="h-3 w-3 text-emerald-600" />
              <span>Manajemen &amp; Owner</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Rekapitulasi honor kru per sesi acara dengan fitur pencairan massal (batch payout) sekali klik.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Catat Honor Baru</span>
        </Button>
      </div>

      <RecordPayoutDialog
        projects={projects}
        crews={crews}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
