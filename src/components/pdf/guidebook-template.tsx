import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./pdf-styles";
import type { GuidebookTMDTO } from "@/types/guidebook-dto";

interface GuidebookDocumentProps {
  data: GuidebookTMDTO;
}

export function GuidebookDocument({ data }: GuidebookDocumentProps) {
  const { project, familyMembers, vendors, rundownItems, generatedAt } = data;

  const formattedGenerated = new Date(generatedAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document title={`Guidebook TM - ${project.projectName}`} author="Altara Wedding Organizer">
      {/* ----------------- COVER PAGE ----------------- */}
      <Page size="A4" style={styles.coverPage}>
        {/* Cover Header */}
        <View style={styles.coverHeader}>
          <View>
            <Text style={styles.brandTitle}>ALTARA</Text>
            <Text style={styles.brandSubtitle}>Wedding Organizer & Management</Text>
          </View>
          <View style={styles.docTypeBadge}>
            <Text style={styles.docTypeText}>Buku Panduan Technical Meeting</Text>
          </View>
        </View>

        {/* Cover Body */}
        <View style={styles.coverBody}>
          <Text style={styles.projectLabel}>Susunan Panduan Acara Pernikahan</Text>
          <Text style={styles.projectName}>{project.projectName}</Text>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Tanggal Pernikahan</Text>
              <Text style={styles.metaValue}>{project.weddingDate}</Text>
            </View>

            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Lokasi Venue</Text>
              <Text style={styles.metaValue}>{project.venueName}</Text>
            </View>

            {project.leadPlannerName && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Project Lead / PM</Text>
                <Text style={styles.metaValue}>
                  {project.leadPlannerName} {project.leadPlannerPhone ? `(${project.leadPlannerPhone})` : ""}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Cover Footer */}
        <View style={styles.coverFooter}>
          <Text style={styles.confidentialNotice}>
            Dokumen resmi koordinasi lapangan. Dilarang menggandakan tanpa izin tim Altara.
          </Text>
          <Text style={styles.confidentialNotice}>Dicetak pada: {formattedGenerated}</Text>
        </View>
      </Page>

      {/* ----------------- PAGE 2: DIREKTORI KELUARGA & VENDOR ----------------- */}
      <Page size="A4" style={styles.page}>
        {/* Section 1: Direktori Keluarga & Saksi Nikah */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>1. Direktori Keluarga Inti & Saksi Nikah</Text>
          <Text style={styles.sectionSub}>Kontak penting koordinasi seremonial</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: "30%" }]}>Nama Anggota</Text>
            <Text style={[styles.th, { width: "25%" }]}>Hubungan</Text>
            <Text style={[styles.th, { width: "25%" }]}>Peran Seremonial</Text>
            <Text style={[styles.th, { width: "20%" }]}>Kontak Darurat</Text>
          </View>

          {familyMembers.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.tdMuted, { width: "100%", textAlign: "center", paddingVertical: 4 }]}>
                Belum ada data keluarga atau saksi nikah yang didaftarkan.
              </Text>
            </View>
          ) : (
            familyMembers.map((fam, idx) => (
              <View
                key={idx}
                style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <View style={{ width: "30%" }}>
                  <Text style={styles.tdBold}>{fam.name}</Text>
                  {fam.notes && <Text style={styles.tdMuted}>{fam.notes}</Text>}
                </View>
                <Text style={[styles.td, { width: "25%" }]}>{fam.relationship.replace(/_/g, " ")}</Text>
                <Text style={[styles.td, { width: "25%" }]}>{fam.ceremonialRole || "-"}</Text>
                <Text style={[styles.td, { width: "20%" }]}>{fam.phone || "-"}</Text>
              </View>
            ))
          )}
        </View>

        {/* Section 2: Pemetaan Rekanan Vendor Terpasang */}
        <View style={[styles.sectionHeader, { marginTop: 12 }]}>
          <Text style={styles.sectionTitle}>2. Pemetaan Rekanan Vendor Resmi</Text>
          <Text style={styles.sectionSub}>Daftar vendor yang bertugas di lokasi</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: "25%" }]}>Kategori</Text>
            <Text style={[styles.th, { width: "30%" }]}>Nama Vendor</Text>
            <Text style={[styles.th, { width: "25%" }]}>Nama PIC</Text>
            <Text style={[styles.th, { width: "20%" }]}>No. Kontak</Text>
          </View>

          {vendors.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.tdMuted, { width: "100%", textAlign: "center", paddingVertical: 4 }]}>
                Belum ada rekanan vendor yang dipetakan pada proyek ini.
              </Text>
            </View>
          ) : (
            vendors.map((v, idx) => (
              <View
                key={idx}
                style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={[styles.tdBold, { width: "25%" }]}>{v.category}</Text>
                <View style={{ width: "30%" }}>
                  <Text style={styles.tdBold}>{v.vendorName}</Text>
                  {v.notes && <Text style={styles.tdMuted}>{v.notes}</Text>}
                </View>
                <Text style={[styles.td, { width: "25%" }]}>{v.picName}</Text>
                <Text style={[styles.td, { width: "20%" }]}>{v.phone}</Text>
              </View>
            ))
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Altara Wedding Organizer — {project.projectName}</Text>
          <Text render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`} />
        </View>
      </Page>

      {/* ----------------- PAGE 3+: SUSUNAN ACARA (CUE SHEET) ----------------- */}
      <Page size="A4" style={styles.page}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>3. Susunan Acara & Petunjuk Teknis (Cue Sheet)</Text>
          <Text style={styles.sectionSub}>Jadwal menit-per-menit seluruh sesi</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.th, { width: "6%" }]}>No</Text>
            <Text style={[styles.th, { width: "18%" }]}>Waktu</Text>
            <Text style={[styles.th, { width: "36%" }]}>Sesi & Deskripsi Acara</Text>
            <Text style={[styles.th, { width: "16%" }]}>PIC Kru</Text>
            <Text style={[styles.th, { width: "24%" }]}>Cue Sheet (Audio & Lampu)</Text>
          </View>

          {rundownItems.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.tdMuted, { width: "100%", textAlign: "center", paddingVertical: 6 }]}>
                Belum ada susunan acara yang dibuat.
              </Text>
            </View>
          ) : (
            rundownItems.map((r, idx) => (
              <View
                key={idx}
                style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
                wrap={false}
              >
                <Text style={[styles.tdBold, { width: "6%" }]}>{r.orderIndex}</Text>
                <View style={{ width: "18%" }}>
                  <Text style={styles.tdBold}>{r.timeRange}</Text>
                  <Text style={styles.tdMuted}>{r.durationMinutes} Menit</Text>
                </View>
                <View style={{ width: "36%" }}>
                  <Text style={styles.tdBold}>{r.title}</Text>
                  {r.description && <Text style={styles.tdMuted}>{r.description}</Text>}
                </View>
                <Text style={[styles.td, { width: "16%" }]}>{r.picRole?.replace(/_/g, " ") || "-"}</Text>
                <View style={[styles.cueBox, { width: "24%" }]}>
                  {r.musicCue && <Text style={styles.musicCue}>Audio: {r.musicCue}</Text>}
                  {r.lightingCue && <Text style={styles.lightingCue}>Lampu: {r.lightingCue}</Text>}
                  {!r.musicCue && !r.lightingCue && <Text style={styles.tdMuted}>-</Text>}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Altara Wedding Organizer — {project.projectName}</Text>
          <Text render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
