import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk - Altara Wedding Studio",
  description: "Portal Akses Sistem Operasional Internal Altara",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
