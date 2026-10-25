"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  VendorFormDialog,
  VENDOR_CATEGORY_OPTIONS,
} from "@/components/admin/vendor-form-dialog";
import { generateDirectWhatsappUrl } from "@/lib/whatsapp";
import type { VendorDTO } from "@/services/vendor-service";
import {
  Building2,
  Plus,
  Search,
  MessageSquare,
  Edit2,
  Phone,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface VendorDirectoryClientProps {
  initialVendors: VendorDTO[];
  canManage: boolean;
}

const CATEGORY_COLOR_MAP: Record<string, string> = {
  VENUE: "bg-blue-50 text-blue-700 border-blue-200",
  CATERING: "bg-amber-50 text-amber-700 border-amber-200",
  DECORATION: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MUA: "bg-rose-50 text-rose-700 border-rose-200",
  PHOTO_VIDEO: "bg-purple-50 text-purple-700 border-purple-200",
  SOUND_LIGHTING: "bg-indigo-50 text-indigo-700 border-indigo-200",
  MC: "bg-cyan-50 text-cyan-700 border-cyan-200",
  ATTIRE: "bg-pink-50 text-pink-700 border-pink-200",
  ENTERTAINMENT: "bg-orange-50 text-orange-700 border-orange-200",
  OTHER: "bg-stone-50 text-stone-700 border-stone-200",
};

export function VendorDirectoryClient({
  initialVendors,
  canManage,
}: VendorDirectoryClientProps) {
  const router = useRouter();
  const [vendorsList] = useState<VendorDTO[]>(initialVendors);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorDTO | null>(null);

  const filteredVendors = vendorsList.filter((v) => {
    const matchesCategory =
      selectedCategory === "ALL" || v.category === selectedCategory;
    const matchesSearch =
      v.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.picName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.phone.includes(searchQuery);

    return matchesCategory && matchesSearch;
  });

  const handleOpenCreate = () => {
    setEditingVendor(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (vendor: VendorDTO) => {
    setEditingVendor(vendor);
    setDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Controls: Search, Category Filter Pills & Add Button */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Cari nama vendor, PIC, atau nomor HP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs bg-card"
            />
          </div>

          {canManage && (
            <Button
              onClick={handleOpenCreate}
              size="sm"
              className="text-xs bg-stone-900 text-stone-50 hover:bg-stone-800 gap-1.5 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Daftarkan Vendor Baru</span>
            </Button>
          )}
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap font-medium ${
              selectedCategory === "ALL"
                ? "bg-stone-900 text-stone-50 border-stone-900"
                : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
            }`}
          >
            Semua Kategori ({vendorsList.length})
          </button>
          {VENDOR_CATEGORY_OPTIONS.map((cat) => {
            const count = vendorsList.filter((v) => v.category === cat.value).length;
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap font-medium ${
                  isSelected
                    ? "bg-stone-900 text-stone-50 border-stone-900"
                    : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Vendor Table Card */}
      <Card className="border-border/80 shadow-xs overflow-hidden">
        {filteredVendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-3">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Tidak Ada Rekanan Vendor Ditemukan
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              {searchQuery
                ? `Tidak ada vendor yang cocok dengan kata kunci "${searchQuery}".`
                : "Belum ada vendor resmi yang didaftarkan pada kategori ini."}
            </p>
            {canManage && (
              <Button
                onClick={handleOpenCreate}
                variant="outline"
                size="sm"
                className="mt-4 text-xs gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Vendor Sekarang</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-xs font-semibold w-[220px]">
                    Vendor & Kategori
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Kontak PIC Resmi
                  </TableHead>
                  <TableHead className="text-xs font-semibold">
                    Alamat / Kota
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-center w-[100px]">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-right w-[140px]">
                    Aksi Cepat
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => {
                  const categoryBadgeColor =
                    CATEGORY_COLOR_MAP[vendor.category] ??
                    "bg-stone-50 text-stone-700 border-stone-200";
                  const waUrl = generateDirectWhatsappUrl(
                    vendor.phone,
                    `Halo Kak ${vendor.picName} (${vendor.vendorName}), salam dari tim Altara Wedding Organizer.`
                  );

                  return (
                    <TableRow key={vendor.id} className="hover:bg-muted/30">
                      <TableCell className="align-top py-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-xs text-foreground">
                            {vendor.vendorName}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border w-fit ${categoryBadgeColor}`}
                          >
                            {vendor.category}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="align-top py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium text-foreground">
                            {vendor.picName}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                            <Phone className="h-3 w-3 text-stone-400" />
                            <span>{vendor.phone}</span>
                          </div>
                          {vendor.email && (
                            <span className="text-[11px] text-muted-foreground">
                              {vendor.email}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="align-top py-3">
                        <span className="text-xs text-muted-foreground">
                          {vendor.address || "—"}
                        </span>
                      </TableCell>

                      <TableCell className="align-top py-3 text-center">
                        {vendor.isActive ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-normal"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            <span>Aktif</span>
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-stone-100 text-stone-600 border-stone-200 gap-1 font-normal"
                          >
                            <XCircle className="h-2.5 w-2.5" />
                            <span>Nonaktif</span>
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="align-top py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-2xs"
                            title="Chat via WhatsApp"
                          >
                            <MessageSquare className="h-3 w-3" />
                            <span>Chat</span>
                          </a>

                          {canManage && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(vendor)}
                              className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              title="Edit Vendor"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Modal Dialog Form Create/Edit */}
      <VendorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vendorToEdit={editingVendor}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
