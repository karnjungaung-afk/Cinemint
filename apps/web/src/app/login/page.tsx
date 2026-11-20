import Link from "next/link";
import { signIn } from "@/app/auth/actions";

const errorMessages: Record<string, string> = {
  "invalid-input": "Enter a valid email address and password.",
  "invalid-credentials": "We could not sign you in with those details.",
  "callback-failed": "The email confirmation link is invalid or has expired. Please try again.",
  "not-configured": "CineMint sign-in is not connected yet. Configure its dedicated Supabase project first.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message = error ? errorMessages[error] : undefined;

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <p className="eyebrow">WELCOME BACK</p>
        <h1 id="login-title">Your cinema, <em>your way.</em></h1>
        <p className="auth-card__intro">
          Sign in to keep your saved films and personal discoveries together.
        </p>

        {message ? <p className="auth-message" role="alert">{message}</p> : null}

        <form className="auth-form" action={signIn}>
          <input type="hidden" name="next" value="/account" />
          <label>
            <span>Email address</span>
            <input name="email" type="email" autoComplete="email" required maxLength={254} />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" autoComplete="current-password" required minLength={8} />
          </label>
          <button className="button button--mint auth-submit" type="submit">
            Sign in <span aria-hidden="true">↗</span>
          </button>
        </form>

        <p className="auth-card__foot">
          New to CineMint? <Link href="/signup">Create an account</Link>
        </p>
        <p className="auth-card__legal">
          By continuing, you agree to use CineMint responsibly. Account data is private to your account.
        </p>
      </section>
    </main>
  );
}
