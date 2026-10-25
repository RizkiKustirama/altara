/**
 * Public Client Wedding Portal DTO (Bella & Kevin)
 *
 * KRITIS: Zero Financial & Personal Leak Guarantee.
 * DTO ini dapat diakses oleh publik tanpa login melalui public token unik.
 * DILARANG menyertakan:
 * 1. Nominal bujet / kontrak / laba kotor kantor (Tier 1 & Tier 2B)
 * 2. Nomor telepon personal PIC kru / vendor (anti-spam / anti-doxing)
 * 3. Catatan internal / confidential wedding planner notes
 */

export interface PublicConfirmedVendorDTO {
  category: string;
  vendorName: string;
  status: string; // "CONFIRMED" | "BOOKED" | "SETTLED"
}

export interface PublicRundownHighlightDTO {
  orderIndex: number;
  startTime: string; // "08:00"
  endTime: string;   // "09:00"
  title: string;
}

export interface PublicPortalDTO {
  projectName: string;
  clientGroomName: string;
  clientBrideName: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string | null;
  leadPlannerName: string | null;
  status: string;

  // Real-time Countdown Target
  weddingDateTimestamp: number;

  // Preparation Progress
  preparationProgress: {
    totalMilestones: number;
    completedMilestones: number;
    percentage: number;
  };

  // Curated Vendor Partners
  confirmedVendors: PublicConfirmedVendorDTO[];

  // Event Day Rundown Highlights (Only Titles & Time, no confidential cues)
  rundownHighlights: PublicRundownHighlightDTO[];
}
