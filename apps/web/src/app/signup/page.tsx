import Link from "next/link";
import { signUp } from "@/app/auth/actions";

const errorMessages: Record<string, string> = {
  "invalid-input": "Check your name, email, and password. Passwords must contain at least 8 characters.",
  "signup-failed": "We could not create that account. Check the details or try signing in.",
  "not-configured": "CineMint registration is not connected yet. Configure its dedicated Supabase project first.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? errorMessages[error] : undefined;

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="signup-title">
        <p className="eyebrow">JOIN THE COLLECTION</p>
        <h1 id="signup-title">A little more <em>personal.</em></h1>
        <p className="auth-card__intro">
          Create an account to prepare for synced watchlists and film preferences.
        </p>

        {message ? <p className="auth-message" role="alert">{message}</p> : null}

        <form className="auth-form" action={signUp}>
          <label>
            <span>Display name</span>
            <input name="displayName" type="text" autoComplete="name" required minLength={2} maxLength={60} />
          </label>
          <label>
            <span>Email address</span>
            <input name="email" type="email" autoComplete="email" required maxLength={254} />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" autoComplete="new-password" required minLength={8} />
          </label>
          <button className="button button--mint auth-submit" type="submit">
            Create account <span aria-hidden="true">↗</span>
          </button>
        </form>

        <p className="auth-card__foot">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
        <p className="auth-card__legal">
          Email confirmation may be required before your first sign-in.
        </p>
      </section>
    </main>
  );
}
