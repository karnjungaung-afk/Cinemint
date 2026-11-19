"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FilmCard } from "@/components/film-card";
import type { MoviePreview } from "@/types/movie";

const STORAGE_KEY = "cinemint_v2_watchlist";

export function WatchlistPreview({ movies }: { movies: MoviePreview[] }) {
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      try {
        const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
        setSavedSlugs(
          Array.isArray(parsed) && parsed.every((item) => typeof item === "string")
            ? parsed
            : [],
        );
      } catch {
        setSavedSlugs([]);
      }
      setReady(true);
    };

    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("cinemint-watchlist-change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("cinemint-watchlist-change", sync);
    };
  }, []);

  const savedMovies = movies.filter((movie) => savedSlugs.includes(movie.slug));

  if (!ready) {
    return <p className="subpage__notice" role="status">Loading your saved films…</p>;
  }

  if (!savedMovies.length) {
    return (
      <div className="discover-empty">
        <span aria-hidden="true">✳</span>
        <h2>Your collection begins here.</h2>
        <p>Save films from Discover to keep a shortlist in this browser.</p>
        <Link className="button button--mint" href="/discover">Explore films</Link>
      </div>
    );
  }

  return (
    <>
      <div className="discover-result-heading">
        <span>{savedMovies.length} SAVED FILMS</span>
        <span>THIS BROWSER ONLY</span>
      </div>
      <div className="film-grid">
        {savedMovies.map((movie, index) => (
          <FilmCard key={movie.slug} movie={movie} index={index} />
        ))}
      </div>
      <p className="subpage__notice">
        This preview stores your collection in this browser only. It is not linked to an account or synced across devices.
      </p>
    </>
  );
}
