# Cetak Biru Desain Antarmuka (UI/UX Specifications)
## Single-Tenant Wedding Organizer System (Next.js, Tailwind CSS & Shadcn UI)

Dokumen ini mendefinisikan standar desain visual, tata letak antarmuka, pola interaksi (UX patterns), dan spesifikasi komponen sistem Wedding Organizer berdasarkan [userpersona.md](file:///D:/PROJECT/WO/userpersona.md), [requirements.md](file:///D:/PROJECT/WO/requirements.md), [architecture.md](file:///D:/PROJECT/WO/architecture.md), [workflows.md](file:///D:/PROJECT/WO/workflows.md), dan adopsi pola desain dari **Sprig CRM (Code and Chill)**.

---

## 1. Adopsi Desain Token & Gaya Visual (Inspirasi Sprig CRM)

Sistem mengadopsi estetika *calm, dense, keyboard-friendly, and highly structured* khas Sprig CRM yang disesuaikan dengan ekosistem komponen **Shadcn UI** dan **Tailwind CSS**.

### 1.1 Shell & Layout Tokens
- **Collapsible Sidebar (Desktop):**
  - Lebar penuh: `w-64` (256px), lebar ciut: `w-16` (64px) dengan animasi transisi `transition-all duration-300 ease-in-out`.
  - Menggunakan komponen `Sidebar` / `Collapsible` Shadcn dengan indikator menu aktif berupa *sliding pill* berlatar `bg-primary/10 text-primary font-medium`.
  - Bagian atas memuat *Workspace Switcher* statis instansi WO internal (`Fernhill Wedding Studio`) dan tombol ciutkan (`SideCollapseButton`).
  - Bagian bawah memuat *User Profile Pill* (`Avatar`, Nama, Role Badge) dan status penyimpanan cloud vault.
- **Top Bar & Global Command Palette (⌘K):**
  - Bar navigasi atas berketinggian `h-14` (56px) dengan border bawah halus (`border-b border-border/40`).
  - Dilengkapi input pencarian global instan yang memicu modal `CommandDialog` (⌘K) untuk lompat cepat ke nama pengantin, jadwal TM vendor, atau daftar kru.
  - Tombol aksi cepat: Notifikasi lonceng dengan *unread badge dot*, dan tombol *Share Portal Link* pengantin.
- **Transisi Mobile (Bottom Tab Bar):**
  - Pada viewport `< 768px` (`md:hidden`), sidebar desktop disembunyikan total dan digantikan oleh **Bottom Tab Bar** melayang (`h-16 fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border`).
  - Mengakomodasi 4-5 menu operasional ramah jempol (Home, Live Rundown, Logistik, Kontak Darurat, Menu).
- **Slide-Over Sheet (Drawer):**
  - Menggunakan komponen `Sheet` (posisi kanan `side="right"`) dengan lebar `w-full sm:max-w-md lg:max-w-lg` untuk inspeksi dan mutasi detail (edit cue-sheet rundown, slotting vendor, ganti PIC kru) tanpa memutus konteks halaman utama.
- **Warna & Permukaan (CSS Variables Shadcn UI):**
  - Background kanvas utama: Warna netral hangat (`hsl(60, 5%, 96%)` pada tema terang) yang memberikan kesan tenang bagi perencana pernikahan.
  - Kartu & Panel: `bg-card text-card-foreground border border-border/60 rounded-xl shadow-xs`.

---

## 2. Desktop Workspace Layout (Dimas & Sarah - Admin & Planning)

Ruang kerja desktop difokuskan pada manajemen paralel 3 hingga 6 pernikahan sekaligus per akhir pekan.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Topbar: [Logo WO]  |  [🔍 Search Anything (⌘K)]  |  [🔔]  [🔗 Bagikan Portal] [Profil]│
├──────────────┬─────────────────────────────────────────────────────────────────────────┤
│ Sidebar      │ Dashboard / Project View                                                │
│ • Dashboard  │ ┌─────────────────────────────────────────────────────────────────────┐ │
│ • Proyek     │ │ Multi-Event Timeline Grid (Sabtu & Minggu)                          │ │
│   - Bella & K│ │ 08:00  [Akad: Bella & Kevin (Hotel Mulia)] ────── Live Line (Now) ──│ │
│   - Sarah & R│ │ 11:00  [Pemberkatan: Diana & David (Gereja Katedral)]               │ │
│ • Vendor     │ └─────────────────────────────────────────────────────────────────────┘ │
│ • Kru Skuad  │ ┌─────────────────────────────────────────────────────────────────────┐ │
│ • Finansial  │ │ Master Rundown Builder (Dense Table + Cue Sheet + DND Handle)        │ │
│   (Owner)    │ │ [⠿] 08:00 - 09:00 | Akad Nikah | PIC: Sarah | MC Cue: Khidmat | 🟢  │ │
│              │ │ [⠿] 09:00 - 09:30 | Sungkeman  | PIC: Rian  | Audio: Gending  | 🟢  │ │
│              │ └─────────────────────────────────────────────────────────────────────┘ │
└──────────────┴─────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Multi-Event Operational Calendar Grid
- **Pola Desain:** Mengadaptasi tampilan *meetings/calendar* Sprig dengan kolom per hari (Jumat, Sabtu, Minggu) dan slot baris per jam (06:00 - 23:00).
- **Live Time Marker:** Garis aksen merah muda dinamis (`h-0.5 bg-rose-500 relative z-20`) yang menandai waktu saat ini secara real-time melintasi seluruh pernikahan yang sedang berlangsung.
- **Project Block Cards:** Kartu jadwal ber-border warna menurut paket (`border-l-4 border-l-blue-500` untuk Full Planning, `border-l-amber-500` untuk Day-Of) memuat: nama pengantin, venue, lead planner, dan indikator kesiapan vendor.

### 2.2 Master Rundown Builder (Dense Table)
- **Komponen:** Tabel sekuensial padat (`Table`, `TableRow`, `TableCell`) dengan *drag handle icon* (`GripVertical`).
- **Cue Sheet Columns:**
  - Kolom **Waktu:** Badge waktu `08:00 - 09:00 WIB` (`font-mono text-xs`).
  - Kolom **Sesi Acara:** Judul tebal dan deskripsi ringkas prosesi.
  - Kolom **Cue Panggung:** Badge terpisah untuk **Audio/Lagu** (`Headphones`), **Lighting** (`SunMedium`), dan **MC/Keluarga** (`Mic2`).
  - Kolom **PIC Kru:** Avatar inisial kru penanggung jawab.
  - Kolom **Aksi Cepat:** Tombol WhatsApp (`MessageSquareShare`) untuk ping vendor terkait sesi tersebut via `wa.me`.

### 2.3 Wedding Budget Tracker (Tier 1 - Sarah & Dimas)
- **Komponen Ringkasan Plafon:**
  - Kartu Metrik Plafon: Menampilkan total `contract_amount` vs total alokasi di `project_budgets` dengan *Progress Bar* (indikator hijau jika aman, merah jika *over-budget*).
- **Tabel Invoice Vendor:** Daftar tagihan vendor dengan status badge warna (`badge-secondary` untuk PENDING, `badge-default` untuk SETTLED).
- **Header Actions:** Tombol utama `Download Guidebook TM (PDF)` yang langsung memicu endpoint streaming `/api/pdf/guidebook/:projectId`.

### 2.4 Executive Financial View (Tier 2 - Eksklusif Dimas)
- **Metrik Utama (Owner Cards):**
  - Kartu Omzet Bruto: Total nilai kontrak seluruh proyek aktif.
  - Kartu Biaya Modal: Total riil vendor + total honor kru.
  - Kartu Laba Bersih & Margin (%): Ditampilkan dengan penanda tren positif/negatif.
- **Kalkulator Batch Payout Kru:** Tabel daftar honor harian puluhan kru lapangan setiap Minggu malam:
  - Checkbox multi-select, kolom `session_count`, `daily_rate`, `total_payout`.
  - Tombol aksi `Cairkan Honor Terpilih` (`Button variant="default"`) yang memanggil Server Action `executeBatchCrewPayoutAction`.

---

## 3. Mobile PWA Field Mode (Rian - Kru Lapangan di Venue)

Dirancang khusus untuk form factor smartphone (375px - 430px) dengan pengoperasian satu tangan di tengah keramaian acara.

```
┌─────────────────────────────────────────┐
│ ⚡ Offline Mode: Disimpan di Perangkat   │ <- Floating Offline Banner
├─────────────────────────────────────────┤
│ The Wedding of Bella & Kevin            │
│ Gedung Mulia • PIC: Rian (Runner)       │
├─────────────────────────────────────────┤
│ 🔴 NOW RUNNING (08:15)                  │
│ [ Akad Nikah & Ijab Qabul              ]│ <- High Contrast Active Card
│ Lokasi: Meja Utama • Cue: Hening/Doa   │
├─────────────────────────────────────────┤
│ ⏳ UP NEXT (09:00)                      │
│ [ Sungkeman & Sungkem Orang Tua        ]│
├─────────────────────────────────────────┤
│ 💍 KOTAK CINCIN & MAHAR                 │
│ Status: [ Di Meja Akad ] (Ubah Status)  │
├─────────────────────────────────────────┤
│ [📞 Speed-Dial Kontak Darurat 1-Tap]   │
├─────────────────────────────────────────┤
│ [🏠 Home] [📋 Rundown] [📦 Logistik] [📞]│ <- Bottom Tab Bar (44x44px touch)
└─────────────────────────────────────────┘
```

### 3.1 Ergonomi Layar Sentuh & Navigasi
- Seluruh tombol interaksi memiliki dimensi target sentuh minimal **44x44 piksel** (`min-h-[44px] min-w-[44px]`).
- Menggunakan **Bottom Tab Bar fixed** dengan 4 ikon utama:
  1. `Rundown` (`ListOrdered`): Lembar susunan acara menit-per-menit.
  2. `Logistik` (`ShieldCheck`): Checklist barang sakral.
  3. `Kontak` (`PhoneCall`): Speed-dial vendor & keluarga.
  4. `Detail` (`Info`): Info denah & catatan teknis venue.

### 3.2 Live Rundown Cards ("Now Running" & "Up Next")
- **Kartu Sesi Aktif ("Now Running"):**
  - Tampilan ber-border tebal dengan animasi detak halus (`ring-2 ring-primary bg-primary/5`).
  - Indikator waktu berjalan, judul prosesi berhuruf besar, dan catatan MC cue yang langsung terbaca sambil berjalan.
- **Kartu Sesi Berikutnya ("Up Next"):**
  - Berlatar netral dengan countdown menit menuju sesi tersebut, membantu kru mempersiapkan pengantin dan vendor 15 menit sebelum waktu mulai.

### 3.3 Offline Resilience Indicator
- Saat Service Worker mendeteksi koneksi terputus di dalam ballroom/basement, sebuah *floating badge status* muncul di bagian atas layar:
  - `bg-amber-500 text-amber-950 text-xs font-semibold py-1 px-3 rounded-full shadow-md flex items-center gap-1.5`
  - Teks: *"Mode Offline: Data tersimpan di memori perangkat"*.

### 3.4 Quick Speed-Dial Sheet (Slide-Up)
- Sheet geser dari bawah (`Sheet side="bottom"`):
  - Menampilkan daftar kontak darurat terpenting: PIC Katering, PIC Sound, Ayah Pengantin Pria, Ibu Pengantin Wanita.
  - Setiap kontak memiliki 2 tombol cepat besar: **Panggil Telepon** (`tel:...`) dan **Kirim WhatsApp** (`https://wa.me/...`).

### 3.5 Sacred Belongings Tracker Card
- Kartu pelacakan barang krusial (Kotak Cincin Kawin, Buku Nikah, Mahar, Gaun Ganti).
- Dilengkapi tombol toggle status mutasi lokasi fisik:
  `[Belum Diterima] -> [Pegang Kru] -> [Di Meja Akad] -> [Diserahkan ke Keluarga]`.
- Setiap perpindahan status langsung mencatat nama kru pemegang terakhir secara instan.

---

## 4. Public Client View (Bella & Kevin - Portal Pengantin via Token)

Halaman tamu publik yang dibuka melalui tautan WhatsApp (`/portal/[token]`). Dirancang tenang, estetik, dan tanpa distraksi kontrol kantor.

### 4.1 Karakter Visual
- Tipografi judul menggunakan font Serif modern (`font-serif tracking-tight text-3xl`) berpadu dengan body Sans-Serif bersih.
- **Bebas Aksesoris Admin:** Tidak ada sidebar, tidak ada bottom tab bar kru, dan tidak ada formulir login.

### 4.2 Struktur Komponen Portal
1. **Hero Section:**
   - Ilustrasi atau foto cover elegan.
   - Judul: *"The Wedding Celebration of Bella & Kevin"*.
   - Widget Hitung Mundur (*Countdown Widget*): 4 kotak angka elegan (Hari, Jam, Menit, Detik).
2. **Preparation Progress Bar:**
   - Progress bar persentase penyelesaian persiapan pernikahan (contoh: *75% Selesai*).
   - Menampilkan total tugas checklist yang telah dirampungkan tim WO.
3. **Confirmed Vendors Showcase Grid:**
   - Grid kartu 2 kolom pada mobile (`grid grid-cols-1 sm:grid-cols-2 gap-4`).
   - Setiap kartu menampilkan ikon kategori (Gedung, Katering, MUA, Foto), nama vendor resmi, dan badge hijau *"Terkonfirmasi Resmi"*.
   - **Aturan Privasi:** Sama sekali tidak menampilkan nilai kontrak atau nomor kontak pribadi vendor.

---

## 5. Standarisasi State Antarmuka (Feedback & Resilience)

Untuk menjamin pengalaman pengguna yang andal dan konsisten, seluruh antarmuka menerapkan 3 pola state utama:

### 5.1 Loading States (Skeleton Shimmer)
- Menggunakan komponen `Skeleton` Shadcn UI yang meniru struktur konten asli:
  - Pada tabel rundown: Skeleton baris berulang dengan lebar acak pada kolom judul.
  - Pada kartu metrik finansial: Skeleton lingkaran avatar dan balok angka.
- Animasi shimmer halus (`animate-pulse bg-muted rounded-md`).

### 5.2 Empty States
- Diterapkan saat proyek baru dibuat dan belum memiliki item rundown, alokasi kru, atau rekanan vendor:
  - Ikon tematik berukuran besar dengan latar belakang lembut (`w-12 h-12 text-muted-foreground bg-muted/50 rounded-full flex items-center justify-center`).
  - Judul ramah: *"Belum Ada Susunan Acara"* atau *"Kru Belum Dialokasikan"*.
  - Teks panduan dan tombol Call-to-Action utama: `[+ Terapkan Template Prosesi]` atau `[+ Tugaskan Kru]`.

### 5.3 Error Toast Notifications (ActionError Integration)
- Menggunakan komponen `Toaster` Shadcn (`sonner`):
  - **Error Jadwal Bentrok (`CONFLICT_SCHEDULE`):**
    - Toast varian `destructive` dengan ikon `AlertTriangle`.
    - Pesan eksplisit menyebut nama kru dan nama proyek yang bentrok.
  - **Error Validasi (`VALIDATION_ERROR`):**
    - Menampilkan daftar field form yang belum terisi dengan benar.
  - **Notifikasi Sukses:**
    - Toast hijau halus (`toast.success("Rundown berhasil diperbarui")`).
