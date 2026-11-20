import Link from "next/link";
import { FilmRow } from "@/components/film-row";
import { movies } from "@/data/movies";

const featured = movies[0];

export default function HomePage() {
  return (
    <main>
      <section className="hero-wrap">
        <div
          className="hero-visual"
          style={{ backgroundImage: `url("${featured.backdropUrl}")` }}
          role="img"
          aria-label={`Cinematic backdrop for ${featured.title}`}
        />
        <div className="hero-shade" />
        <div className="hero-content page-container">
          <div className="hero-copy">
            <p className="eyebrow eyebrow--bright"><span className="eyebrow__line" /> A NEW WAY TO FIND YOUR NEXT FILM</p>
            <h1>Good films.<br /><em>Better discoveries.</em></h1>
            <p className="hero-description">
              A thoughtful cinema companion for finding stories that stay with you.
              Explore by mood, compare what matters, and understand why a film might be right for you.
            </p>
            <div className="hero-actions">
              <Link className="button button--mint" href="/discover">Explore films <span aria-hidden="true">↗</span></Link>
              <Link className="button button--ghost" href={`/movie/${featured.slug}`}>View featured film</Link>
            </div>
            <div className="hero-footnote">
              <span className="hero-score"><span aria-hidden="true">✳</span> {featured.score}</span>
              <span> CINE MINT EDITORIAL SCORE</span>
              <span className="hero-footnote__divider" />
              <span>{featured.year} · {featured.genres.slice(0, 2).join(" / ")}</span>
            </div>
          </div>
          <div className="hero-caption">
            <span>01 / FEATURED FILM</span>
            <strong>{featured.title}</strong>
            <span>{featured.originalTitle}</span>
          </div>
        </div>
        <div className="hero-bottom-rule page-container">
          <span>DISCOVER WITH INTENTION</span>
          <span>SCROLL TO EXPLORE ↓</span>
        </div>
      </section>

      <div className="page-container home-content">
        <section className="intro-strip">
          <div>
            <p className="eyebrow">MORE THAN A RATING</p>
            <h2>Find the film that fits <em>your moment.</em></h2>
          </div>
          <p>
            CineMint brings film details, editorial notes, and discovery tools together
            so your next movie night starts with a better choice.
          </p>
        </section>

        <FilmRow
          title="Worth your time"
          description="A small selection from the CineMint movie catalogue."
          movies={movies.slice(0, 4)}
        />

        <section className="insight-banner">
          <div className="insight-banner__symbol" aria-hidden="true">✳</div>
          <div className="insight-banner__copy">
            <p className="eyebrow">COMING INTO FOCUS</p>
            <h2>Know more than the score.</h2>
            <p>Explore the story, creative choices, strengths, and trade-offs behind every film.</p>
          </div>
          <Link className="button button--ghost" href="/discover">Discover the catalogue <span aria-hidden="true">↗</span></Link>
        </section>
      </div>
    </main>
  );
}
