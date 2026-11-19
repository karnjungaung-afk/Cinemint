import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/compare", label: "Compare" },
  { href: "/watchlist", label: "Saved" },
  { href: "/mintbot", label: "MintBot" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="CineMint home">
        <span className="brand__mark" aria-hidden="true">C</span>
        <span className="brand__word">Cine<span>Mint</span></span>
      </Link>

      <nav className="main-nav" aria-label="Main navigation">
        {links.map((link) => (
          <Link className="main-nav__link" href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="header-actions">
        <Link className="header-search" href="/discover" aria-label="Search movies">
          <span aria-hidden="true">⌕</span>
          <span>Find a film</span>
        </Link>
        <span className="header-status">2.0 PREVIEW</span>
      </div>
    </header>
  );
}
