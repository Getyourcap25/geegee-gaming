import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Profile } from "@/types/app";

/**
 * Haal de huidige ingelogde gebruiker op.
 * Redirect naar /login als er geen sessie is.
 */
export async function requireAuth(): Promise<{
  userId: string;
  profile: Profile;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/login");
  }

  return { userId: user.id, profile };
}

/**
 * Haal de huidige sessie op zonder redirect.
 * Geeft null terug als er geen sessie is.
 */
export async function getOptionalAuth(): Promise<{
  userId: string;
  profile: Profile;
} | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return { userId: user.id, profile };
}

/**
 * Vereist dat de gebruiker admin is.
 * Redirect naar / als ze geen admin zijn.
 */
export async function requireAdmin(): Promise<{
  userId: string;
  profile: Profile;
}> {
  const auth = await requireAuth();

  if (auth.profile.role !== "admin") {
    redirect("/");
  }

  return auth;
}
