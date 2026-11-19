import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-container subpage">
      <div className="subpage__heading">
        <p className="eyebrow">404 · MISSING REEL</p>
        <h1>This film is off the schedule.</h1>
        <p>The page may have moved, or the film is not part of this preview catalogue.</p>
        <Link className="button button--mint" href="/discover">Back to discovery</Link>
      </div>
    </main>
  );
}
