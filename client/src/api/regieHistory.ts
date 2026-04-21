import { supabase } from "./supabase";

export interface RegieHistoryEntryPayload {
  id: string;
  type: string;
  label: string;
  details?: string;
  byName: string;
  createdAt: string;
}

function formatEntryTime(rawDate: string) {
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return rawDate;
  }

  return parsed.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeRegieHistoryEntry(item: any): RegieHistoryEntryPayload {
  return {
    id: String(item?.id || ""),
    type: String(item?.type || "sync"),
    label: String(item?.label || "Action regie"),
    details: item?.details ? String(item.details) : undefined,
    byName: String(item?.by_name || item?.byName || "Regie"),
    createdAt: formatEntryTime(String(item?.created_at || item?.createdAt || new Date().toISOString())),
  };
}

export const REGIE_HISTORY_SETUP_SQL = `create table if not exists public.regie_action_history (
  id uuid primary key default gen_random_uuid(),
  salon_id uuid not null references public.salon(id_salon) on delete cascade,
  type text not null,
  label text not null,
  details text null,
  by_name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists regie_action_history_salon_created_idx
  on public.regie_action_history (salon_id, created_at desc);

alter table public.regie_action_history enable row level security;

drop policy if exists "regie history read" on public.regie_action_history;
create policy "regie history read"
on public.regie_action_history
for select
to anon, authenticated
using (true);

drop policy if exists "regie history insert" on public.regie_action_history;
create policy "regie history insert"
on public.regie_action_history
for insert
to anon, authenticated
with check (true);`;

function getSupabaseErrorMessage(error: any, fallback: string) {
  const message = String(error?.message || error?.details || error?.hint || fallback);
  if (
    message.includes("relation") && message.includes("regie_action_history") ||
    message.includes("Could not find the table") ||
    message.includes("schema cache")
  ) {
    return `La table Supabase regie_action_history manque. Cree-la d'abord avec le SQL fourni.`;
  }
  return message || fallback;
}

export async function fetchRegieHistory(salonId: string): Promise<RegieHistoryEntryPayload[]> {
  const { data, error } = await supabase
    .from("regie_action_history")
    .select("id, type, label, details, by_name, created_at")
    .eq("salon_id", salonId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(getSupabaseErrorMessage(error, "Impossible de charger l'historique regie"));
  }

  const items = Array.isArray(data) ? data : [];
  return items
    .map(normalizeRegieHistoryEntry)
    .filter((entry) => entry.id && entry.label);
}

export async function createRegieHistoryEntry(
  salonId: string,
  entry: RegieHistoryEntryPayload
): Promise<RegieHistoryEntryPayload> {
  const payload = {
      id: entry.id,
      salon_id: salonId,
      type: entry.type,
      label: entry.label,
      details: entry.details,
      by_name: entry.byName,
      created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("regie_action_history")
    .upsert(payload, { onConflict: "id" })
    .select("id, type, label, details, by_name, created_at")
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error, "Impossible d'enregistrer l'historique regie"));
  }

  return normalizeRegieHistoryEntry(data);
}
