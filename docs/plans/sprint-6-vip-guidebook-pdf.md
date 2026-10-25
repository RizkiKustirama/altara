# Sprint 6: Direktori Keluarga/VIP & Generator PDF Guidebook TM Implementation Plan

> **Status:** ✅ COMPLETED (All tasks 6.1 - 6.5 implemented, tested, and verified)
> **Goal:** Mengelola susunan keluarga inti/saksi nikah/VIP pengantin, agregator data Buku Panduan Acara (Guidebook TM) bebas dari data biaya finansial sensitif, template PDF siap cetak `@react-pdf/renderer`, streaming route handler `GET /api/pdf/guidebook/[projectId]`, serta tombol 1-klik unduh Guidebook TM di header susunan acara.

---

## Arsitektur & Spesifikasi

```
Sprint 6: Direktori Keluarga/VIP & Generator PDF Guidebook TM
├── Task 6.1: Service & Server Actions Direktori Keluarga Inti & VIP
│   ├── src/schemas/wedding-party-schema.ts
│   ├── src/services/wedding-party-service.ts
│   └── src/actions/wedding-party-actions.ts (+ tests)
├── Task 6.2: Service Agregator Data Guidebook TM (Bebas Biaya Sensitif)
│   ├── src/types/guidebook-dto.ts
│   └── src/services/pdf-aggregator-service.ts (+ tests)
├── Task 6.3: Template PDF Komponen @react-pdf/renderer
│   ├── src/components/pdf/pdf-styles.ts
│   └── src/components/pdf/guidebook-template.tsx
├── Task 6.4: Route Handler Streaming Dokumen PDF
│   └── src/app/api/pdf/guidebook/[projectId]/route.ts
└── Task 6.5: Desktop UI: Manajemen Keluarga & Tombol Download Guidebook PDF
    ├── src/components/admin/family-member-dialog.tsx
    ├── src/components/admin/family-directory-drawer.tsx
    └── Integrasi Download Button ke src/components/admin/project-rundown-client.tsx
```

---

## Definition of Done (DoD) Sprint 6
1. Lead Planner / Manajemen dapat mendata keluarga inti, saksi nikah dari pihak pria dan wanita, dan kontak darurat keluarga.
2. Agregator Guidebook TM mengekstraksi data proyek, venue, vendor yang berstatus `BOOKED`/`DP_PAID`/`SETTLED`, daftar keluarga, dan susunan rundown cue-sheet.
3. Seluruh nominal biaya / tarif honor vendor dihilangkan 100% dari DTO Guidebook TM demi kerahasiaan bisnis.
4. Mengklik tombol *"Download Guidebook TM (PDF)"* mengunduh file PDF yang terformat rapi (Cover, Kontak Keluarga, Pemetaan Vendor, Cue Sheet Rundown) siap dicetak untuk Technical Meeting.
5. Lolos uji unit test, typecheck `tsc --noEmit`, dan lolos production build `npm run build`.
