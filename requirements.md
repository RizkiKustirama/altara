# Software Requirements Specification (SRS) - Sistem Manajemen Wedding Organizer (WO)

Dokumen ini merupakan hasil konsolidasi analisis persona dari [userpersona.md](file:///D:/PROJECT/WO/userpersona.md) dan revisi penyelarasan teknis dari [revisipersona.md](file:///D:/PROJECT/WO/revisipersona.md).

---

## 1. Persona & Profil Pengguna

| Persona | Peran | Platform Utama | Tanggung Jawab & Pain Points |
| :--- | :--- | :--- | :--- |
| **Dimas (34)** | Owner & Lead Planner | Desktop / Web | Menjaga reputasi, validasi kru anti-bentrok, profit margin, kalkulasi honor puluhan kru, batas cakupan paket (scope creep). |
| **Sarah (27)** | Project Manager / Planner | Desktop / Tablet | Mengelola 3-4 pengantin, susun rundown & guidebook TM tanpa buat dari nol, timeline mundur H-6 bulan, koordinasi vendor & keluarga. |
| **Rian (23)** | Kru Lapangan (LO & Runner) | Mobile Smartphone | Eksekusi Hari-H, rundown interaktif cepat & offline-friendly, pelacakan barang sakral (cincin, mahar), kontak darurat instan. |
| **Bella & Kevin (26/28)** | Pasangan Pengantin (Klien) | Mobile Web (Shared Link) | Akses status persiapan pernikahan tanpa login/download aplikasi, countdown Hari-H, daftar vendor terkonfirmasi resmi. |

---

## 2. Kebutuhan Fungsional (Functional Requirements)

### Modul 1: Manajemen Proyek, Skuad & Validasi Anti-Bentrok (Core Ops)
- **FR-1.1 (Validasi Anti-Bentrok Real-time):** Sistem memvalidasi ketersediaan staf/kru saat dialokasikan ke suatu proyek pada tanggal & jam yang sama. Jika terjadi jadwal ganda, sistem menampilkan *hard blocking error*.
- **FR-1.2 (Manajemen Tim & Skuad Proyek):** Pengelompokan tim (Lead Planner, LO Pengantin, LO Keluarga, Runner) per proyek pernikahan.
- **FR-1.3 (Multi-Event Operational Calendar):** Kalender operasional yang memantau penanganan 3 hingga 6 pernikahan sekaligus per akhir pekan.

### Modul 2: Vendor Management & Slotting
- **FR-2.1 (Katalog Rekanan Vendor):** Direktori master rekanan vendor (MUA, Dekorasi, Katering, Foto/Video, Sound & Lighting, Venue, MC).
- **FR-2.2 (Slotting Vendor ke Proyek):** Penugasan vendor ke slot kebutuhan proyek beserta pelacakan status transaksi (*Inquiry, DP Terbayar, Pelunasan*).
- **FR-2.3 (WhatsApp Quick Action):** Integrasi pesan instan satu-klik (`wa.me`) dengan template otomatis untuk koordinasi TM dan verifikasi teknis dengan vendor.

### Modul 3: Workflow Perencanaan, Rundown & Document Vault (Sarah)
- **FR-3.1 (Pustaka Master Template Prosesi):** Template alur prosesi adat (Sunda, Jawa, Batak, dsb.) dan agama (Akad, Holy Matrimony, Resepsi) yang siap diduplikasi.
- **FR-3.2 (Reverse Timeline & Checklist H-6 Bulan):** Generator jadwal mundur otomatis berbasis tanggal Hari-H lengkap dengan to-do list terstruktur.
- **FR-3.3 (Direktori Keluarga, Saksi Nikah & VIP):** Pencatatan kontak, peran seremonial, dan nomor kontak darurat keluarga inti.
- **FR-3.4 (Master Rundown & Automated PDF Guidebook TM):** Penyusunan rundown menit-per-menit (cue sheet audio/lighting) yang dapat di-generate menjadi Buku Panduan TM format PDF sekali klik.
- **FR-3.5 (Project Document Vault):** Repositori penyimpanan dokumen teknis proyek (denah/layout venue, surat perizinan/KUA/Gereja, aturan teknis listrik gedung, dan lampiran kontrak).

### Modul 4: Eksekusi Lapangan & Logistik Hari-H (Rian)
- **FR-4.1 (Mobile Interactive Rundown):** Tampilan rundown dinamis di ponsel yang ringan, cepat, dan dilengkapi penanda fase acara aktif (*Now & Next*).
- **FR-4.2 (Sacred Item Logistics Tracker):** Checklist pelacakan barang krusial (kotak cincin kawin, mahar/seserahan, gaun ganti) mencatat posisi fisik barang, pemegang barang, dan status serah terima.
- **FR-4.3 (Speed-Dial Kontak Darurat):** Direktori telepon cepat 1-tap call/WA untuk menghubungi PIC vendor, koordinator keluarga, dan venue manager.

### Modul 5: Client Portal / Guest Access (Bella & Kevin)
- **FR-5.1 (Tokenized Public Link / Magic Link):** Akses portal status persiapan pengantin melalui URL unik ber-token aman tanpa proses sign up atau instalasi aplikasi.
- **FR-5.2 (Client Progress Dashboard):** Tampilan persentase kemajuan persiapan, hitung mundur Hari-H, dan daftar vendor yang telah terkonfirmasi resmi (*locked-in*).

### Modul 6: Finansial, Paket Layanan & Honor Kru (Dimas)
- **FR-6.1 (Katalog Paket Layanan & Scope / SOW):** Rincian item pekerjaan yang termasuk (*included*) dan tidak termasuk (*excluded*) untuk mencegah perselisihan scope creep.
- **FR-6.2 (Kalkulator Honor Kru Harian):** Otomatisasi perhitungan honor staf lapangan berdasarkan peran dan sesi kerja dengan fitur rekapitulasi pembayaran massal.
- **FR-6.3 (Dasbor Finansial & Margin Bisnis):** Pemantauan omzet, pengeluaran vendor, pembayaran kru, serta margin laba kotor per proyek.

---

## 3. Batasan Akses & Privasi Keuangan (RBAC Matrix)

| Informasi / Fitur | Owner (Dimas) | Planner (Sarah) | Kru Lapangan (Rian) | Klien (Bella & Kevin) |
| :--- | :---: | :---: | :---: | :---: |
| Kalender & Alokasi Kru | Full Akses | Full Akses | View Only (Jadwal Sendiri) | Tidak Ada |
| Rundown & Data Vendor | Full Akses | Full Akses | View Only (Tanpa Biaya) | View Only (Vendor Terkunci) |
| Checklist Barang Sakral | Full Akses | Full Akses | Full Akses (Update Status) | Tidak Ada |
| Status Bayar Vendor/Klien | Full Akses | **View Status Only** *(Lunas/Belum)* | Tidak Ada | View Status Pribadi |
| **Nilai Margin & Laba Bersih** | **Full Akses (Eksklusif)** | **Dilarang** | **Dilarang** | **Dilarang** |
| **Tarif Honor Kru Harian** | **Full Akses (Eksklusif)** | **Dilarang** | **Dilarang** | **Dilarang** |

---

## 4. Matriks Keterlacakan Kebutuhan & Prioritas Fase

| Fitur Utama | Dimas | Sarah | Rian | Bella & Kevin | Prioritas & Target Rilis |
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

---

## 5. Ringkasan Roadmap Pengembangan

1. **Fase 1 - Core Planning Engine & Anti-Conflict (MVP)**
   - Fokus: Operasional inti Dimas & Sarah agar tim kantor bisa menjadwalkan kru tanpa bentrok, menyusun rundown dengan template adat, memetakan vendor, dan mencetak Guidebook TM (PDF).
2. **Fase 2 - Field Mobility, Client Portal & Financial Automation**
   - Fokus: PWA rundown lapangan offline-friendly dan pelacak cincin/mahar untuk Rian, public tokenized URL untuk Bella & Kevin, document vault proyek, serta kalkulator honor kru & margin profit privat Dimas.
