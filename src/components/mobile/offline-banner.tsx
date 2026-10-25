"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (showReconnected) {
    return (
      <aside
        aria-live="polite"
        className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md animate-in slide-in-from-top duration-200"
      >
        <Wifi className="h-3.5 w-3.5" />
        <span>Koneksi tersambung kembali. Data telah tersinkronisasi.</span>
      </aside>
    );
  }

  if (!isOnline) {
    return (
      <aside
        aria-live="assertive"
        className="sticky top-0 z-50 flex items-center justify-between gap-3 bg-amber-600 px-4 py-2 text-xs font-semibold text-stone-950 shadow-md animate-in slide-in-from-top duration-200"
      >
        <div className="flex items-center gap-2">
          <WifiOff className="h-4 w-4 shrink-0 animate-pulse" />
          <span>Mode Offline: Sinyal hilang. Membaca dari memori lokal.</span>
        </div>
        <span className="rounded bg-stone-950/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
          Tersimpan
        </span>
      </aside>
    );
  }

  return null;
}
