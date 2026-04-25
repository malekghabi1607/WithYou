import { supabase } from "./supabase";

export interface VideoBookmarkPayload {
  id: string;
  salonId: string;
  videoId: string;
  videoTitle: string;
  time: number;
  label: string;
  byName: string;
  createdAt: string;
}

function formatBookmarkTime(rawDate: string) {
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return rawDate;
  }

  return parsed.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSupabaseErrorMessage(error: any, fallback: string) {
  const message = String(error?.message || error?.details || error?.hint || fallback);
  if (
    (message.includes("relation") && message.includes("video_bookmarks")) ||
    message.includes("Could not find the table") ||
    message.includes("schema cache")
  ) {
    return "La table Supabase video_bookmarks manque. Cree-la d'abord avec le SQL fourni.";
  }
  return message || fallback;
}

function normalizeVideoBookmark(item: any): VideoBookmarkPayload {
  return {
    id: String(item?.id || ""),
    salonId: String(item?.salon_id || item?.salonId || ""),
    videoId: String(item?.video_id || item?.videoId || ""),
    videoTitle: String(item?.video_title || item?.videoTitle || "Video"),
    time: Number(item?.time_seconds ?? item?.time ?? 0),
    label: String(item?.label || "Marque-page"),
    byName: String(item?.by_name || item?.byName || "Regie"),
    createdAt: formatBookmarkTime(String(item?.created_at || item?.createdAt || new Date().toISOString())),
  };
}

export async function fetchVideoBookmarks(salonId: string): Promise<VideoBookmarkPayload[]> {
  const { data, error } = await supabase
    .from("video_bookmarks")
    .select("id, salon_id, video_id, video_title, time_seconds, label, by_name, created_at")
    .eq("salon_id", salonId)
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    throw new Error(getSupabaseErrorMessage(error, "Impossible de charger les marque-pages"));
  }

  return (Array.isArray(data) ? data : [])
    .map(normalizeVideoBookmark)
    .filter((entry) => entry.id && entry.videoId);
}

export async function createVideoBookmark(entry: VideoBookmarkPayload): Promise<VideoBookmarkPayload> {
  const payload = {
    id: entry.id,
    salon_id: entry.salonId,
    video_id: entry.videoId,
    video_title: entry.videoTitle,
    time_seconds: Math.max(0, Math.floor(entry.time)),
    label: entry.label,
    by_name: entry.byName,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("video_bookmarks")
    .upsert(payload, { onConflict: "id" })
    .select("id, salon_id, video_id, video_title, time_seconds, label, by_name, created_at")
    .single();

  if (error) {
    throw new Error(getSupabaseErrorMessage(error, "Impossible d'enregistrer le marque-page"));
  }

  return normalizeVideoBookmark(data);
}
