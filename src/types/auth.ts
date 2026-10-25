export type GlobalRole = "OWNER" | "MANAGEMENT" | "CREW";

export interface UserSession {
  userId: string;
  email: string;
  fullName: string;
  role: GlobalRole;
  expiresAt: number; // Unix timestamp in milliseconds
}
