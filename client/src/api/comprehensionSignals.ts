import { supabase } from "./supabase";

export type ComprehensionSignalStatus = "understood" | "slow_down" | "lost";

export interface ComprehensionSignalEntry {
  id: string;
  salonId: string;
  userId: string;
  userName: string;
  status: ComprehensionSignalStatus;
  videoId?: string | null;
  videoTime: number;
  createdAt: string;
  updatedAt: string;
}

function getSupabaseErrorMessage(error: any, fallback: string) {
  const message = String(error?.message || error?.details || error?.hint || fallback);
  if (
    (message.includes("relation") && message.includes("session_comprehension_signals")) ||
    message.includes("Could not find the table") ||
    message.includes("schema cache")
  ) {
    return "La table Supabase session_comprehension_signals manque. Cree-la d'abord avec le SQL fourni.";
  }
  return message || fallback;
}

function normalizeComprehensionSignal(item: any): ComprehensionSignalEntry {
  return {
    id: String(item?.id || ""),
    salonId: String(item?.salon_id || ""),
    userId: String(item?.user_id || ""),
    userName: String(item?.user_name || "Participant"),
    status: (item?.status || "understood") as ComprehensionSignalStatus,
    videoId: item?.video_id ? String(item.video_id) : null,
    videoTime: Math.max(0, Number(item?.video_time_seconds ?? 0)),
    createdAt: String(item?.created_at || new Date().toISOString()),
    updatedAt: String(item?.updated_at || item?.created_at || new Date().toISOString()),
  };
}

export async function fetchComprehensionSignals(salonId: string): Promise<ComprehensionSignalEntry[]> {
  const { data, error } = await supabase
    .from("session_comprehension_signals")
    .select("id, salon_id, user_id, user_name, status, video_id, video_time_seconds, created_at, updated_at")
    .eq("salon_id", salonId)
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(getSupabaseErrorMessage(error, "Impossible de charger le barometre de comprehension"));
  }

  return (Array.isArray(data) ? data : [])
    .map(normalizeComprehensionSignal)
    .filter((entry) => entry.id && entry.userId);
}

export async function upsertComprehensionSignal(
  salonId: string,
  entry: Omit<ComprehensionSignalEntry, "id" | "salonId" | "createdAt" | "updatedAt">
): Promise<ComprehensionSignalEntry> {
  const nowIso = new Date().toISOString();
  const payload = {
    salon_id: salonId,
    user_id: entry.userId,
    user_name: entry.userName,
    status: entry.status,
    video_id: entry.videoId || null,
    video_time_seconds: Math.max(0, Math.floor(entry.videoTime)),
    updated_at: nowIso,
  };

  const { data, error } = await supabase
    .from("session_comprehension_signals")
    .upsert(payload, { onConflict: "salon_id,user_id" })
    .select("id, salon_id, user_id, user_name, status, video_id, video_time_seconds, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error, "Impossible d'enregistrer le signal de comprehension"));
  }

  return normalizeComprehensionSignal(data);
}
