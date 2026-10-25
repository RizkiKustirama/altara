export interface GuidebookProjectInfo {
  id: string;
  projectName: string;
  weddingDate: string; // "2026-10-24"
  venueName: string;
  leadPlannerName?: string | null;
  leadPlannerPhone?: string | null;
}

export interface GuidebookVendorItem {
  category: string;
  vendorName: string;
  picName: string;
  phone: string;
  contractStatus: string;
  notes?: string | null;
}

export interface GuidebookFamilyMember {
  name: string;
  relationship: string;
  phone?: string | null;
  ceremonialRole?: string | null;
  notes?: string | null;
}

export interface GuidebookRundownItem {
  orderIndex: number;
  timeRange: string; // "08:30 - 09:30"
  durationMinutes: number; // 60
  title: string;
  description?: string | null;
  picRole?: string | null;
  musicCue?: string | null;
  lightingCue?: string | null;
}

/**
 * Clean, sanitized DTO specifically for printing / sharing with vendors during Technical Meeting.
 * Guaranteed to have zero sensitive business financials (gross margin, real cost, internal payouts).
 */
export interface GuidebookTMDTO {
  generatedAt: string;
  project: GuidebookProjectInfo;
  familyMembers: GuidebookFamilyMember[];
  vendors: GuidebookVendorItem[];
  rundownItems: GuidebookRundownItem[];
}
