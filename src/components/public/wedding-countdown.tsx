"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Heart } from "lucide-react";

interface WeddingCountdownProps {
  targetTimestamp: number;
  weddingDateFormatted: string;
}

export function WeddingCountdown({
  targetTimestamp,
  weddingDateFormatted,
}: WeddingCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    function calculate() {
      const now = Date.now();
      const diff = targetTimestamp - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  if (timeLeft.isPast) {
    return (
      <div className="rounded-3xl bg-stone-900 text-stone-100 p-6 text-center border border-amber-500/30 shadow-xl">
        <Sparkles className="h-8 w-8 text-amber-400 mx-auto mb-2 animate-bounce" />
        <h3 className="text-xl font-serif font-bold text-amber-300">
          Hari Bahagia Telah Tiba!
        </h3>
        <p className="text-xs text-stone-300 mt-1">
          Selamat menempuh hidup baru yang penuh berkah dan kebahagiaan.
        </p>
      </div>
    );
  }

  const units = [
    { label: "HARI", value: timeLeft.days },
    { label: "JAM", value: timeLeft.hours },
    { label: "MENIT", value: timeLeft.minutes },
    { label: "DETIK", value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2 text-xs font-serif italic text-amber-800 tracking-wider mb-3">
        <Heart className="h-3.5 w-3.5 fill-amber-700 text-amber-700" />
        <span>Menuju Hari Pernikahan • {weddingDateFormatted}</span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full max-w-md">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center justify-center rounded-2xl bg-white/90 border border-stone-200/90 py-3.5 px-2 shadow-xs backdrop-blur-xs transition-transform hover:-translate-y-0.5"
          >
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 leading-none">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[10px] font-sans font-bold tracking-widest text-stone-400 mt-1.5 uppercase">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
