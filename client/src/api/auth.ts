// src/api/auth.ts
import { supabase } from "./supabase";

type Json = Record<string, any>;

export type AuthToken = {
  token: string;
  raw: Json;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
};

/** POST /api/auth/login -> Supabase SignIn */
export async function login(email: string, password: string): Promise<AuthToken> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  const token = data.session?.access_token || "";

  // Set localStorage for compatibility with legacy code
  localStorage.setItem("token", token);

  return { token, raw: data };
}

/** POST /api/auth/register -> Supabase SignUp */
export async function register(payload: RegisterPayload): Promise<AuthToken> {
  if (payload.password !== payload.password_confirmation) {
    throw new Error("Les mots de passe ne correspondent pas.");
  }

  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        username: payload.username,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  // Supabase might require email confirmation.
  // If session is null, user check their email.
  const token = data.session?.access_token || "";

  return { token, raw: data };
}

/** POST /api/auth/forgot-password -> Supabase Reset Password */
export async function forgotPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw new Error(error.message);

  return { message: "Email envoyé" };
}

/** POST /api/auth/reset-password -> Supabase Update User */
export async function resetPassword(payload: any) {
  // Normally requires being logged in or having a recovery token session
  const { error } = await supabase.auth.updateUser({
    password: payload.password
  });

  if (error) throw new Error(error.message);

  return { message: "Mot de passe mis à jour" };
}

/** GET /api/auth/me -> Supabase Get User */
export async function me(token?: string): Promise<Json> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Aucun utilisateur connecté.");
  }

  // Fetch real profile from 'users' table
  const { data: publicProfile } = await supabase
    .from('users')
    .select('username')
    .eq('id_user', user.id)
    .maybeSingle();

  return {
    id: user.id,
    // Prioritize public DB username, then metadata, then email
    username: publicProfile?.username || user.user_metadata?.username || user.email?.split('@')[0],
    email: user.email,
    created_at: user.created_at
  };
}

/** PUT /api/auth/profile -> Update User Profile */
export async function updateProfile(payload: { username: string; email?: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non connecté");

  // 1. Update Supabase Auth (metadata)
  const { error: authError } = await supabase.auth.updateUser({
    data: { username: payload.username }
    // email updates require confirmation flow usually, skipping for now unless simple
  });
  if (authError) throw authError;

  // 2. Update Public Users Table
  const { error: dbError } = await supabase
    .from('users')
    .update({ username: payload.username })
    .eq('id_user', user.id);

  if (dbError) throw dbError;

  return { success: true };
}

/** Supprime le token côté front (Supabase SignOut) */
export async function logoutLocal() {
  localStorage.removeItem("token");
  await supabase.auth.signOut();
}
