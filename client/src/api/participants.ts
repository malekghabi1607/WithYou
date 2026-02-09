import { supabase } from "./supabase";

export interface ParticipantApi {
  id: string;
  name: string;
  email?: string | null;
  role: "admin" | "member";
  is_active: boolean;
  joined_at?: string | null;
}

async function resolveSalonId(roomRef: string): Promise<string> {
  const { data, error } = await supabase
    .from('salon')
    .select('id_salon')
    .or(`id_salon.eq.${roomRef},room_code.eq.${roomRef},invitation_code.eq.${roomRef}`)
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

  const { data, error } = await supabase
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
    .eq('salon_id', salonId);

  if (error) {
    console.error("Supabase fetch participants error:", error);
    throw new Error("Erreur fetch participants");
  }

  // Transform Supabase result to match ParticipantApi interface
  return (data || []).map((item: any) => ({
    id: item.users?.id_user,
    name: item.users?.username || "Inconnu",
    email: item.users?.email,
    role: item.users?.id_user === ownerId ? "admin" : "member",
    is_active: item.is_active,
    joined_at: item.join_date
  }));
}

export async function connectToSalon(roomId: string) {
  const salonId = await resolveSalonId(roomId);
  const userId = await ensureCurrentUserInPublicUsers();

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
    return { message: "Connected" };
  }

  const { error: insertError } = await supabase
    .from('salon_member')
    .insert({
      id_salon_member: crypto.randomUUID(),
      salon_id: salonId,
      user_id: userId,
      is_active: true,
      join_date: new Date().toISOString()
    });

  if (insertError) throw new Error(insertError.message || "Erreur connexion salon");
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
