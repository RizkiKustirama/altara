import React from "react";
import { OfflineBanner } from "@/components/mobile/offline-banner";

export default function MobileRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 antialiased selection:bg-amber-500 selection:text-stone-950">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-stone-900 shadow-2xl">
        <OfflineBanner />
        <main className="flex-1 pb-20">{children}</main>
      </div>
    </div>
  );
}
