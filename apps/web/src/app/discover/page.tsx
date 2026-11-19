import type { Metadata } from "next";
import { FilmCard } from "@/components/film-card";
import { movies } from "@/data/movies";

export const metadata: Metadata = {
  title: "Discover",
  description: "Explore a small preview of the CineMint movie catalogue.",
};

export default function DiscoverPage() {
  return (
    <main className="page-container subpage">
      <header className="subpage__heading">
        <p className="eyebrow">EXPLORE AT YOUR OWN PACE</p>
        <h1>Discover films.</h1>
        <p>
          Browse the CineMint preview catalogue. Advanced search, genre filters,
          and personalized recommendations will be connected in later migration phases.
        </p>
      </header>
      <div className="film-grid">
        {movies.map((movie, index) => (
          <FilmCard key={movie.slug} movie={movie} index={index} />
        ))}
      </div>
      <p className="subpage__notice">
        Preview catalogue: this page currently contains a small sample from V1.
        The full movie catalogue will be migrated after data validation.
      </p>
    </main>
  );
}
