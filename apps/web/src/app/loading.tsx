export default function Loading() {
  return (
    <main className="page-container subpage" aria-live="polite" aria-busy="true">
      <p className="eyebrow">CINEMINT</p>
      <div className="loading-mark" aria-hidden="true">✳</div>
      <p className="section-heading__description">Preparing your next discovery…</p>
    </main>
  );
}
