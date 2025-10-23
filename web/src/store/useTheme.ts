"use client";
import { create } from "zustand";

export type Theme = "dark" | "light" | "system";

type ThemeState = {
  theme: Theme; // user pref
  resolved: "dark" | "light"; // effective theme
  setTheme: (t: Theme) => void;
  init: () => void;
};

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: "dark",
  resolved: "dark",
  setTheme: (t) => {
    try { localStorage.setItem("theme", t); } catch {}
    const resolved = t === "system" ? getSystemTheme() : t;
    set({ theme: t, resolved });
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = resolved;
    }
  },
  init: () => {
    const stored = (typeof window !== "undefined" ? localStorage.getItem("theme") : null) as Theme | null;
    const pref = stored || "dark"; // default dark
    const resolved = pref === "system" ? getSystemTheme() : pref;
    set({ theme: pref, resolved });
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = resolved;
    }
    if (pref === "system" && typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => get().setTheme("system");
      mq.addEventListener("change", onChange);
      // no explicit remove here; page lifetime
    }
  },
}));

