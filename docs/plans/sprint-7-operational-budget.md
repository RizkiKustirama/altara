# Sprint 7: Tier 1 Bujet Operasional Acara Implementation Plan

> **Status:** ⏳ IN PROGRESS (Executing Task-by-Task)
> **Goal:** Membangun pelacak bujet pernikahan operasional (Tier 1) antara klien pengantin dan wedding planner, monitoring alokasi per kategori vs plafon kontrak, pelacakan termin pembayaran klien (DP 1, DP 2, Pelunasan) dengan 1-klik WhatsApp payment reminder, pelacakan tagihan invoice vendor rekanan, serta penjagaan ketat batas finansial dapur kantor (zero margin/cost leak).

---

## Arsitektur & Spesifikasi

```
Sprint 7: Tier 1 Bujet Operasional Acara (Sarah PM, Maya, Dimas)
├── Task 7.1: Service & Helper Agregasi Bujet Operasional
│   ├── src/services/budget-service.ts
│   └── tests/budget/budget-service.test.ts
├── Task 7.2: Skema Zod & Server Actions Bujet Operasional
│   ├── src/schemas/budget-schema.ts
│   ├── src/actions/budget-actions.ts
│   └── tests/budget/budget-actions.test.ts
├── Task 7.3: Desktop UI: Wedding Budget Summary Card & Progress Plafon
│   ├── src/components/admin/budget-summary-card.tsx
│   └── src/components/admin/budget-category-table.tsx
└── Task 7.4: Desktop UI: Invoice Rekanan Vendor & Termin Pembayaran Klien
    ├── src/components/admin/vendor-invoice-table.tsx
    ├── src/components/admin/client-milestone-card.tsx
    ├── src/components/admin/budget-item-dialog.tsx
    ├── src/components/admin/vendor-invoice-dialog.tsx
    ├── src/components/admin/client-milestone-dialog.tsx
    ├── src/components/admin/project-budget-client.tsx
    └── src/app/(admin)/projects/[projectId]/budget/page.tsx
```

---

## Definition of Done (DoD) Sprint 7
1. Sarah (Lead Planner), Maya (Manajemen), dan Dimas (Owner) dapat melihat perbandingan plafon kontrak pengantin terhadap alokasi per pos kategori.
2. Terdapat indikator visual progres penggunaan anggaran (hijau = aman di bawah plafon, merah/amber = melebihi plafon alokasi).
3. Termin pembayaran pengantin (DP 1, DP 2, Pelunasan) dapat dicatat, dilacak status jatuh temponya, dan memiliki tombol 1-klik kirim pengingat pembayaran ke nomor WhatsApp pengantin.
4. Tagihan invoice rekanan vendor dapat dicatat per vendor terpasang dan dilacak status pembayarannya (`PENDING`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`).
5. Dapur rahasia laba/margin kantor (Tier 2B) sama sekali tidak terekspos pada halaman ini.
6. Lolos seluruh unit test, `tsc --noEmit`, dan lolos `npm run build`.
