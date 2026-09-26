"use client";

import { useEffect, useState } from "react";
import { getTheme, setTheme, subscribeTheme, type ThemeMode } from "@/lib/theme";

// Both icons are always rendered; CSS shows the right one from <html data-theme>, so the
// server-rendered markup never depends on the (client-only) saved preference.
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    setMode(getTheme());
    return subscribeTheme(setMode);
  }, []);

  const label = mode === "light" ? "Switch to dark mode" : "Switch to light mode";

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      aria-label={label}
      title={label}
      aria-pressed={mode === "light"}
      onClick={() => setTheme(getTheme() === "light" ? "dark" : "light")}
    >
      <svg className="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg className="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </button>
  );
}
