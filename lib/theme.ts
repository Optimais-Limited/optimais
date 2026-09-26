import * as THREE from "three";

export type ThemeMode = "dark" | "light";

export const THEME_KEY = "optimais-theme";
const EVENT = "themechange";

export function getTheme(): ThemeMode {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function setTheme(mode: ThemeMode): void {
  document.documentElement.setAttribute("data-theme", mode);
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    /* storage unavailable (private mode) — theme still applies for this page view */
  }
  window.dispatchEvent(new CustomEvent<ThemeMode>(EVENT, { detail: mode }));
}

/** Notified when the theme changes here or in another tab. Returns an unsubscribe function. */
export function subscribeTheme(callback: (mode: ThemeMode) => void): () => void {
  const onChange = (e: Event) => callback((e as CustomEvent<ThemeMode>).detail);
  const onStorage = (e: StorageEvent) => {
    if (e.key === THEME_KEY && (e.newValue === "light" || e.newValue === "dark")) {
      document.documentElement.setAttribute("data-theme", e.newValue);
      callback(e.newValue);
    }
  };
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Recolors the hero's dotted 3D surface. Dark values are the original hardcoded ones. */
export function applyDotsTheme(scene: THREE.Scene, geometry: THREE.BufferGeometry, mode: ThemeMode): void {
  const attr = geometry.getAttribute("color") as THREE.BufferAttribute;
  const [r, g, b] = mode === "light" ? [0.1, 0.24, 0.38] : [200, 200, 200];
  for (let i = 0; i < attr.count; i++) attr.setXYZ(i, r, g, b);
  attr.needsUpdate = true;
  if (scene.fog) scene.fog.color.setHex(mode === "light" ? 0xf6f1e6 : 0xffffff);
}
