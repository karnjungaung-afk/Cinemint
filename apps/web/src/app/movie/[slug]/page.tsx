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

  if (!movie) return { title: "Movie not found" };

  return {
    title: movie.title,
    description: movie.synopsis,
    openGraph: {
      title: movie.title,
      description: movie.synopsis,
      images: movie.backdropUrl ? [movie.backdropUrl] : [],
    },
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
            <p className="detail-copy__director">DIRECTED BY <strong>{movie.director}</strong></p>
            <Link className="text-link" href="/discover">← Back to discovery</Link>
          </div>
        </div>
      </section>

      <section className="page-container detail-content">
        <div className="detail-main-column">
          <section className="detail-editorial">
            <p className="eyebrow">EDITORIAL NOTE</p>
            <h2>A little more context.</h2>
            <p>{movie.editorialNote}</p>
          </section>

          <div className="detail-pros-cons">
            <section className="detail-list-panel">
              <p className="eyebrow">WHAT WORKS</p>
              <h2>Highlights</h2>
              {movie.pros.length ? (
                <ul>{movie.pros.map((item) => <li key={item}>{item}</li>)}</ul>
              ) : <p>Editorial highlights are not available.</p>}
            </section>
            <section className="detail-list-panel">
              <p className="eyebrow">WHAT TO CONSIDER</p>
              <h2>Trade-offs</h2>
              {movie.cons.length ? (
                <ul>{movie.cons.map((item) => <li key={item}>{item}</li>)}</ul>
              ) : <p>Editorial trade-offs are not available.</p>}
            </section>
          </div>

          {movie.trailerEmbed && (
            <section className="detail-trailer">
              <p className="eyebrow">OFFICIAL PREVIEW</p>
              <h2>Watch the trailer.</h2>
              <div className="detail-trailer__frame">
                <iframe
                  src={movie.trailerEmbed}
                  title={`${movie.title} trailer`}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <p className="detail-trailer__note">
                Trailer availability and playback are provided by YouTube.
              </p>
            </section>
          )}
        </div>

        <aside className="detail-sidebar">
          <div className="detail-score-panel">
            <span>CINEMINT SCORE</span>
            <strong>{movie.score}<small>/100</small></strong>
            <span>Stored V1 catalogue score</span>
          </div>
          <section className="detail-facts">
            <p className="eyebrow">FILM DETAILS</p>
            <dl>
              <div><dt>Release</dt><dd>{movie.releaseDate}</dd></div>
              <div><dt>Runtime</dt><dd>{movie.runtime}</dd></div>
              <div><dt>Status</dt><dd>{movie.status}</dd></div>
              <div><dt>Director</dt><dd>{movie.director}</dd></div>
            </dl>
          </section>
          <section className="detail-cast">
            <p className="eyebrow">CAST</p>
            <ul>
              {movie.cast.slice(0, 8).map((person) => <li key={person}>{person}</li>)}
            </ul>
          </section>
        </aside>
      </section>

      <section className="page-container detail-disclaimer">
        <span aria-hidden="true">✳</span>
        <p>
          This preview displays movie metadata, scores, and editorial notes migrated from CineMint V1.
          The score is stored catalogue data, not a fresh LLM-generated assessment.
        </p>
      </section>
    </main>
  );
}
