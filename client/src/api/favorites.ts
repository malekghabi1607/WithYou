import { supabase } from "./supabase";

export interface FavoriteVideoApi {
  youtube_id: string;
  title: string;
  thumbnail?: string | null;
  url?: string | null;
  added_at?: string | null;
}

export async function fetchFavorites(): Promise<FavoriteVideoApi[]> {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) return [];

  const { data, error } = await supabase
    .from('favorite_video')
    .select(`
      id_video,
      created_at,
      video:video (
        id_video,
        youtube_id,
        title,
        thumbnail_url
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn("Fetch favorites failed (table might be missing)", error);
    return [];
  }

  const mapped = (data || []).map((row: any) => ({
    youtube_id: row.video?.youtube_id || "",
    title: row.video?.title || "Sans titre",
    thumbnail: row.video?.thumbnail_url || null,
    added_at: row.created_at || null,
  })).filter((row: FavoriteVideoApi) => !!row.youtube_id);

  return mapped;
}

export async function addFavorite(payload: { youtubeId: string; title?: string }) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) throw new Error("Utilisateur non connecté");

  const { data: video } = await supabase
    .from('video')
    .select('id_video')
    .eq('youtube_id', payload.youtubeId)
    .single();

  if (!video?.id_video) {
    throw new Error("Vidéo introuvable");
  }

  const { error } = await supabase
    .from('favorite_video')
    .insert([{
      id_favorite: crypto.randomUUID(),
      user_id: userId,
      id_video: video.id_video,
      created_at: new Date().toISOString()
    }]);

  if (error) throw error;
  return { success: true };
}

export async function removeFavorite(youtubeId: string) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth?.user?.id;
  if (!userId) throw new Error("Utilisateur non connecté");

  const { data: video } = await supabase
    .from('video')
    .select('id_video')
    .eq('youtube_id', youtubeId)
    .single();

  if (!video?.id_video) {
    throw new Error("Vidéo introuvable");
  }

  const { error } = await supabase
    .from('favorite_video')
    .delete()
    .eq('user_id', userId)
    .eq('id_video', video.id_video);

  if (error) throw error;
  return { success: true };
}
