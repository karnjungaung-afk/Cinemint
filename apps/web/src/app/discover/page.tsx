import type { Metadata } from "next";
import { DiscoverPanel } from "@/components/discover-panel";
import { movies } from "@/data/movies";

export const metadata: Metadata = {
  title: "Discover",
  description: "Explore films with the CineMint discovery preview.",
};

export default function DiscoverPage() {
  return (
    <main className="page-container subpage">
      <header className="subpage__heading">
        <p className="eyebrow">EXPLORE AT YOUR OWN PACE</p>
        <h1>Discover films.</h1>
        <p>
          Search titles, explore stories, and narrow the catalogue by genre.
          Personalized recommendations will be connected after the user preference and data layers are ready.
        </p>
      </header>
      <DiscoverPanel movies={movies} />
      <p className="subpage__notice">
        Preview catalogue: this page currently contains a small sample from V1.
        Search and genre filters run locally in your browser; they are not yet connected to a live movie service.
      </p>
    </main>
  );
}
