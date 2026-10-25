"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  MessageCircle,
  Mail,
  Calendar,
  Briefcase,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { sanitizeIndonesianPhone } from "@/lib/whatsapp";
import type { CrewDirectoryItemDTO } from "@/services/crew-service";

interface CrewDirectoryTableProps {
  crews: CrewDirectoryItemDTO[];
}

export function CrewDirectoryTable({ crews }: CrewDirectoryTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const filtered = crews.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);

    const matchesRole = roleFilter === "ALL" || c.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "OWNER":
        return (
          <Badge className="bg-stone-900 text-stone-50 hover:bg-stone-800 text-[11px] font-semibold">
            Owner (Dimas)
          </Badge>
        );
      case "MANAGEMENT":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 text-[11px] font-semibold">
            Manajemen (Maya)
          </Badge>
        );
      default:
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100 text-[11px] font-semibold">
            Staf Kru / PM
          </Badge>
        );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <Input
            placeholder="Cari nama, email, atau nomor HP kru..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-stone-500 whitespace-nowrap">
            Filter Peran:
          </span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-md border border-input bg-card px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ALL">Semua Peran ({crews.length})</option>
            <option value="OWNER">Owner</option>
            <option value="MANAGEMENT">Manajemen</option>
            <option value="CREW">Kru / PM</option>
          </select>
        </div>
      </div>

      {/* Directory Table Card */}
      <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50/70 border-b border-border/60 text-xs font-semibold text-stone-600">
              <tr>
                <th className="py-3 px-4">Profil Anggota</th>
                <th className="py-3 px-4">Peran Sistem</th>
                <th className="py-3 px-4">Kontak Langsung</th>
                <th className="py-3 px-4">Beban Proyek Aktif</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400">
                    <Users className="h-8 w-8 mx-auto mb-2 text-stone-300" />
                    Tidak ada anggota kru yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((crew) => {
                  const sanitizedWaPhone = sanitizeIndonesianPhone(crew.phone);
                  const waUrl = `https://wa.me/${sanitizedWaPhone}?text=${encodeURIComponent(
                    `Halo Kak ${crew.fullName}, koordinasi jadwal Altara Studio Wedding Organizer.`
                  )}`;

                  return (
                    <tr
                      key={crew.userId}
                      className="hover:bg-stone-50/50 transition-colors"
                    >
                      {/* Name & Initials Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-700 font-bold text-xs border border-stone-200">
                            {getInitials(crew.fullName)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-stone-900 truncate">
                              {crew.fullName}
                            </span>
                            <span className="text-xs text-stone-500 truncate flex items-center gap-1">
                              <Mail className="h-3 w-3 text-stone-400" />
                              {crew.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* System Role */}
                      <td className="py-3.5 px-4">
                        {getRoleBadge(crew.role)}
                      </td>

                      {/* Contact & WA */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-stone-700">
                            {crew.phone}
                          </span>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-7 w-7 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            title="Chat WhatsApp"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Assignments */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-stone-700">
                            <Briefcase className="h-3.5 w-3.5 text-stone-400" />
                            <span className="font-semibold text-stone-900">
                              {crew.totalAssignments}
                            </span>{" "}
                            penugasan pernikahan
                          </div>
                          {crew.upcomingAssignments.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {crew.upcomingAssignments.map((a, i) => (
                                <Link
                                  key={i}
                                  href={`/projects/${a.projectId}/squad`}
                                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors border border-stone-200/60"
                                >
                                  <Calendar className="h-3 w-3 text-stone-400" />
                                  <span className="font-medium truncate max-w-[140px]">
                                    {a.projectName}
                                  </span>
                                  <span className="text-stone-400 font-mono">
                                    ({a.eventDate})
                                  </span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-right">
                        {crew.isActive ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Aktif
                          </span>
                        ) : (
                          <span className="text-xs text-stone-400">
                            Nonaktif
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
