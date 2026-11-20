import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";
import "./auth.css";

export const metadata: Metadata = {
  title: {
    default: "CineMint — Discover better films",
    template: "%s | CineMint",
  },
  description:
    "Discover films with thoughtful editorial context, useful comparisons, and a more personal way to explore cinema.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
