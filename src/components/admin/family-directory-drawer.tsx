"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FamilyMemberDialog } from "./family-member-dialog";
import type { WeddingParty } from "@/db/schema/wedding-parties";
import { deleteWeddingPartyMemberAction } from "@/actions/wedding-party-actions";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Phone,
  MessageCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { generateDirectWhatsappUrl } from "@/lib/whatsapp";

interface FamilyDirectoryDrawerProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: WeddingParty[];
  canManage: boolean;
  onRefresh: () => void;
}

export function FamilyDirectoryDrawer({
  projectId,
  open,
  onOpenChange,
  members,
  canManage,
  onRefresh,
}: FamilyDirectoryDrawerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<WeddingParty | null>(null);

  const handleEdit = (m: WeddingParty) => {
    setEditingMember(m);
    setDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingMember(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus data keluarga "${name}"?`)) return;

    try {
      const res = await deleteWeddingPartyMemberAction({ id, projectId });
      if (res.success) {
        toast.success(`Data "${name}" berhasil dihapus`);
        onRefresh();
      } else {
        toast.error(res.error?.message ?? "Gagal menghapus data");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full flex flex-col p-0">
        <SheetHeader className="p-5 border-b border-border/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-stone-100 text-stone-800">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold">
                  Direktori Keluarga & Saksi
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                  Kontak darurat, saksi nikah, dan pengiring acara.
                </SheetDescription>
              </div>
            </div>
          </div>
        </SheetHeader>

        {/* Action button inside drawer */}
        {canManage && (
          <div className="px-5 py-3 border-b border-border/60 bg-stone-50/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Total {members.length} anggota terdaftar
            </span>
            <Button
              size="sm"
              onClick={handleCreateNew}
              className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 gap-1.5 h-8"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Anggota</span>
            </Button>
          </div>
        )}

        {/* Member List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {members.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed rounded-lg">
              <Users className="h-8 w-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-foreground">
                Belum ada anggota keluarga
              </p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-xs mx-auto">
                Tambahkan orang tua pengantin, saksi nikah, atau tamu VIP untuk dimasukkan ke Guidebook TM.
              </p>
            </div>
          ) : (
            members.map((m) => {
              const waUrl = m.phone ? generateDirectWhatsappUrl(m.phone) : null;

              return (
                <div
                  key={m.id}
                  className="p-3.5 rounded-lg border border-border/80 bg-card hover:bg-stone-50/40 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate">
                        {m.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0 font-medium bg-stone-100 text-stone-700"
                        >
                          {m.relationship.replace(/_/g, " ")}
                        </Badge>
                        {m.ceremonialRole && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 font-medium bg-blue-50 text-blue-700 border-blue-200"
                          >
                            {m.ceremonialRole}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {canManage && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(m)}
                          className="h-7 w-7 text-stone-500 hover:text-stone-900"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(m.id, m.name)}
                          className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {m.notes && (
                    <p className="text-[11px] text-muted-foreground italic">
                      &quot;{m.notes}&quot;
                    </p>
                  )}

                  {m.phone && (
                    <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
                      <span className="font-mono text-stone-600 flex items-center gap-1">
                        <Phone className="h-3 w-3 text-stone-400" />
                        {m.phone}
                      </span>
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>Chat WA</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <FamilyMemberDialog
          projectId={projectId}
          member={editingMember}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={onRefresh}
        />
      </SheetContent>
    </Sheet>
  );
}
