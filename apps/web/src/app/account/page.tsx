import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="auth-page">
        <section className="auth-card auth-card--notice">
          <p className="eyebrow">ACCOUNT SETUP</p>
          <h1>Connect <em>CineMint.</em></h1>
          <p className="auth-card__intro">
            This account area is ready, but it needs a dedicated CineMint Supabase project.
            Add the public project URL and publishable key to the local environment to enable sign-in.
          </p>
          <Link className="button button--mint auth-submit" href="/login">
            Go to sign in <span aria-hidden="true">↗</span>
          </Link>
        </section>
      </main>
    );
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/login?error=not-configured");
  }

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?next=%2Faccount");
  }

  const displayName =
    typeof data.user.user_metadata?.display_name === "string"
      ? data.user.user_metadata.display_name
      : "Film lover";

  return (
    <main className="auth-page">
      <section className="auth-card account-card" aria-labelledby="account-title">
        <p className="eyebrow">YOUR CINEMINT ACCOUNT</p>
        <h1 id="account-title">Welcome, <em>{displayName}.</em></h1>
        <p className="auth-card__intro">
          Your account is connected. Watchlist sync and personal film preferences will be enabled
          after the CineMint database migration is configured.
        </p>

        <div className="account-details">
          <span>EMAIL ADDRESS</span>
          <strong>{data.user.email ?? "No email address available"}</strong>
          <span>ACCOUNT STATUS</span>
          <strong className="account-status">Authenticated</strong>
        </div>

        <div className="account-actions">
          <Link className="button button--ghost" href="/watchlist">View saved films</Link>
          <form action={signOut}>
            <button className="button button--mint" type="submit">Sign out</button>
          </form>
        </div>
      </section>
    </main>
  );
}
