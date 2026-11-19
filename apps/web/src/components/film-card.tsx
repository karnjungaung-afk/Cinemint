import Link from "next/link";
import type { MoviePreview } from "@/types/movie";
import { SaveFilmButton } from "@/components/save-film-button";

type FilmCardProps = {
  movie: MoviePreview;
  index?: number;
};

export function FilmCard({ movie, index }: FilmCardProps) {
  return (
    <article className="film-card">
      <Link className="film-card__link" href={`/movie/${movie.slug}`}>
        <div
          className="film-card__poster"
          role="img"
          aria-label={`Poster artwork for ${movie.title}`}
          style={{
            backgroundImage: `linear-gradient(180deg, transparent 48%, rgba(5, 10, 7, .9) 100%), url("${movie.posterUrl}")`,
          }}
        >
          <span className="film-card__score" aria-label={`CineMint score ${movie.score} out of 100`}>
            <span aria-hidden="true">✳</span> {movie.score}
          </span>
          {typeof index === "number" && (
            <span className="film-card__index">{String(index + 1).padStart(2, "0")}</span>
          )}
          <div className="film-card__meta">
            <span>{movie.year}</span>
            <span className="film-card__dot" aria-hidden="true">·</span>
            <span>{movie.genres[0]}</span>
          </div>
        </div>
        <div className="film-card__body">
          <h3>{movie.title}</h3>
          <p>{movie.editorialNote}</p>
        </div>
      </Link>
      <div className="film-card__actions">
        <SaveFilmButton slug={movie.slug} />
      </div>
    </article>
  );
}
