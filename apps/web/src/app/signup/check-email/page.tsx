import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <main className="auth-page">
      <section className="auth-card auth-card--notice" aria-labelledby="check-email-title">
        <p className="eyebrow">ONE LAST STEP</p>
        <h1 id="check-email-title">Check your <em>inbox.</em></h1>
        <p className="auth-card__intro">
          If the address is registered successfully, Supabase will send a confirmation link.
          Open it on this device to finish creating your CineMint account.
        </p>
        <Link className="button button--mint auth-submit" href="/login">
          Return to sign in <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </main>
  );
}
