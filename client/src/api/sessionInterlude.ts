import { supabase } from "./supabase";

export interface SessionInterludeState {
  enabled: boolean;
  message: string;
  endsAt?: string | null;
  updatedBy?: string;
  updatedAt?: string | null;
}

function getSupabaseErrorMessage(error: any, fallback: string) {
  const message = String(error?.message || error?.details || error?.hint || fallback);
  if (
    (message.includes("relation") && message.includes("session_interludes")) ||
    message.includes("Could not find the table") ||
    message.includes("schema cache")
  ) {
    return "La table Supabase session_interludes manque. Cree-la d'abord avec le SQL fourni.";
  }
  return message || fallback;
}

function normalizeInterludeState(item: any): SessionInterludeState {
  return {
    enabled: Boolean(item?.enabled),
    message: String(item?.message || ""),
    endsAt: item?.ends_at ? String(item.ends_at) : null,
    updatedBy: item?.updated_by ? String(item.updated_by) : undefined,
    updatedAt: item?.updated_at ? String(item.updated_at) : null,
  };
}

export async function fetchSessionInterlude(salonId: string): Promise<SessionInterludeState> {
  const { data, error } = await supabase
    .from("session_interludes")
    .select("enabled, message, ends_at, updated_by, updated_at")
    .eq("salon_id", salonId)
    .maybeSingle();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error, "Impossible de charger le mode interlude"));
  }

  if (!data) {
    return { enabled: false, message: "", endsAt: null };
  }

  return normalizeInterludeState(data);
}

export async function upsertSessionInterlude(
  salonId: string,
  state: SessionInterludeState
): Promise<SessionInterludeState> {
  const payload = {
    salon_id: salonId,
    enabled: state.enabled,
    message: state.message,
    ends_at: state.endsAt || null,
    updated_by: state.updatedBy || "Regie",
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("session_interludes")
    .upsert(payload, { onConflict: "salon_id" })
    .select("enabled, message, ends_at, updated_by, updated_at")
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error, "Impossible d'enregistrer le mode interlude"));
  }

  return normalizeInterludeState(data);
}
