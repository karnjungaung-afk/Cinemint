"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
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
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return new URL("/auth/callback?next=%2Faccount", origin).toString();
}

export async function signIn(formData: FormData): Promise<never> {
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");
  const nextPath = safeNextPath(readString(formData, "next"));

  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email) || !password) {
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
  const password = readString(formData, "password");

  if (
    displayName.length < 2 ||
    displayName.length > 60 ||
    !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email) ||
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
