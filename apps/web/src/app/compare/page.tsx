import type { Metadata } from "next";
import { CompareWorkspace } from "@/components/compare-workspace";
import { movies } from "@/data/movies";

export const metadata: Metadata = {
  title: "Compare films",
};

export default function ComparePage() {
  return (
    <main className="page-container subpage">
      <header className="subpage__heading">
        <p className="eyebrow">SIDE BY SIDE</p>
        <h1>Compare films.</h1>
        <p>
          Explore differences in genre, runtime, editorial notes, and stored CineMint scores.
          This first preview compares the sample catalogue locally.
        </p>
      </header>
      <CompareWorkspace movies={movies} />
      <p className="subpage__notice">
        Scores and movie details are sample data migrated from V1. This comparison does not make a personalized recommendation.
      </p>
    </main>
  );
}
