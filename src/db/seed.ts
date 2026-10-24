import bcrypt from "bcryptjs";
import { db } from "./index";
import {
  users,
  servicePackages,
  eventTemplates,
  templateRundownItems,
  vendors,
} from "./schema";

export async function runSeed() {
  console.log("🌱 Memulai proses seeding basis data Altara...");

  const saltRounds = 10;
  const defaultPasswordHash = await bcrypt.hash("password123", saltRounds);

  // 1. Seed Default Users
  console.log("👉 Seeding default users (Dimas, Sarah, Rian)...");
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
    .onConflictDoNothing()
    .returning();

  const [sarah] = await db
    .insert(users)
    .values({
      fullName: "Sarah Paramita",
      email: "sarah@altara.id",
      phone: "081234567891",
      passwordHash: defaultPasswordHash,
      role: "PLANNER",
      isActive: true,
    })
    .onConflictDoNothing()
    .returning();

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
    .onConflictDoNothing()
    .returning();

  console.log("✅ Users seeded:", {
    owner: dimas?.email ?? "dimas@altara.id (existing)",
    planner: sarah?.email ?? "sarah@altara.id (existing)",
    crew: rian?.email ?? "rian@altara.id (existing)",
  });

  // 2. Seed Service Packages
  console.log("👉 Seeding paket layanan (Day-of & Full Planning)...");
  await db
    .insert(servicePackages)
    .values([
      {
        packageName: "Day-of Wedding Coordination",
        packageType: "DAY_OF_COORDINATION",
        basePrice: "15000000.00",
        includedServices:
          "Koordinasi teknis hari-H, pendampingan gladi resik, standby tim 8 jam, briefing vendor di lokasi, pengawasan alur rundown.",
        excludedServices:
          "Pencarian vendor dari awal, negosiasi kontrak harga vendor, penyusunan konsep tema dekorasi, fitting baju pengiring.",
        isActive: true,
      },
      {
        packageName: "Full Wedding Planning & Execution",
        packageType: "FULL_PLANNING",
        basePrice: "45000000.00",
        includedServices:
          "Perencanaan menyeluruh H-6 bulan, budgeting & payment scheduling, kurasi rekanan vendor, pembuatan materi Technical Meeting & Buku Panduan TM (PDF), koordinasi gladi resik dan full-day execution.",
        excludedServices:
          "Akomodasi & tiket luar kota tanpa addendum kontrak, biaya percetakan undangan fisik, souvenir pribadi.",
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  // 3. Seed Event Templates
  console.log("👉 Seeding pustaka template prosesi adat & agama...");
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

  // 4. Seed Master Vendors Rekanan
  console.log("👉 Seeding master vendor rekanan...");
  await db
    .insert(vendors)
    .values([
      {
        vendorName: "Grand Ballroom Hotel Mulia",
        category: "VENUE",
        picName: "Robert Setiawan",
        phone: "08111222333",
        email: "banquet@hotelmulia.id",
        address: "Jl. Asia Afrika Senayan, Jakarta",
        isActive: true,
      },
      {
        vendorName: "Mulia Culinary Service",
        category: "CATERING",
        picName: "Chef Gunawan",
        phone: "08119888777",
        email: "catering@hotelmulia.id",
        address: "Senayan, Jakarta",
        isActive: true,
      },
      {
        vendorName: "Axioo Photography",
        category: "PHOTO_VIDEO",
        picName: "David Soong",
        phone: "08123344556",
        email: "booking@axioo.com",
        address: "Kemang, Jakarta Selatan",
        isActive: true,
      },
      {
        vendorName: "Stupa Caspea Decor",
        category: "DECORATION",
        picName: "Mia Caspea",
        phone: "08129988112",
        email: "info@stupacaspea.com",
        address: "Jakarta Selatan",
        isActive: true,
      },
      {
        vendorName: "Anpa Suha Makeup",
        category: "MUA",
        picName: "Anpa Suha",
        phone: "08138877665",
        email: "management@anpasuha.id",
        address: "Jakarta",
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  console.log("🎉 Seeding basis data Altara selesai dengan sukses!");
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
