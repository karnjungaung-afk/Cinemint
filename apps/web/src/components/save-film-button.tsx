"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "cinemint_v2_watchlist";

function readSavedSlugs(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) && parsed.every((value) => typeof value === "string")
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function SaveFilmButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(readSavedSlugs().includes(slug));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("cinemint-watchlist-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cinemint-watchlist-change", sync);
    };
  }, [slug]);

  function toggleSaved() {
    const current = readSavedSlugs();
    const next = current.includes(slug)
      ? current.filter((item) => item !== slug)
      : [...current, slug];

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(next.includes(slug));
      window.dispatchEvent(new Event("cinemint-watchlist-change"));
    } catch {
      // The UI remains usable if browser storage is unavailable.
    }
  }

  return (
    <button
      type="button"
      className={`save-film-button${saved ? " is-saved" : ""}`}
      onClick={toggleSaved}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved films" : "Save film to watchlist"}
    >
      <span aria-hidden="true">{saved ? "✓" : "+"}</span>
      {saved ? "Saved" : "Save"}
    </button>
  );
}
