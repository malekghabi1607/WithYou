import { supabase } from "./supabase";

export interface FavoriteVideoApi {
  youtube_id: string;
  title: string;
  thumbnail?: string | null;
  url?: string | null;
  added_at?: string | null;
}

export async function fetchFavorites(): Promise<FavoriteVideoApi[]> {
  const { data, error } = await supabase
    .from('favorite_videos') // Assuming this table exists
    .select('*');

  if (error) {
    console.warn("Fetch favorites failed (table might be missing)", error);
    return [];
  }
  return data || [];
}

export async function addFavorite(payload: { youtubeId: string; title?: string }) {
  const { error } = await supabase
    .from('favorite_videos')
    .insert([{
      youtube_id: payload.youtubeId,
      title: payload.title || "No Title"
    }]);

  if (error) throw error;
  return { success: true };
}

export async function removeFavorite(youtubeId: string) {
  const { error } = await supabase
    .from('favorite_videos')
    .delete()
    .eq('youtube_id', youtubeId);

  if (error) throw error;
  return { success: true };
}
