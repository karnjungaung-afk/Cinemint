"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readPassword(formData: FormData): string {
  const value = formData.get("password");
  return typeof value === "string" ? value : "";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function safeNextPath(value: string): string {
  if (
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
  ) {
    return value;
  }

  return "/account";
}

function getEmailCallbackUrl(): string {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const origin = new URL(configuredOrigin);
    if (origin.protocol !== "https:" && origin.hostname !== "localhost") {
      return "http://localhost:3000/auth/callback?next=%2Faccount";
    }

    return new URL("/auth/callback?next=%2Faccount", origin).toString();
  } catch {
    return "http://localhost:3000/auth/callback?next=%2Faccount";
  }
}

export async function signIn(formData: FormData): Promise<never> {
  const email = readString(formData, "email").toLowerCase();
  const password = readPassword(formData);
  const nextPath = safeNextPath(readString(formData, "next"));

  if (!isValidEmail(email) || !password) {
    redirect("/login?error=invalid-input");
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/login?error=not-configured");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/login?error=invalid-credentials");
  }

  redirect(nextPath);
}

export async function signUp(formData: FormData): Promise<never> {
  const displayName = readString(formData, "displayName");
  const email = readString(formData, "email").toLowerCase();
  const password = readPassword(formData);

  if (
    displayName.length < 2 ||
    displayName.length > 60 ||
    !isValidEmail(email) ||
    password.length < 8
  ) {
    redirect("/signup?error=invalid-input");
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/signup?error=not-configured");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
      emailRedirectTo: getEmailCallbackUrl(),
    },
  });

  if (error) {
    redirect("/signup?error=signup-failed");
  }

  if (data.session) {
    redirect("/account");
  }

  redirect("/signup/check-email");
}

export async function signOut(): Promise<never> {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
