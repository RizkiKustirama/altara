# Sprint 10: Tier 2A Pencairan Honor Kru & Tier 2B Keuangan Dapur Bisnis Implementation Plan

> **Status:** ✅ COMPLETED (All Tasks 10.1 - 10.5 Verified & Committed)
> **Goal:** Mengamankan dapur bisnis agensi WO, kalkulasi margin laba bersih/kotor proyek (Tier 2B Eksklusif Owner Dimas), serta otomasi perhitungan pencairan honor harian puluhan kru lapangan secara massal (Tier 2A Manajemen Maya & Owner Dimas).

---

## Arsitektur & Spesifikasi

```
Sprint 10: Tier 2A & Tier 2B Keuangan Internal (Maya & Dimas)
├── Task 10.1: Skema Database & Math Engine Margin Finansial [x]
│   ├── src/db/schema/company-finances.ts (Verified existing)
│   ├── src/lib/finance-math.ts
│   └── tests/finance/finance-math.test.ts
├── Task 10.2: Enforce RBAC Guard Tier 2A vs Tier 2B [x]
│   ├── src/lib/auth-guard.ts (assertRole OWNER vs MANAGEMENT)
│   ├── src/schemas/finance-schema.ts
│   ├── src/actions/finance-actions.ts
│   └── tests/finance/finance-rbac.test.ts
├── Task 10.3: Logika Kalkulator Batch Payout Honor Kru (Tier 2A) [x]
│   ├── src/services/payout-service.ts
│   └── tests/finance/finance-rbac.test.ts
├── Task 10.4: Logika Komputasi Profit & Margin Bisnis (Tier 2B - Dimas Only) [x]
│   └── src/services/company-finance-service.ts
└── Task 10.5: Desktop UI: Rekapitulasi Honor Kru & Dasbor Eksekutif Margin Bisnis [x]
    ├── src/app/(admin)/payouts/page.tsx
    ├── src/components/admin/batch-payout-table.tsx
    ├── src/components/admin/record-payout-dialog.tsx
    ├── src/components/admin/payout-header-client.tsx
    ├── src/app/(admin)/finance/margins/page.tsx
    ├── src/components/admin/executive-margin-card.tsx
    ├── src/components/admin/project-profitability-table.tsx
    └── src/components/admin/sidebar.tsx
```

---

## Definition of Done (DoD) Sprint 10
1. **Tier 2A (Maya & Dimas):**
   - Manajemen dapat melihat daftar honor kru berstatus `PENDING` dari seluruh proyek acara akhir pekan.
   - Fitur centang massal (multi-select checkbox) dengan 1 tombol *"Cairkan X Honor Terpilih"* yang mengubah status menjadi `PAID` dan merekam `paidAt`.
2. **Tier 2B (Eksklusif Dimas - Owner):**
   - Dasbor eksekutif `/finance/margins` dilindungi ketat: Hanya role `OWNER` yang boleh mengakses. Percobaan akses oleh `MANAGEMENT` atau `CREW` menghasilkan pesan error `403 FORBIDDEN` / redirect.
   - Menghitung omzet bruto, total modal vendor riil, total beban honor kru, dan laba kotor & persentase margin bersih secara otomatis.
3. Lolos seluruh unit test, `tsc --noEmit` (0 error), dan lolos `npm run build`.
