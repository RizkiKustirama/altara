export type GlobalRole = "OWNER" | "PLANNER" | "CREW";

export interface UserSession {
  userId: string;
  email: string;
  fullName: string;
  role: GlobalRole;
  expiresAt: number; // Unix timestamp in milliseconds
}
