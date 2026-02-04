import { supabase } from "./supabase";

export interface ParticipantApi {
  id: string;
  name: string;
  email?: string | null;
  role: "admin" | "member";
  is_active: boolean;
  joined_at?: string | null;
}

export async function fetchParticipants(roomId: string): Promise<ParticipantApi[]> {
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
    .eq('salon_id', roomId);

  if (error) {
    console.error("Supabase fetch participants error:", error);
    throw new Error("Erreur fetch participants");
  }

  // Transform Supabase result to match ParticipantApi interface
  return data.map((item: any) => ({
    id: item.users?.id_user,
    name: item.users?.username || "Inconnu",
    email: item.users?.email,
    role: "member", // Role management might need 'salon' owner check or extra column
    is_active: item.is_active,
    joined_at: item.join_date
  }));
}

export async function connectToSalon(roomId: string) {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  // Fallback to local storage user if Supabase Auth not fully active yet
  // Ideally, use: if (!user) throw new Error("Not authenticated");

  // Since the app might be using custom auth or mixed auth, we try to find the user in 'users' table 
  // corresponding to the current session.
  // For now, assuming the user is already authenticated via Supabase or we have their ID.

  // Update status to active
  // Note: We need the proper user_id. 
  // If the previous flow used a custom token, we might need a way to link it.
  // Assuming 'users' table has a row for this user.

  return { message: "Connected (Stub: Realtime handles presence usually)" };
}

export async function disconnectFromSalon(roomId: string) {
  // Upate status to inactive
  return { message: "Disconnected" };
}
