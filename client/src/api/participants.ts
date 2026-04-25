import { supabase } from "./supabase";

export interface MemberPermissions {
  chat: boolean;
  video: boolean;
  playlist: boolean;
  polls: boolean;
  pin: boolean;
  muted: boolean;
}

export interface ParticipantApi {
  id: string;
  name: string;
  email?: string | null;
  role: "admin" | "regie" | "member";
  permissions?: Partial<MemberPermissions>;
  is_active: boolean;
  joined_at?: string | null;
}

export type SalonRole = "admin" | "regie" | "member";

function createClientUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function normalizeParticipantRole(role: unknown): SalonRole {
  if (role === "admin" || role === "regie") return role;
  return "member";
}

function parsePermissions(raw: any): Partial<MemberPermissions> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const toBool = (value: unknown) => value === true;
  return {
    chat: toBool(raw.chat),
    video: toBool(raw.video),
    playlist: toBool(raw.playlist),
    polls: toBool(raw.polls),
    pin: toBool(raw.pin),
    muted: toBool(raw.muted),
  };
}

function getJoinedRoomsStorageKey(userId: string) {
  return `withyou_joined_salons_${userId}`;
}

function persistJoinedSalonLocally(userId: string, salonId: string) {
  if (!userId || !salonId) return;
  try {
    const key = getJoinedRoomsStorageKey(userId);
    const raw = localStorage.getItem(key);
    const current = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(current)
      ? current
          .map((entry: any) =>
            typeof entry === "string" ? entry : entry?.id_salon
          )
          .filter(Boolean)
      : [];
    const next = Array.from(new Set([...list, salonId]));
    localStorage.setItem(key, JSON.stringify(next));
  } catch (error) {
    console.warn("Could not persist joined salons locally", error);
  }
}

async function resolveSalonId(roomRef: string): Promise<string> {
  const cleanedRef = roomRef.trim();
  const { data, error } = await supabase
    .from('salon')
    .select('id_salon')
    .or(`id_salon.eq.${cleanedRef},room_code.ilike.${cleanedRef},invitation_code.ilike.${cleanedRef}`)
    .maybeSingle();

  if (error || !data?.id_salon) {
    throw new Error("Salon introuvable");
  }

  return data.id_salon;
}

async function ensureCurrentUserInPublicUsers(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Utilisateur non connecté");

  const username = user.user_metadata?.username || user.email?.split("@")[0] || "Utilisateur";

  const { error } = await supabase
    .from('users')
    .upsert({
      id_user: user.id,
      username,
      email: user.email,
      password_hash: "managed_by_supabase_auth"
    }, { onConflict: 'id_user' });

  if (error) {
    throw new Error(error.message || "Erreur synchronisation utilisateur");
  }

  return user.id;
}

export async function fetchParticipants(roomId: string): Promise<ParticipantApi[]> {
  const salonId = await resolveSalonId(roomId);

  const { data: salonData } = await supabase
    .from('salon')
    .select('owner_id')
    .eq('id_salon', salonId)
    .maybeSingle();

  const ownerId = salonData?.owner_id || null;

  let members: any[] | null = null;
  let error: any = null;

  // Prefer reading role directly from salon_member when available.
  ({ data: members, error } = await supabase
    .from('salon_member')
    .select(`
      user_id,
      role,
      permissions,
      is_active,
      join_date,
      users (
        id_user,
        username,
        email
      )
    `)
    .eq('salon_id', salonId));

  // Backward compatibility: old schemas may not have salon_member.permissions.
  if (error && String(error.message || "").toLowerCase().includes("permissions")) {
    ({ data: members, error } = await supabase
      .from('salon_member')
      .select(`
        user_id,
        role,
        is_active,
        join_date,
        users (
          id_user,
          username,
          email
        )
      `)
      .eq('salon_id', salonId));
  }

  // Backward compatibility: old schemas may not have salon_member.role yet.
  if (error && String(error.message || "").toLowerCase().includes("role")) {
    ({ data: members, error } = await supabase
      .from('salon_member')
      .select(`
        user_id,
        is_active,
        join_date,
        users (
          id_user,
          username,
          email
        )
      `)
      .eq('salon_id', salonId));
  }

  if (error) {
    console.error("Supabase fetch participants error:", error);
    throw new Error("Erreur fetch participants");
  }

  // Transform Supabase result to match ParticipantApi interface
  return (members || []).map((item: any) => ({
    id: item.users?.id_user,
    name: item.users?.username || "Inconnu",
    email: item.users?.email,
    role: item.users?.id_user === ownerId ? "admin" : normalizeParticipantRole(item.role),
    permissions: parsePermissions(item.permissions),
    is_active: item.is_active,
    joined_at: item.join_date
  }));
}

export async function connectToSalon(roomId: string) {
  const salonId = await resolveSalonId(roomId);
  const userId = await ensureCurrentUserInPublicUsers();
  // Keep a local trace even if RLS blocks salon_member writes.
  persistJoinedSalonLocally(userId, salonId);

  const { data: existing } = await supabase
    .from('salon_member')
    .select('id_salon_member')
    .eq('salon_id', salonId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing?.id_salon_member) {
    const { error: updateError } = await supabase
      .from('salon_member')
      .update({ is_active: true, join_date: new Date().toISOString() })
      .eq('id_salon_member', existing.id_salon_member);

    if (updateError) throw new Error(updateError.message || "Erreur connexion salon");
    persistJoinedSalonLocally(userId, salonId);
    return { message: "Connected" };
  }

  let insertError: any = null;
  ({ error: insertError } = await supabase
    .from('salon_member')
    .insert({
      id_salon_member: createClientUuid(),
      salon_id: salonId,
      user_id: userId,
      role: "member",
      is_active: true,
      join_date: new Date().toISOString()
    }));

  if (insertError && String(insertError.message || "").toLowerCase().includes("role")) {
    ({ error: insertError } = await supabase
      .from('salon_member')
      .insert({
        id_salon_member: createClientUuid(),
        salon_id: salonId,
        user_id: userId,
        is_active: true,
        join_date: new Date().toISOString()
      }));
  }

  if (insertError) throw new Error(insertError.message || "Erreur connexion salon");
  persistJoinedSalonLocally(userId, salonId);
  return { message: "Connected" };
}

export async function disconnectFromSalon(roomId: string) {
  const salonId = await resolveSalonId(roomId);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { message: "Disconnected" };

  const { error } = await supabase
    .from('salon_member')
    .update({ is_active: false })
    .eq('salon_id', salonId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message || "Erreur déconnexion salon");
  return { message: "Disconnected" };
}

export async function setParticipantRole(
  roomId: string,
  participantId: string,
  role: Exclude<SalonRole, "admin">
) {
  const salonId = await resolveSalonId(roomId);

  const { error } = await supabase
    .from("salon_member")
    .update({ role })
    .eq("salon_id", salonId)
    .eq("user_id", participantId);

  if (error) {
    const message = String(error.message || "");
    if (message.includes("Could not find the 'role' column")) {
      throw new Error(
        "La colonne `salon_member.role` manque dans Supabase. Ajoute-la avec: ALTER TABLE public.salon_member ADD COLUMN role text NOT NULL DEFAULT 'member';"
      );
    }
    throw new Error(error.message || "Impossible de mettre a jour le role");
  }
}

export async function setParticipantPermissions(
  roomId: string,
  participantId: string,
  permissions: MemberPermissions
) {
  const salonId = await resolveSalonId(roomId);

  const { error } = await supabase
    .from("salon_member")
    .update({ permissions })
    .eq("salon_id", salonId)
    .eq("user_id", participantId);

  if (error) {
    const message = String(error.message || "");
    if (message.includes("Could not find the 'permissions' column")) {
      throw new Error(
        "La colonne `salon_member.permissions` manque dans Supabase. Ajoute-la avec: ALTER TABLE public.salon_member ADD COLUMN permissions jsonb NOT NULL DEFAULT '{}'::jsonb;"
      );
    }
    throw new Error(error.message || "Impossible de mettre a jour les permissions");
  }
}
