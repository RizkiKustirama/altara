"use client";

import { useEffect, useState } from "react";

interface LiveTimeMarkerProps {
  startHour?: number; // default 6 (06:00)
  endHour?: number;   // default 23 (23:00)
}

export function LiveTimeMarker({
  startHour = 6,
  endHour = 23,
}: LiveTimeMarkerProps) {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000); // refresh every 30 seconds
    return () => clearInterval(timer);
  }, []);

  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  // If outside operational window (06:00 - 23:00), don't render or clamp
  if (currentHour < startHour || currentHour > endHour) {
    return null;
  }

  const totalMinutes = (endHour - startHour) * 60;
  const elapsedMinutes = (currentHour - startHour) * 60 + currentMinutes;
  const topPercentage = Math.min(Math.max((elapsedMinutes / totalMinutes) * 100, 0), 100);

  const formattedTime = `${String(currentHour).padStart(2, "0")}:${String(
    currentMinutes
  ).padStart(2, "0")} WIB`;

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none transition-all duration-1000 ease-linear flex items-center"
      style={{ top: `${topPercentage}%` }}
    >
      <div className="relative flex items-center">
        <span className="flex h-3 w-3 items-center justify-center -ml-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
        </span>
        <span className="ml-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-rose-600 text-white shadow-xs">
          LIVE {formattedTime}
        </span>
      </div>
      <div className="h-0.5 bg-rose-500/80 flex-1 ml-1" />
    </div>
  );
}
