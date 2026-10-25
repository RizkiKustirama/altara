/**
 * Helper Sanitasi Nomor Telepon Indonesia & Generator Deep-Link WhatsApp
 * Single-Tenant Wedding Organizer System
 */

/**
 * Membersihkan dan menstandardisasi format nomor handphone lokal Indonesia
 * menjadi format internasional murni tanpa simbol: 628...
 *
 * Contoh:
 * - "081234567890" -> "6281234567890"
 * - "+62 812-3456-7890" -> "6281234567890"
 * - "81234567890" -> "6281234567890"
 * - "6281234567890" -> "6281234567890"
 */
export function sanitizeIndonesianPhone(phoneInput: string): string {
  if (!phoneInput) return "";

  // Hapus semua karakter non-digit
  let cleaned = phoneInput.replace(/\D/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  } else if (cleaned.startsWith("62")) {
    // Format sudah benar
  }

  return cleaned;
}

export interface TechnicalMeetingDraft {
  vendorPicName: string;
  vendorName: string;
  clientNames: string;
  meetingDate: string;
  meetingTime: string;
  venueName: string;
  rawPhone: string;
}

/**
 * Menghasilkan URL WhatsApp (wa.me) dengan pesan undangan Technical Meeting (TM)
 * vendor yang otomatis terisi nama pengantin, tanggal, jam, dan lokasi.
 */
export function generateVendorTmWhatsappUrl(data: TechnicalMeetingDraft): string {
  const phone = sanitizeIndonesianPhone(data.rawPhone);

  const messageText = 
`Halo Kak ${data.vendorPicName} (${data.vendorName}),
Kami dari tim Wedding Organizer ${data.clientNames}.

Berikut adalah undangan Technical Meeting (TM) vendor:
📅 Tanggal: ${data.meetingDate}
⏰ Waktu: ${data.meetingTime} WIB
📍 Lokasi: ${data.venueName}

Mohon konfirmasi kehadirannya. Terima kasih banyak! 🙏`;

  const encodedMessage = encodeURIComponent(messageText);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

export interface PaymentReminderDraft {
  clientName: string;
  milestoneTitle: string;
  amountRupiah: string;
  dueDate: string;
  rawPhone: string;
}

/**
 * Menghasilkan URL WhatsApp untuk pengingat pembayaran termin pengantin atau vendor.
 */
export function generatePaymentReminderWhatsappUrl(data: PaymentReminderDraft): string {
  const phone = sanitizeIndonesianPhone(data.rawPhone);

  const messageText =
`Halo Kak ${data.clientName},
Mengingatkan untuk jadwal pembayaran termin pernikahan:

📌 Termin: ${data.milestoneTitle}
💰 Nominal: Rp ${data.amountRupiah}
🗓️ Jatuh Tempo: ${data.dueDate}

Jika sudah melakukan transfer, mohon kirimkan bukti pembayaran ke kami. Terima kasih! ✨`;

  const encodedMessage = encodeURIComponent(messageText);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

/**
 * Menghasilkan tautan langsung WhatsApp untuk chat cepat dengan vendor
 */
export function generateDirectWhatsappUrl(rawPhone: string, initialText?: string): string {
  const phone = sanitizeIndonesianPhone(rawPhone);
  if (!phone) return "#";
  
  if (initialText) {
    return `https://wa.me/${phone}?text=${encodeURIComponent(initialText)}`;
  }
  return `https://wa.me/${phone}`;
}
