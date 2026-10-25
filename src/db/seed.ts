import * as dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import { db } from "./index";
import {
  users,
  servicePackages,
  eventTemplates,
  templateRundownItems,
  vendors,
  projects,
  projectCrews,
  projectVendors,
  projectRundowns,
  weddingParties,
  projectBudgets,
  vendorInvoices,
  paymentMilestones,
  sacredBelongings,
  projectDocuments,
  companyFinances,
  crewPayouts,
} from "./schema";

export async function runSeed() {
  console.log("🌱 Memulai proses seeding komprehensif Altara Wedding Organizer OS...");

  const saltRounds = 10;
  const defaultPasswordHash = await bcrypt.hash("password123", saltRounds);

  // =========================================================================
  // 0. PEMBERSIHAN DATA TRANSAKSIONAL LAMA (IDEMPOTEN)
  // =========================================================================
  console.log("🧹 Membersihkan data transaksional lama...");
  await db.delete(companyFinances);
  await db.delete(crewPayouts);
  await db.delete(vendorInvoices);
  await db.delete(paymentMilestones);
  await db.delete(projectBudgets);
  await db.delete(sacredBelongings);
  await db.delete(projectDocuments);
  await db.delete(weddingParties);
  await db.delete(projectRundowns);
  await db.delete(projectVendors);
  await db.delete(projectCrews);
  await db.delete(projects);

  // =========================================================================
  // 1. SEED AKUN & DIREKTORI MASTER KRU (users)
  // =========================================================================
  console.log("👉 [1/10] Seeding Master Akun & Tim Skuad (Dimas, Maya, Sarah, Rian, Budi, Dewi, Fajar, Citra)...");

  // Dimas - OWNER
  const [dimas] = await db
    .insert(users)
    .values({
      fullName: "Dimas Pratama",
      email: "dimas@altara.id",
      phone: "081234567890",
      passwordHash: defaultPasswordHash,
      role: "OWNER",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { role: "OWNER", fullName: "Dimas Pratama", passwordHash: defaultPasswordHash, phone: "081234567890" },
    })
    .returning();

  // Maya - MANAGEMENT
  const [maya] = await db
    .insert(users)
    .values({
      fullName: "Maya Anggraini",
      email: "maya@altara.id",
      phone: "081234567899",
      passwordHash: defaultPasswordHash,
      role: "MANAGEMENT",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { role: "MANAGEMENT", fullName: "Maya Anggraini", passwordHash: defaultPasswordHash, phone: "081234567899" },
    })
    .returning();

  // Sarah - CREW (Lead Planner PM Senior)
  const [sarah] = await db
    .insert(users)
    .values({
      fullName: "Sarah Paramita",
      email: "sarah@altara.id",
      phone: "081234567891",
      passwordHash: defaultPasswordHash,
      role: "CREW",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { role: "CREW", fullName: "Sarah Paramita", passwordHash: defaultPasswordHash, phone: "081234567891" },
    })
    .returning();

  // Rian - CREW (Field Ops & LO Bride)
  const [rian] = await db
    .insert(users)
    .values({
      fullName: "Rian Hidayat",
      email: "rian@altara.id",
      phone: "081234567892",
      passwordHash: defaultPasswordHash,
      role: "CREW",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { role: "CREW", fullName: "Rian Hidayat", passwordHash: defaultPasswordHash, phone: "081234567892" },
    })
    .returning();

  // Budi - CREW (LO Groom & Logistik)
  const [budi] = await db
    .insert(users)
    .values({
      fullName: "Budi Santoso",
      email: "budi@altara.id",
      phone: "081234567893",
      passwordHash: defaultPasswordHash,
      role: "CREW",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { role: "CREW", fullName: "Budi Santoso", passwordHash: defaultPasswordHash, phone: "081234567893" },
    })
    .returning();

  // Dewi - CREW (LO Family & VIP Coordinator)
  const [dewi] = await db
    .insert(users)
    .values({
      fullName: "Dewi Lestari",
      email: "dewi@altara.id",
      phone: "081234567894",
      passwordHash: defaultPasswordHash,
      role: "CREW",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { role: "CREW", fullName: "Dewi Lestari", passwordHash: defaultPasswordHash, phone: "081234567894" },
    })
    .returning();

  // Fajar - CREW (Stage Runner & AV Coordinator)
  const [fajar] = await db
    .insert(users)
    .values({
      fullName: "Fajar Ramadhan",
      email: "fajar@altara.id",
      phone: "081234567895",
      passwordHash: defaultPasswordHash,
      role: "CREW",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { role: "CREW", fullName: "Fajar Ramadhan", passwordHash: defaultPasswordHash, phone: "081234567895" },
    })
    .returning();

  // Citra - CREW (Usher & Guest Relations)
  const [citra] = await db
    .insert(users)
    .values({
      fullName: "Citra Kirana",
      email: "citra@altara.id",
      phone: "081234567896",
      passwordHash: defaultPasswordHash,
      role: "CREW",
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { role: "CREW", fullName: "Citra Kirana", passwordHash: defaultPasswordHash, phone: "081234567896" },
    })
    .returning();

  console.log("✅ 8 Akun Tim Altara berhasil di-seed.");

  // =========================================================================
  // 2. SEED PAKET LAYANAN WO (servicePackages)
  // =========================================================================
  console.log("👉 [2/10] Seeding Paket Layanan...");
  const [dayOfPkg] = await db
    .insert(servicePackages)
    .values({
      packageName: "Day-of Wedding Coordination",
      packageType: "DAY_OF_COORDINATION",
      basePrice: "15000000.00",
      includedServices:
        "Koordinasi teknis hari-H, gladi resik H-1, standby 8 jam tim 6 kru, briefing vendor di lokasi, pengawasan alur rundown.",
      excludedServices:
        "Pencarian rekanan vendor awal, negosiasi kontrak harga vendor, penyusunan konsep tema dekorasi.",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [fullPlanningPkg] = await db
    .insert(servicePackages)
    .values({
      packageName: "Full Wedding Planning & Execution",
      packageType: "FULL_PLANNING",
      basePrice: "45000000.00",
      includedServices:
        "Perencanaan menyeluruh H-6 bulan, budgeting & payment scheduling, kurasi rekanan vendor, Technical Meeting & Buku Panduan TM (PDF), koordinasi gladi resik dan full-day execution.",
      excludedServices:
        "Akomodasi & tiket luar kota tanpa addendum kontrak, percetakan undangan fisik, suvenir pribadi.",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  // Helper fallback package ID
  const defaultPackageId = fullPlanningPkg?.id ?? dayOfPkg?.id;

  // =========================================================================
  // 3. SEED TEMPLATE PROSESI ADAT & AGAMA (eventTemplates)
  // =========================================================================
  console.log("👉 [3/10] Seeding Pustaka Template Prosesi...");
  const [sundaTemplate] = await db
    .insert(eventTemplates)
    .values({
      templateName: "Akad Nikah Adat Sunda",
      ceremonyType: "ADAT_SUNDA",
      description:
        "Prosesi pernikahan adat Sunda lengkap: Mapag Penganten, Akad Nikah, Sungkeman, Sawer, dan Huap Lingkup.",
    })
    .onConflictDoNothing()
    .returning();

  if (sundaTemplate) {
    await db
      .insert(templateRundownItems)
      .values([
        {
          templateId: sundaTemplate.id,
          orderIndex: 0,
          startTime: "07:00:00",
          endTime: "08:00:00",
          title: "Persiapan & Final Touch Rias Pengantin",
          description: "MUA standby di kamar pengantin wanita, fotografer shoot detail busana dan cincin.",
          picRole: "LO_BRIDE",
          musicCue: "Instrumental Harpa Romantis",
          lightingCue: "Warm Room Light 100%",
        },
        {
          templateId: sundaTemplate.id,
          orderIndex: 1,
          startTime: "08:00:00",
          endTime: "08:30:00",
          title: "Penyambutan Rombongan Calon Pengantin Pria (Mapag Penganten)",
          description: "Pengalungan melati oleh Ibu CPW kepada CPP, penyerahan seserahan simbolis.",
          picRole: "LO_GROOM",
          musicCue: "Gamelan Degung Panyambung",
          lightingCue: "Entrance Spotlight",
        },
        {
          templateId: sundaTemplate.id,
          orderIndex: 2,
          startTime: "08:30:00",
          endTime: "09:30:00",
          title: "Akad Nikah & Ijab Qabul",
          description: "Khotbah nikah oleh Penghulu KUA, ijab qabul, penandatanganan buku nikah, dan penyerahan mahar.",
          picRole: "LEAD_PLANNER",
          musicCue: "Hening Suasana Khidmat",
          lightingCue: "Table Focus Spotlight",
        },
        {
          templateId: sundaTemplate.id,
          orderIndex: 3,
          startTime: "09:30:00",
          endTime: "10:15:00",
          title: "Upacara Adat Sunda (Sungkeman, Sawer Panganten & Nincak Endog)",
          description: "Sungkeman kepada kedua pasang orang tua, dilanjutkan saweran dan pelepasan burung merpati.",
          picRole: "RUNNER",
          musicCue: "Kacapi Suling Ayun Ambing",
          lightingCue: "Stage Ambient",
        },
        {
          templateId: sundaTemplate.id,
          orderIndex: 4,
          startTime: "10:15:00",
          endTime: "11:00:00",
          title: "Foto Bersama Keluarga Inti & Tamu VIP",
          description: "Sesi foto bertahap dipandu oleh MC dan LO Keluarga.",
          picRole: "LO_FAMILY",
          musicCue: "Acoustic Pop Romance",
          lightingCue: "Photo Flash Support Light",
        },
      ])
      .onConflictDoNothing();
  }

  // =========================================================================
  // 4. SEED MASTER DIREKTORI VENDOR REKANAN (vendors)
  // =========================================================================
  console.log("👉 [4/10] Seeding Master Vendor Rekanan...");
  const [vVenue] = await db
    .insert(vendors)
    .values({
      vendorName: "Grand Ballroom Hotel Mulia",
      category: "VENUE",
      picName: "Robert Setiawan",
      phone: "08111222333",
      email: "banquet@hotelmulia.id",
      address: "Jl. Asia Afrika Senayan, Jakarta Pusat",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [vCatering] = await db
    .insert(vendors)
    .values({
      vendorName: "Mulia Culinary Service",
      category: "CATERING",
      picName: "Chef Gunawan",
      phone: "08119888777",
      email: "catering@hotelmulia.id",
      address: "Senayan, Jakarta Pusat",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [vDecor] = await db
    .insert(vendors)
    .values({
      vendorName: "Stupa Caspea Decor",
      category: "DECORATION",
      picName: "Mia Caspea",
      phone: "08129988112",
      email: "info@stupacaspea.com",
      address: "Jl. Benda No. 12, Kemang, Jakarta Selatan",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [vPhoto] = await db
    .insert(vendors)
    .values({
      vendorName: "Axioo Photography",
      category: "PHOTO_VIDEO",
      picName: "David Soong",
      phone: "08123344556",
      email: "booking@axioo.com",
      address: "Kemang Raya, Jakarta Selatan",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [vMua] = await db
    .insert(vendors)
    .values({
      vendorName: "Anpa Suha Makeup Studio",
      category: "MUA",
      picName: "Anpa Suha",
      phone: "08138877665",
      email: "management@anpasuha.id",
      address: "Menteng, Jakarta Pusat",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  const [vMusic] = await db
    .insert(vendors)
    .values({
      vendorName: "Kahitna Acoustic Session",
      category: "ENTERTAINMENT",
      picName: "Bambang Musisi",
      phone: "08128899001",
      email: "kahitna.mgmt@gmail.com",
      address: "Jakarta Selatan",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

  // =========================================================================
  // 5. SEED PROYEK PERNIKAHAN UTAMA (projects)
  // =========================================================================
  console.log("👉 [5/10] Seeding Proyek Pernikahan (Bella & Kevin, Amanda & Dika, Alisha & Fikri)...");

  // Proyek 1: Flagship Aktif - Bella & Kevin (Sabtu, 14 Nov 2026)
  const [projectBellaKevin] = await db
    .insert(projects)
    .values({
      packageId: fullPlanningPkg?.id ?? defaultPackageId,
      leadPlannerId: sarah.id,
      projectName: "The Wedding of Bella & Kevin",
      clientGroomName: "Kevin Sanjaya",
      clientBrideName: "Bella Clarissa",
      weddingDate: "2026-11-14",
      venueName: "Grand Ballroom Hotel Mulia",
      venueAddress: "Jl. Asia Afrika Senayan, Gelora, Jakarta Pusat",
      contractAmount: "350000000.00",
      publicToken: "bella-kevin-altara-2026",
      status: "PLANNING",
    })
    .returning();

  // Proyek 2: Mendatang - Amanda & Dika (Sabtu, 5 Des 2026)
  const [projectAmandaDika] = await db
    .insert(projects)
    .values({
      packageId: dayOfPkg?.id ?? defaultPackageId,
      leadPlannerId: sarah.id,
      projectName: "The Wedding of Amanda & Dika",
      clientGroomName: "Raditya Dika",
      clientBrideName: "Amanda Raisa",
      weddingDate: "2026-12-05",
      venueName: "Plataran Dharmawangsa",
      venueAddress: "Jl. Dharmawangsa Raya No. 6, Kebayoran Baru, Jakarta Selatan",
      contractAmount: "175000000.00",
      publicToken: "amanda-dika-plataran-2026",
      status: "READY",
    })
    .returning();

  // Proyek 3: Selesai - Alisha & Fikri (Minggu, 18 Okt 2026)
  const [projectAlishaFikri] = await db
    .insert(projects)
    .values({
      packageId: fullPlanningPkg?.id ?? defaultPackageId,
      leadPlannerId: maya.id,
      projectName: "The Wedding of Alisha & Fikri",
      clientGroomName: "Fikri Pratama",
      clientBrideName: "Alisha Zahra",
      weddingDate: "2026-10-18",
      venueName: "Ayana Midplaza Grand Ballroom",
      venueAddress: "Jl. Jend. Sudirman Kav. 10-11, Karet Tengsin, Jakarta Pusat",
      contractAmount: "280000000.00",
      publicToken: "alisha-fikri-ayana-2026",
      status: "COMPLETED",
    })
    .returning();

  console.log("✅ 3 Proyek Pernikahan seeded:", {
    p1: "The Wedding of Bella & Kevin (Token: /portal/bella-kevin-altara-2026)",
    p2: "The Wedding of Amanda & Dika (Token: /portal/amanda-dika-plataran-2026)",
    p3: "The Wedding of Alisha & Fikri (Token: /portal/alisha-fikri-ayana-2026)",
  });

  // =========================================================================
  // 6. SEED PENUGASAN SKUAD KRU & ANTI-BENTROK (projectCrews)
  // =========================================================================
  console.log("👉 [6/10] Seeding Penugasan Skuad Kru Proyek...");

  // Skuad Proyek 1: Bella & Kevin (2026-11-14)
  await db.insert(projectCrews).values([
    {
      projectId: projectBellaKevin.id,
      userId: sarah.id,
      eventDate: "2026-11-14",
      roleInProject: "LEAD_PLANNER",
      shiftStart: "06:00",
      shiftEnd: "23:00",
    },
    {
      projectId: projectBellaKevin.id,
      userId: rian.id,
      eventDate: "2026-11-14",
      roleInProject: "LO_BRIDE",
      shiftStart: "06:00",
      shiftEnd: "15:00",
    },
    {
      projectId: projectBellaKevin.id,
      userId: budi.id,
      eventDate: "2026-11-14",
      roleInProject: "LO_GROOM",
      shiftStart: "06:30",
      shiftEnd: "15:00",
    },
    {
      projectId: projectBellaKevin.id,
      userId: dewi.id,
      eventDate: "2026-11-14",
      roleInProject: "LO_FAMILY",
      shiftStart: "07:00",
      shiftEnd: "16:00",
    },
    {
      projectId: projectBellaKevin.id,
      userId: fajar.id,
      eventDate: "2026-11-14",
      roleInProject: "RUNNER",
      shiftStart: "06:00",
      shiftEnd: "23:00",
    },
    {
      projectId: projectBellaKevin.id,
      userId: citra.id,
      eventDate: "2026-11-14",
      roleInProject: "USHER",
      shiftStart: "08:30",
      shiftEnd: "17:00",
    },
  ]);

  // Skuad Proyek 3: Alisha & Fikri (2026-10-18)
  await db.insert(projectCrews).values([
    {
      projectId: projectAlishaFikri.id,
      userId: maya.id,
      eventDate: "2026-10-18",
      roleInProject: "LEAD_PLANNER",
      shiftStart: "06:00",
      shiftEnd: "22:00",
    },
    {
      projectId: projectAlishaFikri.id,
      userId: rian.id,
      eventDate: "2026-10-18",
      roleInProject: "LO_BRIDE",
      shiftStart: "06:00",
      shiftEnd: "15:00",
    },
    {
      projectId: projectAlishaFikri.id,
      userId: budi.id,
      eventDate: "2026-10-18",
      roleInProject: "RUNNER",
      shiftStart: "06:30",
      shiftEnd: "18:00",
    },
    {
      projectId: projectAlishaFikri.id,
      userId: dewi.id,
      eventDate: "2026-10-18",
      roleInProject: "LO_FAMILY",
      shiftStart: "07:00",
      shiftEnd: "16:00",
    },
  ]);

  // =========================================================================
  // 7. SEED SLOTTING VENDOR REKANAN (projectVendors)
  // =========================================================================
  console.log("👉 [7/10] Seeding Slotting Vendor Proyek Bella & Kevin...");
  const [pvVenue] = await db
    .insert(projectVendors)
    .values({
      projectId: projectBellaKevin.id,
      vendorId: vVenue.id,
      category: "VENUE",
      contractStatus: "SETTLED",
      notes: "Grand Ballroom 1, 2, 3 full day AC & Karpet Merah",
    })
    .returning();

  const [pvCatering] = await db
    .insert(projectVendors)
    .values({
      projectId: projectBellaKevin.id,
      vendorId: vCatering.id,
      category: "CATERING",
      contractStatus: "BOOKED",
      notes: "Buffet 800 porsi + 6 food stall gubukan premium",
    })
    .returning();

  const [pvDecor] = await db
    .insert(projectVendors)
    .values({
      projectId: projectBellaKevin.id,
      vendorId: vDecor.id,
      category: "DECORATION",
      contractStatus: "DP_PAID",
      notes: "Konsep Modern Botanical Pastel + Gazebo Akad Kaca",
    })
    .returning();

  const [pvPhoto] = await db
    .insert(projectVendors)
    .values({
      projectId: projectBellaKevin.id,
      vendorId: vPhoto.id,
      category: "PHOTO_VIDEO",
      contractStatus: "SETTLED",
      notes: "2 Fotografer + 2 Videografer + Live Teaser Edit",
    })
    .returning();

  const [pvMua] = await db
    .insert(projectVendors)
    .values({
      projectId: projectBellaKevin.id,
      vendorId: vMua.id,
      category: "MUA",
      contractStatus: "BOOKED",
      notes: "Rias Pengantin Akad, Resepsi, + 2 Ibu Pengantin",
    })
    .returning();

  const [pvMusic] = await db
    .insert(projectVendors)
    .values({
      projectId: projectBellaKevin.id,
      vendorId: vMusic.id,
      category: "ENTERTAINMENT",
      contractStatus: "DP_PAID",
      notes: "8 Musisi Akustik Full Band + 2 Penyanyi",
    })
    .returning();

  // =========================================================================
  // 8. SEED RUNDOWN ACARA CUE-SHEET & KELUARGA (projectRundowns & weddingParties)
  // =========================================================================
  console.log("👉 [8/10] Seeding Rundown Cue-Sheet & Direktori Keluarga VIP...");

  await db.insert(projectRundowns).values([
    {
      projectId: projectBellaKevin.id,
      orderIndex: 0,
      startTime: "06:00:00",
      endTime: "08:00:00",
      title: "Persiapan & Rias Pengantin (Akad)",
      description: "MUA standby di Ruang Holding Pengantin Lt. 2. Fotografer shoot flatlay cincin & gaun.",
      picRole: "LO_BRIDE",
      musicCue: "Acoustic Harpa Santai",
      lightingCue: "Warm Room Light 100%",
      status: "COMPLETED",
    },
    {
      projectId: projectBellaKevin.id,
      orderIndex: 1,
      startTime: "08:00:00",
      endTime: "08:30:00",
      title: "Penyambutan Keluarga CPP (Mapag Penganten)",
      description: "Ibu CPW mengalungkan ronce melati kepada CPP. Penyerahan simbolis seserahan.",
      picRole: "LO_GROOM",
      musicCue: "Gamelan Degung Khidmat",
      lightingCue: "Entrance Corridor Spotlight",
      status: "COMPLETED",
    },
    {
      projectId: projectBellaKevin.id,
      orderIndex: 2,
      startTime: "08:30:00",
      endTime: "09:30:00",
      title: "Akad Nikah & Ijab Qabul",
      description: "Pembacaan ayat suci Al-Qur'an, khotbah nikah Penghulu KUA Senayan, ijab kabul, dan penyerahan mahar.",
      picRole: "LEAD_PLANNER",
      musicCue: "Hening Suasana Khidmat",
      lightingCue: "Table Focus Spotlight",
      status: "IN_PROGRESS",
    },
    {
      projectId: projectBellaKevin.id,
      orderIndex: 3,
      startTime: "09:30:00",
      endTime: "10:15:00",
      title: "Upacara Adat Sunda & Sungkeman",
      description: "Sungkeman ke kedua orang tua, Sawer Panganten, Meleum Harupat, dan Nincak Endog.",
      picRole: "RUNNER",
      musicCue: "Kacapi Suling Ayun Ambing",
      lightingCue: "Stage Ambient Warm",
      status: "PENDING",
    },
    {
      projectId: projectBellaKevin.id,
      orderIndex: 4,
      startTime: "10:15:00",
      endTime: "11:30:00",
      title: "Resepsi Siang & Ramah Tamah",
      description: "Pengantin memasuki pelaminan, pembukaan oleh MC Dery, santap prasmanan diiringi live acoustic Kahitna.",
      picRole: "USHER",
      musicCue: "Kahitna - Cantik (Acoustic)",
      lightingCue: "Ballroom Grand Wash Pastel",
      status: "PENDING",
    },
    {
      projectId: projectBellaKevin.id,
      orderIndex: 5,
      startTime: "11:30:00",
      endTime: "12:30:00",
      title: "Sesi Foto VIP & Keluarga Besar",
      description: "Sesi foto bergantian per keluarga dan tamu VIP diarahkan LO Keluarga.",
      picRole: "LO_FAMILY",
      musicCue: "Pop Romance Hits",
      lightingCue: "Photo Flash Support 100%",
      status: "PENDING",
    },
    {
      projectId: projectBellaKevin.id,
      orderIndex: 6,
      startTime: "12:30:00",
      endTime: "13:00:00",
      title: "Closing & Pengembalian Barang Berharga",
      description: "Serah terima kotak cincin dan mahar ke perwakilan keluarga inti oleh Rian & Budi.",
      picRole: "LEAD_PLANNER",
      musicCue: "Upbeat Romance Outro",
      lightingCue: "Dim Soft 50%",
      status: "PENDING",
    },
  ]);

  // Direktori Keluarga Inti & VIP
  await db.insert(weddingParties).values([
    {
      projectId: projectBellaKevin.id,
      name: "Bambang Soedarmono",
      relationship: "AYAH_CPW",
      phone: "081234567801",
      ceremonialRole: "Wali Nikah & Ijab Kabul",
      notes: "Duduk di sebelah kanan meja penghulu",
    },
    {
      projectId: projectBellaKevin.id,
      name: "Hj. Endang Rahayu",
      relationship: "IBU_CPW",
      phone: "081234567802",
      ceremonialRole: "Pendamping Mempelai Wanita",
      notes: "Mengenai kebaya brokat sage green",
    },
    {
      projectId: projectBellaKevin.id,
      name: "H. Suryo Sanjaya",
      relationship: "AYAH_CPP",
      phone: "081234567803",
      ceremonialRole: "Pendamping Mempelai Pria",
      notes: "Jas beskap formal",
    },
    {
      projectId: projectBellaKevin.id,
      name: "Hj. Ratih Sanjaya",
      relationship: "IBU_CPP",
      phone: "081234567804",
      ceremonialRole: "Pendamping Mempelai Pria",
      notes: "Mengenakan kebaya senada keluarga pria",
    },
    {
      projectId: projectBellaKevin.id,
      name: "Ir. H. Gunawan Wibisono",
      relationship: "SAKSI_NIKAH_CPW",
      phone: "08119888999",
      ceremonialRole: "Saksi Nikah Pihak Wanita",
      notes: "Hadir H-30 menit di ruang holding VIP",
    },
    {
      projectId: projectBellaKevin.id,
      name: "Prof. Dr. Hendra Wijaya",
      relationship: "SAKSI_NIKAH_CPP",
      phone: "08118777666",
      ceremonialRole: "Saksi Nikah Pihak Pria",
      notes: "Duduk di sebelah kiri meja penghulu",
    },
  ]);

  // =========================================================================
  // 9. SEED TIER 1 BUJET OPERASIONAL, INVOICE & TERMIN KLIEN (operational-budgets)
  // =========================================================================
  console.log("👉 [9/10] Seeding Tier 1 Bujet Acara, Invoice Vendor, dan Termin Klien...");

  // Alokasi Bujet Proyek (Total Rp 350.000.000)
  await db.insert(projectBudgets).values([
    {
      projectId: projectBellaKevin.id,
      category: "VENUE",
      allocatedAmount: "95000000.00",
      notes: "Plafon sewa Ballroom Hotel Mulia",
    },
    {
      projectId: projectBellaKevin.id,
      category: "CATERING",
      allocatedAmount: "120000000.00",
      notes: "Plafon 800 pax + food stall",
    },
    {
      projectId: projectBellaKevin.id,
      category: "DECORATION",
      allocatedAmount: "55000000.00",
      notes: "Plafon dekorasi pelaminan & photobooth",
    },
    {
      projectId: projectBellaKevin.id,
      category: "PHOTO_VIDEO",
      allocatedAmount: "35000000.00",
      notes: "Plafon dokumentasi foto & sinematik",
    },
    {
      projectId: projectBellaKevin.id,
      category: "MUA",
      allocatedAmount: "20000000.00",
      notes: "Plafon tata rias dan hair-do pengantin",
    },
    {
      projectId: projectBellaKevin.id,
      category: "ENTERTAINMENT",
      allocatedAmount: "15000000.00",
      notes: "Plafon live acoustic session",
    },
    {
      projectId: projectBellaKevin.id,
      category: "OTHER",
      allocatedAmount: "10000000.00",
      notes: "Dana tak terduga & suvenir VIP",
    },
  ]);

  // Tagihan Invoice Vendor Rekanan
  await db.insert(vendorInvoices).values([
    {
      projectVendorId: pvVenue.id,
      invoiceNumber: "INV/MULIA/2026/089",
      totalAmount: "95000000.00",
      dueDate: "2026-10-01",
      status: "PAID",
      invoiceFileUrl: "/invoices/inv-mulia-venue.pdf",
    },
    {
      projectVendorId: pvCatering.id,
      invoiceNumber: "INV/CAT/MULIA/2026/142",
      totalAmount: "120000000.00",
      dueDate: "2026-11-01",
      status: "PENDING",
      invoiceFileUrl: "/invoices/inv-catering-mulia.pdf",
    },
    {
      projectVendorId: pvDecor.id,
      invoiceNumber: "INV/STUPA/2026/110",
      totalAmount: "55000000.00",
      dueDate: "2026-11-05",
      status: "PENDING",
      invoiceFileUrl: "/invoices/inv-stupa-decor.pdf",
    },
    {
      projectVendorId: pvPhoto.id,
      invoiceNumber: "INV/AXIOO/2026/033",
      totalAmount: "35000000.00",
      dueDate: "2026-10-15",
      status: "PAID",
      invoiceFileUrl: "/invoices/inv-axioo-photo.pdf",
    },
  ]);

  // Termin Pembayaran Klien
  await db.insert(paymentMilestones).values([
    {
      projectId: projectBellaKevin.id,
      title: "DP 1 (Booking Fee & Lock Tanggal)",
      amount: "105000000.00", // 30%
      dueDate: "2026-05-10",
      paidDate: "2026-05-09",
      status: "PAID",
      proofFileUrl: "/proofs/bca-dp1-kevin.jpg",
    },
    {
      projectId: projectBellaKevin.id,
      title: "DP 2 (Penguncian Rekanan Vendor)",
      amount: "140000000.00", // 40%
      dueDate: "2026-08-20",
      paidDate: "2026-08-19",
      status: "PAID",
      proofFileUrl: "/proofs/mandiri-dp2-kevin.jpg",
    },
    {
      projectId: projectBellaKevin.id,
      title: "Termin Pelunasan (H-14 Acara)",
      amount: "105000000.00", // 30%
      dueDate: "2026-10-31",
      status: "PENDING",
    },
  ]);

  // =========================================================================
  // 10. SEED LOGISTIK SAKRAL, DOKUMEN, TIER 2A PAYOUT & TIER 2B MARGIN DAPUR
  // =========================================================================
  console.log("👉 [10/10] Seeding Logistik Sakral, Dokumen Vault, Tier 2A Payout Kru & Tier 2B Margin Bisnis...");

  // Barang Sakral Hari-H
  await db.insert(sacredBelongings).values([
    {
      projectId: projectBellaKevin.id,
      itemName: "Kotak Cincin Kawin Berlian",
      currentLocation: "Ruang Holding Pengantin Lt. 2 (Kamar 802)",
      currentHolderId: rian.id,
      status: "WITH_CREW",
      notes: "2 buah cincin berlian emas putih di dalam kotak beludru merah maroon.",
    },
    {
      projectId: projectBellaKevin.id,
      itemName: "Logam Mulia Mahar 50 Gram",
      currentLocation: "Meja Registrasi / Brankas Panitia",
      currentHolderId: budi.id,
      status: "WITH_CREW",
      notes: "Sertifikat Antam tersimpan rapi di dalam pigura akrilik emas.",
    },
    {
      projectId: projectBellaKevin.id,
      itemName: "Gaun Ganti Resepsi Sesi 2",
      currentLocation: "Ruang Wardrobe Ballroom",
      currentHolderId: dewi.id,
      status: "AT_STAGE",
      notes: "Gaun sequin silver dengan hanger pelindung khusus.",
    },
  ]);

  // Brankas Dokumen Proyek
  await db.insert(projectDocuments).values([
    {
      projectId: projectBellaKevin.id,
      title: "Layout Denah Grand Ballroom & Meja VIP",
      category: "LAYOUT_VENUE",
      fileUrl: "/docs/hotel-mulia-ballroom-layout.pdf",
      fileType: "application/pdf",
      fileSize: "2450000",
      uploadedBy: sarah.id,
    },
    {
      projectId: projectBellaKevin.id,
      title: "Surat Disposisi & Rekomendasi KUA Senayan",
      category: "PERMIT",
      fileUrl: "/docs/kua-senayan-permit.pdf",
      fileType: "application/pdf",
      fileSize: "1200000",
      uploadedBy: sarah.id,
    },
    {
      projectId: projectBellaKevin.id,
      title: "Moodboard Konsep Dekorasi Pastel",
      category: "DESIGN_MOODBOARD",
      fileUrl: "/docs/stupa-caspea-moodboard.pdf",
      fileType: "application/pdf",
      fileSize: "5800000",
      uploadedBy: maya.id,
    },
  ]);

  // Tier 2A: Honor Kru Mingguan (crewPayouts)
  // Payouts untuk acara yang baru selesai (Alisha & Fikri - 18 Okt 2026): Berstatus PAID
  await db.insert(crewPayouts).values([
    {
      projectId: projectAlishaFikri.id,
      userId: maya.id,
      dailyRate: "1500000.00",
      sessionCount: "1.0",
      totalPayout: "1500000.00",
      payoutStatus: "PAID",
      paidAt: new Date("2026-10-19T10:00:00Z"),
      notes: "Honor Lead Planner Acara Alisha & Fikri",
    },
    {
      projectId: projectAlishaFikri.id,
      userId: rian.id,
      dailyRate: "750000.00",
      sessionCount: "1.0",
      totalPayout: "750000.00",
      payoutStatus: "PAID",
      paidAt: new Date("2026-10-19T10:00:00Z"),
      notes: "Honor LO Bride Acara Alisha & Fikri",
    },
    {
      projectId: projectAlishaFikri.id,
      userId: budi.id,
      dailyRate: "600000.00",
      sessionCount: "1.0",
      totalPayout: "600000.00",
      payoutStatus: "PAID",
      paidAt: new Date("2026-10-19T10:00:00Z"),
      notes: "Honor Runner Acara Alisha & Fikri",
    },
    {
      projectId: projectAlishaFikri.id,
      userId: dewi.id,
      dailyRate: "600000.00",
      sessionCount: "1.0",
      totalPayout: "600000.00",
      payoutStatus: "PAID",
      paidAt: new Date("2026-10-19T10:00:00Z"),
      notes: "Honor LO Family Acara Alisha & Fikri",
    },
  ]);

  // Payouts untuk acara Bella & Kevin: Berstatus PENDING (siap dicairkan secara massal oleh Maya di /payouts!)
  await db.insert(crewPayouts).values([
    {
      projectId: projectBellaKevin.id,
      userId: sarah.id,
      dailyRate: "1500000.00",
      sessionCount: "1.0",
      totalPayout: "1500000.00",
      payoutStatus: "PENDING",
      notes: "Honor Lead Planner Acara Bella & Kevin",
    },
    {
      projectId: projectBellaKevin.id,
      userId: rian.id,
      dailyRate: "750000.00",
      sessionCount: "1.0",
      totalPayout: "750000.00",
      payoutStatus: "PENDING",
      notes: "Honor LO Bride Acara Bella & Kevin",
    },
    {
      projectId: projectBellaKevin.id,
      userId: budi.id,
      dailyRate: "600000.00",
      sessionCount: "1.0",
      totalPayout: "600000.00",
      payoutStatus: "PENDING",
      notes: "Honor LO Groom Acara Bella & Kevin",
    },
    {
      projectId: projectBellaKevin.id,
      userId: dewi.id,
      dailyRate: "600000.00",
      sessionCount: "1.0",
      totalPayout: "600000.00",
      payoutStatus: "PENDING",
      notes: "Honor LO Family Acara Bella & Kevin",
    },
    {
      projectId: projectBellaKevin.id,
      userId: fajar.id,
      dailyRate: "600000.00",
      sessionCount: "1.0",
      totalPayout: "600000.00",
      payoutStatus: "PENDING",
      notes: "Honor Runner Acara Bella & Kevin",
    },
    {
      projectId: projectBellaKevin.id,
      userId: citra.id,
      dailyRate: "500000.00",
      sessionCount: "1.0",
      totalPayout: "500000.00",
      payoutStatus: "PENDING",
      notes: "Honor Usher Acara Bella & Kevin",
    },
  ]);

  // Tier 2B: Keuangan Dapur Bisnis Eksekutif (Dimas Only)
  // Proyek Bella & Kevin
  await db.insert(companyFinances).values({
    projectId: projectBellaKevin.id,
    grossContractPrice: "350000000.00",
    vendorRealCost: "265000000.00", // Modal vendor rekanan riil
    crewTotalExpense: "4550000.00",  // Total pengeluaran honor kru
    netProfitMargin: "22.98",        // Laba bersih Rp 80.450.000 (22.98%)
    notes: "Paket Full Planning premium. Margin aman di atas batas bawah 20%.",
  });

  // Proyek Alisha & Fikri
  await db.insert(companyFinances).values({
    projectId: projectAlishaFikri.id,
    grossContractPrice: "280000000.00",
    vendorRealCost: "210000000.00",
    crewTotalExpense: "3450000.00",
    netProfitMargin: "23.77",        // Laba bersih Rp 66.550.000 (23.77%)
    notes: "Acara sukses dan pelunasan vendor selesai.",
  });

  console.log("🎉 SELURUH DATA DUMMY ALTARA WEDDING ORGANIZER OS BERHASIL DI-SEED DENGAN LENGKAP!");
  console.log("----------------------------------------------------------------------------------");
  console.log("🔑 Kredensial Login Demo (Password semua akun: password123):");
  console.log("   • Owner: dimas@altara.id");
  console.log("   • Manajemen: maya@altara.id");
  console.log("   • Lead Planner (PM): sarah@altara.id");
  console.log("   • Kru Lapangan: rian@altara.id");
  console.log("🌐 Portal Publik Klien: /portal/bella-kevin-altara-2026");
  console.log("📱 Mobile PWA Hari-H: /field/" + projectBellaKevin.id);
  console.log("💰 Honor Kru Mingguan: /payouts");
  console.log("📊 Margin Dapur Bisnis: /finance/margins");
  console.log("----------------------------------------------------------------------------------");
}

// Eksekusi jika dijalankan langsung via CLI
if (process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js")) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seeding gagal:", err);
      process.exit(1);
    });
}
