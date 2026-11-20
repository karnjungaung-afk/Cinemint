"use client";

import { useMemo, useState } from "react";
import { FilmCard } from "@/components/film-card";
import type { MoviePreview } from "@/types/movie";

type DiscoverPanelProps = {
  movies: MoviePreview[];
};

export function DiscoverPanel({ movies }: DiscoverPanelProps) {
  const genres = useMemo(
    () => ["All", ...new Set(movies.flatMap((movie) => movie.genres))],
    [movies],
  );
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return movies.filter((movie) => {
      const matchesGenre = genre === "All" || movie.genres.includes(genre);
      const searchable = [
        movie.title,
        movie.originalTitle,
        movie.synopsis,
        ...movie.genres,
      ].join(" ").toLocaleLowerCase();
      return matchesGenre && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [genre, movies, query]);

  return (
    <div>
      <label className="discover-search">
        <span aria-hidden="true">⌕</span>
        <span className="visually-hidden">Search films</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, story, or genre"
          type="search"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear search">×</button>
        )}
      </label>

      <div className="genre-filters" aria-label="Filter by genre">
        {genres.map((item) => (
          <button
            key={item}
            type="button"
            className={`genre-filter${genre === item ? " is-active" : ""}`}
            aria-pressed={genre === item}
            onClick={() => setGenre(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="discover-result-heading">
        <span>{results.length} FILMS IN THIS PREVIEW</span>
        <span>{genre === "All" ? "ALL GENRES" : genre.toUpperCase()}</span>
      </div>

      {results.length > 0 ? (
        <div className="film-grid">
          {results.map((movie, index) => (
            <FilmCard key={movie.slug} movie={movie} index={index} />
          ))}
        </div>
      ) : (
        <div className="discover-empty" role="status">
          <span aria-hidden="true">✳</span>
          <h2>No films found</h2>
          <p>Try another title or choose a different genre.</p>
          <button type="button" className="button button--ghost" onClick={() => { setQuery(""); setGenre("All"); }}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
