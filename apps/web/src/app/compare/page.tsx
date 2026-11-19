import type { Metadata } from "next";
import Link from "next/link";

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
          A clearer way to understand the differences between two films.
          The interactive comparison tool will be migrated after the V2 movie data layer is ready.
        </p>
      </header>
      <section className="assistant-shell">
        <div className="assistant-main">
          <p className="eyebrow">COMPARISON WORKSPACE</p>
          <h2>Make the choice with context.</h2>
          <p>
            This preview establishes the page structure only. Movie selection,
            score breakdowns, and comparison logic are not connected yet.
          </p>
          <Link className="button button--mint" href="/discover">Choose a film to explore</Link>
        </div>
      </section>
    </main>
  );
}
