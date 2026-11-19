import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <Link className="brand brand--footer" href="/">
          <span className="brand__mark" aria-hidden="true">C</span>
          <span className="brand__word">Cine<span>Mint</span></span>
        </Link>
        <p className="site-footer__note">
          A more thoughtful way to discover your next favourite film.
        </p>
      </div>
      <div className="site-footer__links">
        <Link href="/discover">Explore films</Link>
        <Link href="/mintbot">Meet MintBot</Link>
        <Link href="/">CineMint 2.0 Preview</Link>
      </div>
      <p className="site-footer__legal">
        Movie information and artwork are provided by their respective owners.
      </p>
    </footer>
  );
}
