# Sprint 9: Portal Pengantin Publik via Token URL Implementation Plan

> **Status:** ✅ COMPLETED (All 3 Tasks Verified & Committed)
> **Goal:** Menyediakan portal status persiapan pernikahan yang dapat dibuka pengantin (Bella & Kevin) langsung dari tautan WhatsApp tanpa proses login atau instalasi aplikasi, dengan proteksi privasi ketat (Zero Financial Leak & zero PIC personal number leaks), anti-brute-force rate limiting, countdown timer real-time, progress bar kesiapan acara, dan katalog vendor terkonfirmasi.

---

## Arsitektur & Spesifikasi

```
Sprint 9: Portal Pengantin Publik via Token URL (Bella & Kevin)
├── Task 9.1: Sanitasi DTO Publik & Query Service
│   ├── src/types/public-portal-dto.ts
│   ├── src/services/public-portal-service.ts
│   └── tests/portal/portal-sanitization.test.ts
├── Task 9.2: Implementasi Rate Limiting Anti-Brute-Force
│   ├── src/lib/rate-limiter.ts
│   └── tests/portal/rate-limiter.test.ts
└── Task 9.3: UI Portal Klien Minimalis & Elegan
    ├── src/components/public/wedding-countdown.tsx
    ├── src/components/public/confirmed-vendors-grid.tsx
    ├── src/components/public/preparation-progress-card.tsx
    └── src/app/(public)/portal/[token]/page.tsx
```

---

## Definition of Done (DoD) Sprint 9
1. Tautan publik `/portal/[token]` dapat diakses tanpa login atau cookie session.
2. Token tidak valid (404) atau request melebihi batas diproteksi oleh rate limiter (max 60 req/min per IP, penalti 15 menit jika 10x 404 berturut-turut).
3. **Zero Financial Leak:** DTO publik sama sekali tidak mengandung nominal uang, harga paket, bujet, margin kantor, maupun termin setoran.
4. **Zero Personal Privacy Leak:** Nomor HP pribadi kru dan nomor HP PIC vendor tidak diekspos ke klien (hanya nama vendor dan kategori).
5. Desain visual bernuansa luxury wedding editorial (Serif typography, clean champagne & stone tones, mobile responsive).
6. Lolos seluruh unit test (`tsx --test`), `tsc --noEmit` (0 error), dan lolos `npm run build`.
