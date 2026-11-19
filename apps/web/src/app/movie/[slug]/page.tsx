import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { movies, getMovieBySlug } from "@/data/movies";

type MoviePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return movies.map((movie) => ({ slug: movie.slug }));
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { slug } = await params;
  const movie = getMovieBySlug(slug);

  if (!movie) {
    return { title: "Movie not found" };
  }

  return {
    title: movie.title,
    description: movie.synopsis,
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { slug } = await params;
  const movie = getMovieBySlug(slug);

  if (!movie) notFound();

  return (
    <main>
      <section
        className="detail-hero"
        style={{ backgroundImage: `url("${movie.backdropUrl}")` }}
        role="img"
        aria-label={`Backdrop for ${movie.title}`}
      >
        <div className="page-container detail-hero__inner">
          <div
            className="detail-poster"
            role="img"
            aria-label={`Poster for ${movie.title}`}
            style={{ backgroundImage: `url("${movie.posterUrl}")` }}
          />
          <div className="detail-copy">
            <p className="eyebrow">CINEMINT FILM PROFILE</p>
            <h1>{movie.title}</h1>
            <div className="detail-copy__meta">
              <span>{movie.year}</span>
              <span>{movie.runtime}</span>
              <span>{movie.genres.join(" · ")}</span>
            </div>
            <p className="detail-copy__description">{movie.synopsis}</p>
            <Link className="text-link" href="/discover">← Back to discovery</Link>
          </div>
        </div>
      </section>

      <section className="page-container detail-content">
        <div>
          <p className="eyebrow">EDITORIAL NOTE</p>
          <h2>A little more context.</h2>
          <p>{movie.editorialNote}</p>
          <div className="subpage__notice">
            This is a V2 design preview. Full reviews, score explanations, cast data,
            trailers, and verified external ratings will be migrated in later phases.
          </div>
        </div>
        <aside className="detail-score-panel">
          <span>CINEMINT SCORE</span>
          <strong>{movie.score}<small>/100</small></strong>
          <span>Stored V1 sample score</span>
        </aside>
      </section>
    </main>
  );
}
