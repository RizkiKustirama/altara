# 4 Celah / Inkonsistensi yang Perlu Dirapikan Sebelum Masuk ke IDE

Ada beberapa detail teknis yang tercecer atau kontradiktif antara matriks prioritas dan roadmap:

### 1. Modul Vendor Tercecer di Matriks Prioritas (Bagian 4)
- **Kondisi Saat Ini:** Di Bagian 2 (FR-4.1) modul Slotting Vendor Rekanan sudah ditulis, namun di Tabel Matriks Keterlacakan (Bagian 4), fitur ini justru hilang/tidak terdaftar.
- **Dampak ke IDE:** Agent IDE bisa menganggap fitur ini tidak prioritas dan melewatkan pembuatan skema database relasi vendor-ke-proyek (`project_vendors`).
- **Koreksi:** Masukkan kembali Slotting & Katalog Rekanan Vendor ke Matriks Prioritas dengan status **P0 (Critical - Fase 1 - MVP)**.

---

### 2. Modul Document Vault Belum Masuk ke FR
- **Kondisi Saat Ini:** Brankas berkas digital (untuk menyimpan layout teknis venue, aturan daya listrik gedung, surat KUA/Gereja, dan bukti bayar) belum tertulis di daftar FR Bagian 2.
- **Koreksi:** Tambahkan sub-fitur **FR-3.5 (Project Document Vault)** di bawah Modul 3 Perencanaan Sarah.

---

### 3. Kontradiksi antara Label Prioritas (Bagian 4) vs Roadmap (Bagian 5)
Ada ketidaksinkronan antara label prioritas P0/P1 dengan jadwal rilis fase:
- Di Bagian 4 sebelumnya, Client Portal Link dan Checklist Barang Sakral diberi label P0 (Critical), namun di Bagian 5 keduanya baru dijadwalkan di Fase 2.
- Sebaliknya, Reverse Timeline dan Pustaka Template di Bagian 4 diberi label P1, padahal keduanya dijadwalkan di Fase 1.
- **Koreksi:** Sinkronkan label **P0 untuk seluruh fitur Fase 1 (MVP)**, dan **P1 untuk fitur Fase 2**.

---

### 4. Penegasan Batas Privasi Keuangan antara Dimas vs Sarah
- Di bagian NFR sebelumnya tertulis: *"Hanya Role Owner (Dimas) dan Planner (Sarah) yang memiliki akses keuangan."*
- **Koreksi / Perjelas:**
  - **Sarah (Planner):** Hanya boleh melihat **status pembayaran operasional** (apakah klien sudah DP/lunas dan vendor sudah terbayar).
  - **Dimas (Owner):** Memiliki hak eksklusif terhadap **nilai margin laba bersih kantor, nominal omzet total, dan tarif kalkulasi honor kru harian** agar privasi dapur bisnis tetap aman.

---

## Pembaruan Matriks Keterlacakan Kebutuhan

| Fitur Utama | Dimas | Sarah | Rian | Bella & Kevin | Prioritas & Fase |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Mesin Anti-Bentrok Penjadwalan Kru** | ✅ | ✅ | - | - | **P0 (Fase 1 - MVP)** |
| **Katalog Rekanan & Slotting Vendor** | ✅ | ✅ | - | - | **P0 (Fase 1 - MVP)** |
| **Reverse Timeline & Checklist Otomatis** | - | ✅ | - | - | **P0 (Fase 1 - MVP)** |
| **Pustaka Template Prosesi Adat/Agama** | ✅ | ✅ | - | - | **P0 (Fase 1 - MVP)** |
| **Direktori Keluarga, VIP & Saksi Nikah** | - | ✅ | ✅ | - | **P0 (Fase 1 - MVP)** |
| **Master Rundown & PDF Guidebook TM** | - | ✅ | ✅ | - | **P0 (Fase 1 - MVP)** |
| **Integrasi Pesan Pintas WhatsApp (`wa.me`)** | - | ✅ | ✅ | - | **P0 (Fase 1 - MVP)** |
| **Mobile Rundown & Checklist Barang Sakral** | - | - | ✅ | - | **P1 (Fase 2)** |
| **Client Portal Link Tanpa Login (Token URL)** | - | ✅ | - | ✅ | **P1 (Fase 2)** |
| **Katalog Paket Layanan & Scope (SOW)** | ✅ | ✅ | - | - | **P1 (Fase 2)** |
| **Kalkulator Honor Harian & Laba Proyek** | ✅ | - | - | - | **P1 (Fase 2)** |
| **Project Document Vault (Layout & Berkas)** | - | ✅ | ✅ | - | **P1 (Fase 2)** |