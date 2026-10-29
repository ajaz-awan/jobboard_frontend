"use client";
import { useSyncExternalStore } from "react";
function subscribe(callback: () => void) {
  const sync = (event: StorageEvent) => {
    if (event.key !== "jobboard-theme") return;
    const value = event.newValue;
    document.documentElement.dataset.theme =
      value === "light" || value === "dark"
        ? value
        : matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    callback();
  };
  window.addEventListener("themechange", callback);
  window.addEventListener("storage", sync);
  return () => {
    window.removeEventListener("themechange", callback);
    window.removeEventListener("storage", sync);
  };
}
const current = () =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, current, () => "light");
  return (
    <button
      className="theme-toggle"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      onClick={() => {
        const next = current() === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem("jobboard-theme", next);
        } catch {}
        window.dispatchEvent(new Event("themechange"));
      }}
    >
      <svg
        className="theme-sun"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 1v3m0 16v3M1 12h3m16 0h3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
      </svg>
      <svg
        className="theme-moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden="true"
      >
        <path d="M20.6 14.1A9 9 0 0 1 9.9 3.4 9 9 0 1 0 20.6 14.1Z" />
      </svg>
    </button>
  );
}
