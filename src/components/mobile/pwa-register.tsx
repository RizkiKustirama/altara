"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log(
              "[Altara PWA] Service Worker registered successfully with scope:",
              registration.scope
            );
          })
          .catch((error) => {
            console.warn("[Altara PWA] Service Worker registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}
