# Sprint 8: Mobile PWA Field Mode & Logistik Sakral Implementation Plan

> **Status:** ✅ COMPLETED (All 6 Tasks Verified & Committed)
> **Goal:** Membangun aplikasi mobile ramah jempol (touch targets $\ge 44\text{ px}$) dengan Service Worker offline-caching untuk kru lapangan hari-H (Rian Koordinator Lapangan, Sarah, Dimas, Kru), live rundown cards ("Now Running" & "Up Next"), pelacak barang sakral (cincin, mahar, buku nikah), quick speed-dial sheet untuk kontak darurat/vendor, serta offline connection banner.

---

## Arsitektur & Spesifikasi

```
Sprint 8: Mobile PWA Field Mode & Logistik Sakral (Rian & Crew)
├── Task 8.1: Setup Manifest PWA & Service Worker Offline Caching
│   ├── public/manifest.json
│   ├── public/sw.js
│   ├── src/components/mobile/pwa-register.tsx
│   └── public/icons/ (icon-192.png, icon-512.png metadata)
├── Task 8.2: Shell Layout Mobile & Bottom Tab Bar (Ergonomic >= 44px)
│   ├── src/app/(mobile)/layout.tsx
│   ├── src/app/(mobile)/field/[projectId]/layout.tsx
│   └── src/components/mobile/bottom-tab-bar.tsx
├── Task 8.3: UI Live Rundown Cards ("Now Running" & "Up Next")
│   ├── src/app/(mobile)/field/[projectId]/rundown/page.tsx
│   ├── src/components/mobile/live-rundown-card.tsx
│   └── src/components/mobile/rundown-status-toggle.tsx
├── Task 8.4: Pelacak Logistik Barang Sakral (Sacred Belongings Tracker)
│   ├── src/schemas/logistics-schema.ts
│   ├── src/services/logistics-service.ts
│   ├── src/actions/logistics-actions.ts
│   ├── src/app/(mobile)/field/[projectId]/logistics/page.tsx
│   └── src/components/mobile/sacred-item-card.tsx
├── Task 8.5: Slide-Up Quick Speed-Dial Sheet & Emergency Contacts
│   ├── src/app/(mobile)/field/[projectId]/contacts/page.tsx
│   └── src/components/mobile/emergency-dial-sheet.tsx
└── Task 8.6: Indikator Status Koneksi Offline (Network Observer)
    └── src/components/mobile/offline-banner.tsx
```

---

## Definition of Done (DoD) Sprint 8
1. **Manifest PWA & Offline Caching:**
   - `manifest.json` terkonfigurasi dengan `standalone`, warna tema (#1c1917), dan ikon web app.
   - Service worker aktif (`sw.js`), meng-cache app shell dan aset statis, serta menyediakan cache-fallback saat jaringan offline.
2. **Mobile Layout & Bottom Bar:**
   - Navigasi 4 tab bawah (Ringkasan/Home, Rundown Hari-H, Logistik Sakral, Kontak Cepat) dengan target sentuh $\ge 44\text{ px}$ dan safe-area support.
3. **Live Rundown ("Now Running" & "Up Next"):**
   - Menampilkan sesi yang sedang berlangsung dengan penanda visual tegas (pulsing badge, countdown durasi tersisa), serta sesi berikutnya.
   - Kru berwenang dapat memperbarui status rundown secara langsung dari ponsel.
4. **Pelacak Barang Sakral (Sacred Belongings):**
   - Kru (Rian dkk.) dapat melihat status dan memperbarui lokasi serta pemegang barang sakral (kotak cincin, mahar, gaun ganti) melalui 4 tahapan status: `NOT_RECEIVED` -> `WITH_CREW` -> `AT_STAGE` -> `RETURNED_TO_FAMILY`.
5. **Quick Speed-Dial & Kontak Darurat:**
   - Menampilkan kontak vendor penting (Katering, Sound, Dekorasi, MC) dan keluarga pengantin dengan 1-tap call (`tel:`) dan 1-tap WhatsApp (`wa.me`).
6. **Indikator Offline:**
   - Banner terapung amber muncul secara halus saat perangkat kehilangan koneksi internet dan beralih ke data lokal.
7. **Kualitas & Keamanan:**
   - Lolos seluruh unit test (`tsx --test`), `tsc --noEmit` (0 error), dan lolos `npm run build`.
