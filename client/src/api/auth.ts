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

export type RegisterResult = {
  token: string;
  raw: Json;
  requiresEmailConfirmation: boolean;
  email: string;
};

async function syncPublicUser(user: any) {
  if (!user?.id || !user?.email) return;

  const username =
    user.user_metadata?.username ||
    user.email.split("@")[0] ||
    "Utilisateur";

  // Dynamic Role Assignment
  let role = "guest";
  const email = user.email || "";

  if (email === "admin.videotheque@univ-avignon.fr") {
    role = "admin";
  } else if (email.endsWith("@univ-avignon.fr")) {
    if (email.includes(".alumni.") || email.includes(".etud.")) {
      role = "student";
    } else {
      role = "teacher"; // Root domain (firstname.lastname@univ-avignon.fr) is staff/teacher
    }
  } else if (email.endsWith("@prof.univ-avignon.fr")) {
    role = "teacher";
  }

  const payload: Record<string, any> = {
    id_user: user.id,
    username,
    email: user.email,
    password_hash: "managed_by_supabase_auth",
    email_verified_at: user.email_confirmed_at || null,
    role,
  };

  if (user.updated_at) {
    payload.password_changed_at = user.updated_at;
  }

  const { error } = await supabase.from("users").upsert(payload, { onConflict: "id_user" });

  if (error) {
    // Do not block auth for sync issues, but keep trace.
    console.error("Public user sync error:", error);
  }
}

/** POST /api/auth/login -> Supabase SignIn */
export async function login(email: string, password: string): Promise<AuthToken> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  const emailConfirmedAt = data.user?.email_confirmed_at;
  if (!emailConfirmedAt) {
    await supabase.auth.signOut();
    throw new Error("Veuillez confirmer votre email avant de vous connecter.");
  }

  const token = data.session?.access_token || "";

  // Set localStorage for compatibility with legacy code
  localStorage.setItem("token", token);
  await syncPublicUser(data.user);

  return { token, raw: data };
}

/** POST /api/auth/register -> Supabase SignUp */
export async function register(payload: RegisterPayload): Promise<RegisterResult> {
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
      emailRedirectTo: `${window.location.origin}/account-confirmed`,
    },
  });

  if (error) {
    const normalized = String(error.message || "").toLowerCase();
    if (normalized.includes("error sending confirmation email")) {
      throw new Error(
        "Error sending confirmation email. Verify Supabase Auth email provider and redirect URL settings."
      );
    }
    throw new Error(error.message);
  }

  // Respect Supabase project auth mode:
  // - confirm email ON  -> no session, user not confirmed yet
  // - confirm email OFF -> session exists, user is already confirmed
  const hasSession = !!data.session;
  const userConfirmed = !!data.user?.email_confirmed_at;
  const requiresEmailConfirmation = !hasSession && !userConfirmed;

  // Never keep a fresh signup session on client: user must explicitly sign in later.
  if (hasSession) {
    await supabase.auth.signOut();
  }

  // Do not create/update public.users before confirmation when email confirmation is required.
  if (!requiresEmailConfirmation) {
    await syncPublicUser(data.user);
  }

  return {
    token: "",
    raw: data,
    requiresEmailConfirmation,
    email: payload.email,
  };
}

export async function resendConfirmationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/account-confirmed`,
    },
  });

  if (error) throw new Error(error.message);
  return { message: "Email de confirmation renvoye" };
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

  await syncPublicUser(user);

  // Fetch real profile from 'users' table
  const { data: publicProfile } = await supabase
    .from('users')
    .select('username,email_verified_at,password_changed_at,role')
    .eq('id_user', user.id)
    .maybeSingle();

  return {
    id: user.id,
    // Prioritize public DB username, then metadata, then email
    username: publicProfile?.username || user.user_metadata?.username || user.email?.split('@')[0],
    email: user.email,
    role: publicProfile?.role || 'student',
    created_at: user.created_at,
    email_verified_at: publicProfile?.email_verified_at || user.email_confirmed_at || null,
    password_changed_at: publicProfile?.password_changed_at || null,
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
  localStorage.removeItem("currentUser");
  await supabase.auth.signOut();
}
