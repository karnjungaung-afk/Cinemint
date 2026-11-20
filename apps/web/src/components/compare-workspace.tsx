"use client";

import { useMemo, useState } from "react";
import type { MoviePreview } from "@/types/movie";

export function CompareWorkspace({ movies }: { movies: MoviePreview[] }) {
  const [leftSlug, setLeftSlug] = useState(movies[0]?.slug ?? "");
  const [rightSlug, setRightSlug] = useState(movies[1]?.slug ?? "");

  const left = useMemo(() => movies.find((movie) => movie.slug === leftSlug), [leftSlug, movies]);
  const right = useMemo(() => movies.find((movie) => movie.slug === rightSlug), [rightSlug, movies]);
  const sameMovie = leftSlug === rightSlug;

  return (
    <section className="compare-workspace">
      <div className="compare-selectors">
        <label>
          <span>FIRST FILM</span>
          <select value={leftSlug} onChange={(event) => setLeftSlug(event.target.value)}>
            {movies.map((movie) => <option key={movie.slug} value={movie.slug}>{movie.title}</option>)}
          </select>
        </label>
        <span className="compare-versus">VS</span>
        <label>
          <span>SECOND FILM</span>
          <select value={rightSlug} onChange={(event) => setRightSlug(event.target.value)}>
            {movies.map((movie) => <option key={movie.slug} value={movie.slug}>{movie.title}</option>)}
          </select>
        </label>
      </div>

      {sameMovie ? (
        <p className="subpage__notice" role="status">Choose two different films to compare them.</p>
      ) : left && right ? (
        <div className="comparison-grid">
          {[left, right].map((movie) => (
            <article className="comparison-panel" key={movie.slug}>
              <div
                className="comparison-panel__poster"
                role="img"
                aria-label={`Poster for ${movie.title}`}
                style={{ backgroundImage: `url("${movie.posterUrl}")` }}
              />
              <p className="eyebrow">{movie.year} · {movie.runtime}</p>
              <h2>{movie.title}</h2>
              <strong className="comparison-score">{movie.score}<small>/100</small></strong>
              <p>{movie.editorialNote}</p>
              <div className="comparison-genres">
                {movie.genres.map((genre) => <span key={genre}>{genre}</span>)}
              </div>
            </article>
          ))}
          <div className="comparison-summary">
            <span className="eyebrow">SCORE DIFFERENCE</span>
            <strong>{Math.abs(left.score - right.score)} points</strong>
            <p>
              These are stored CineMint preview scores. A higher score is not a guarantee that a film will better fit your personal taste.
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
