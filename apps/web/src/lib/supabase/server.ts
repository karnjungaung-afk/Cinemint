import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnvironment } from "./env";

export async function createServerSupabaseClient() {
  const environment = getSupabaseEnvironment();

  if (!environment) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    environment.url,
    environment.publishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot write cookies. The Next.js proxy
            // refreshes sessions and persists refreshed cookies per request.
          }
        },
      },
    }
  );
}
