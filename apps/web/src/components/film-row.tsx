import Link from "next/link";
import type { MoviePreview } from "@/types/movie";
import { FilmCard } from "@/components/film-card";

type FilmRowProps = {
  title: string;
  description: string;
  movies: MoviePreview[];
  href?: string;
};

export function FilmRow({ title, description, movies, href = "/discover" }: FilmRowProps) {
  return (
    <section className="content-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">THE CINE MINT EDIT</p>
          <h2>{title}</h2>
          <p className="section-heading__description">{description}</p>
        </div>
        <Link className="text-link" href={href}>Explore all <span aria-hidden="true">↗</span></Link>
      </div>
      <div className="film-grid">
        {movies.map((movie, index) => (
          <FilmCard key={movie.slug} movie={movie} index={index} />
        ))}
      </div>
    </section>
  );
}
