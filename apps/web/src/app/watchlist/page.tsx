import type { Metadata } from "next";
import { WatchlistPreview } from "@/components/watchlist-preview";
import { movies } from "@/data/movies";

export const metadata: Metadata = {
  title: "My watchlist",
  description: "Your saved CineMint preview films in this browser.",
};

export default function WatchlistPage() {
  return (
    <main className="page-container subpage">
      <header className="subpage__heading">
        <p className="eyebrow">YOUR PERSONAL SHORTLIST</p>
        <h1>Saved films.</h1>
        <p>
          Keep a shortlist of stories you would like to explore next.
          Your current preview collection is stored only in this browser.
        </p>
      </header>
      <WatchlistPreview movies={movies} />
    </main>
  );
}
