"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { applyTemplateToProjectAction } from "@/actions/rundown-actions";
import type { EventTemplate } from "@/db/schema/rundowns";
import { Sparkles, Clock, Loader2 } from "lucide-react";

interface ApplyTemplateDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: (EventTemplate & { itemCount: number })[];
  onSuccess: () => void;
}

export function ApplyTemplateDialog({
  projectId,
  open,
  onOpenChange,
  templates,
  onSuccess,
}: ApplyTemplateDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates[0]?.id ?? ""
  );
  const [customStartTime, setCustomStartTime] = useState<string>("07:00");
  const [replaceExisting, setReplaceExisting] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId) {
      toast.error("Silakan pilih template prosesi terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const formattedTime = customStartTime.length === 5 ? `${customStartTime}:00` : customStartTime;
      const res = await applyTemplateToProjectAction({
        projectId,
        templateId: selectedTemplateId,
        customStartTime: formattedTime,
        replaceExisting,
      });

      if (res.success) {
        toast.success("Template prosesi berhasil diterapkan ke susunan acara!");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(res.error?.message ?? "Gagal menerapkan template");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-stone-100 text-stone-800">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Terapkan Template Prosesi Acara
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Salin paket susunan acara baku (adat / agama) langsung ke dalam jadwal pengantin.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Template Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-stone-700 block">
              Pilih Pustaka Template
            </label>
            {templates.length === 0 ? (
              <div className="p-4 border rounded-lg text-center text-xs text-muted-foreground">
                Belum ada master template yang terdaftar.
              </div>
            ) : (
              <div className="grid gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                {templates.map((tmpl) => (
                  <label
                    key={tmpl.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplateId === tmpl.id
                        ? "border-stone-900 bg-stone-50/70"
                        : "border-border hover:bg-stone-50/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="templateRadio"
                      value={tmpl.id}
                      checked={selectedTemplateId === tmpl.id}
                      onChange={() => setSelectedTemplateId(tmpl.id)}
                      className="mt-0.5 h-4 w-4 text-stone-900 border-stone-300 focus:ring-stone-900"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-foreground truncate">
                          {tmpl.templateName}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-stone-200/60 text-stone-700 font-medium shrink-0">
                          {tmpl.itemCount} Sesi
                        </span>
                      </div>
                      {tmpl.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                          {tmpl.description}
                        </p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Custom Start Time & Replace Option */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="customStartTime" className="text-xs font-semibold text-stone-700 block">
                Jam Mulai Sesi Pertama (WIB)
              </label>
              <div className="relative">
                <Input
                  id="customStartTime"
                  type="time"
                  value={customStartTime}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomStartTime(e.target.value)}
                  required
                  className="text-xs font-mono pl-8"
                />
                <Clock className="h-3.5 w-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Sesi berikutnya akan menyesuaikan offset otomatis.
              </p>
            </div>

            <div className="space-y-2 pt-5">
              <label
                htmlFor="replaceExisting"
                className="flex items-start gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  id="replaceExisting"
                  checked={replaceExisting}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReplaceExisting(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                />
                <span className="text-xs text-stone-700 font-medium leading-tight">
                  Gantikan seluruh rundown yang ada saat ini
                </span>
              </label>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || templates.length === 0}
              className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  <span>Menerapkan...</span>
                </>
              ) : (
                "Terapkan Template"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
