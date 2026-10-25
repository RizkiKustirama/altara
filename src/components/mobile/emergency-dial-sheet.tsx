"use client";

import React, { useState } from "react";
import {
  Phone,
  MessageCircle,
  Search,
  Shield,
  Building2,
  Heart,
  User,
} from "lucide-react";

export interface ContactEntry {
  id: string;
  category: "CREW" | "VENDOR" | "FAMILY";
  name: string;
  roleOrCategory: string;
  phone: string;
  notes?: string | null;
}

interface EmergencyDialSheetProps {
  projectName: string;
  contacts: ContactEntry[];
}

export function EmergencyDialSheet({
  projectName,
  contacts,
}: EmergencyDialSheetProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "CREW" | "VENDOR" | "FAMILY">("ALL");

  const filtered = contacts.filter((c) => {
    if (!c.phone || c.phone === "-") return false;
    if (filter !== "ALL" && c.category !== filter) return false;
    if (!search.trim()) return true;

    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.roleOrCategory.toLowerCase().includes(q) ||
      c.phone.includes(q)
    );
  });

  const getCleanPhone = (raw: string) => {
    let p = raw.replace(/[^0-9]/g, "");
    if (p.startsWith("0")) {
      p = "62" + p.slice(1);
    }
    return p;
  };

  const getCategoryBadge = (cat: ContactEntry["category"]) => {
    switch (cat) {
      case "CREW":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-amber-950/80 text-amber-300 border border-amber-800/40 px-2 py-0.5 text-[10px] font-bold">
            <Shield className="h-2.5 w-2.5" />
            <span>Kru WO</span>
          </span>
        );
      case "VENDOR":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-950/80 text-blue-300 border border-blue-800/40 px-2 py-0.5 text-[10px] font-bold">
            <Building2 className="h-2.5 w-2.5" />
            <span>Vendor</span>
          </span>
        );
      case "FAMILY":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-rose-950/80 text-rose-300 border border-rose-800/40 px-2 py-0.5 text-[10px] font-bold">
            <Heart className="h-2.5 w-2.5" />
            <span>Keluarga</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search Bar & Category Filters */}
      <div className="sticky top-14 z-30 bg-stone-900/95 backdrop-blur-md py-2 -mx-4 px-4 border-b border-stone-800/80 flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari PIC, Katering, MC, atau Kru..."
            className="w-full h-9 rounded-xl bg-stone-950 border border-stone-700 pl-9 pr-3 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`min-h-[34px] px-3 rounded-full text-xs font-bold transition-all ${
              filter === "ALL"
                ? "bg-amber-500 text-stone-950"
                : "bg-stone-800/80 text-stone-400"
            }`}
          >
            Semua ({contacts.filter((c) => c.phone && c.phone !== "-").length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("VENDOR")}
            className={`min-h-[34px] px-3 rounded-full text-xs font-bold transition-all ${
              filter === "VENDOR"
                ? "bg-amber-500 text-stone-950"
                : "bg-stone-800/80 text-stone-400"
            }`}
          >
            Vendor ({contacts.filter((c) => c.category === "VENDOR" && c.phone && c.phone !== "-").length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("CREW")}
            className={`min-h-[34px] px-3 rounded-full text-xs font-bold transition-all ${
              filter === "CREW"
                ? "bg-amber-500 text-stone-950"
                : "bg-stone-800/80 text-stone-400"
            }`}
          >
            Kru WO ({contacts.filter((c) => c.category === "CREW" && c.phone && c.phone !== "-").length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("FAMILY")}
            className={`min-h-[34px] px-3 rounded-full text-xs font-bold transition-all ${
              filter === "FAMILY"
                ? "bg-amber-500 text-stone-950"
                : "bg-stone-800/80 text-stone-400"
            }`}
          >
            Keluarga ({contacts.filter((c) => c.category === "FAMILY" && c.phone && c.phone !== "-").length})
          </button>
        </div>
      </div>

      {/* Speed Dial Card List */}
      <div className="flex flex-col gap-2.5 pt-1">
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-stone-900/60 border border-stone-800 p-8 text-center text-stone-400">
            <User className="h-8 w-8 mx-auto text-stone-600 mb-2" />
            <p className="text-xs font-medium">Tidak ada kontak yang cocok.</p>
          </div>
        ) : (
          filtered.map((contact) => {
            const cleanPhone = getCleanPhone(contact.phone);
            const waText = encodeURIComponent(
              `Halo Kak ${contact.name}, ini dari Tim WO Altara (${projectName}). Ada hal mendesak terkait acara...`
            );

            return (
              <div
                key={contact.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-stone-900 border border-stone-800/90 p-3.5 shadow-sm hover:border-stone-700 transition-all"
              >
                <div className="flex flex-col min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-stone-100 truncate">
                      {contact.name}
                    </span>
                    {getCategoryBadge(contact.category)}
                  </div>
                  <span className="text-xs text-amber-300/90 font-medium mt-0.5 truncate">
                    {contact.roleOrCategory}
                  </span>
                  <span className="font-mono text-[11px] text-stone-400 mt-0.5">
                    {contact.phone}
                  </span>
                </div>

                {/* 1-Tap Action Buttons (>= 44px) */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* WhatsApp Direct */}
                  <a
                    href={`https://wa.me/${cleanPhone}?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Kirim Pesan WhatsApp"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 active:scale-90 transition-transform shadow-xs"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </a>

                  {/* Telephone Direct */}
                  <a
                    href={`tel:${contact.phone}`}
                    title="Telepon Langsung"
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-stone-950 font-bold active:scale-90 transition-transform shadow-md"
                  >
                    <Phone className="h-5 w-5 fill-current" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
