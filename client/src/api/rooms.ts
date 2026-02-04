/**
 * Projet : WithYou
 * Fichier : api/rooms.ts
 *
 * Description :
 * Module contenant toutes les requêtes API relatives aux salles :
 *  - Création de salle
 *  - Récupération des informations d’une salle
 *  - Gestion de la playlist
/**
 * Projet : WithYou
 * Fichier : api/rooms.ts
 *
 * Description :
 * Module contenant toutes les requêtes API relatives aux salles :
 *  - Création de salle
 *  - Récupération des informations d’une salle
 *  - Gestion de la playlist
 *  - Gestion des sondages
 *  - Gestion des membres
 *  - Entrée / sortie d’une salle
 */

// client/src/api/rooms.ts
import { supabase } from "./supabase";

// 🔹 Extraire youtubeId depuis une URL YouTube
export function extractYoutubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// 🔹 Créer un salon (Supabase impl)
export async function createSalon(payload: {
  name: string;
  description?: string;
  youtubeId?: string;
  title?: string;
  isPublic?: boolean;
  password?: string; // Not implemented in Supabase version yet without edge functions
  maxParticipants?: number;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Doit être connecté pour créer un salon");

  // 1. Sync User to 'users' table
  // Check for conflict on email (legacy user vs new auth)
  const { data: existingUser } = await supabase
    .from('users')
    .select('id_user')
    .eq('email', user.email)
    .single();

  if (existingUser && existingUser.id_user !== user.id) {
    console.warn("Found legacy user with same email. Renaming to allow sync.");
    // Update legacy user to free up the email/username, avoiding FK delete issues
    await supabase.from('users')
      .update({
        email: `legacy_${Date.now()}_${user.email}`,
        username: `legacy_${Date.now()}`
      })
      .eq('id_user', existingUser.id_user);
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .upsert({
      id_user: user.id, // Using Supabase auth ID as FK
      username: user.user_metadata?.username || user.email?.split('@')[0],
      email: user.email,
      password_hash: "managed_by_supabase_auth"
    }, { onConflict: 'id_user' })
    .select()
    .single();

  if (userError) {
    console.error("User sync error:", userError);
    // Continue anyway, maybe it worked? If not, next step will fail.
  }

  // 2. Prepare Salon Data
  let initialVideoId = null;

  if (payload.youtubeId) {
    const yId = extractYoutubeId(payload.youtubeId);
    console.log("Extracted YouTube ID:", yId);

    if (yId) {
      // 2a. Check if video exists
      const { data: existingVideo } = await supabase
        .from('video')
        .select('id_video')
        .eq('youtube_id', yId)
        .maybeSingle();

      if (existingVideo) {
        initialVideoId = existingVideo.id_video;
        console.log("Found existing video:", initialVideoId);
      } else {
        // 2b. Insert new video
        const { data: newVideo, error: insertError } = await supabase
          .from('video')
          .insert({
            youtube_id: yId,
            title: payload.title || "Vidéo initiale",
            duration: 0
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error inserting video:", insertError);
        } else if (newVideo) {
          initialVideoId = newVideo.id_video;
          console.log("Inserted new video:", initialVideoId);
        }
      }
    }
  }

  // 3. Insert Salon
  const { data: salonData, error: salonError } = await supabase
    .from('salon')
    .insert([{
      name: payload.name,
      description: payload.description,
      is_public: payload.isPublic,
      owner_id: user.id,
      current_video_id: initialVideoId // Set the initial video
    }])
    .select()
    .single();

  if (salonError) {
    console.error("Create salon error:", salonError);
    throw new Error("Erreur création salon");
  }

  // 4. Create initial Playlist
  const { data: playlistData } = await supabase.from('playlist').insert({
    name: "File d'attente",
    salon_id: salonData.id_salon
  }).select().single();

  // 5. If we had a video, add it to the playlist too
  if (initialVideoId && playlistData) {
    try {
      await supabase.from('playlist_video').insert({
        playlist_id: playlistData.id_playlist,
        video_id: initialVideoId,
        added_by: user.id
      });
    } catch (err) {
      console.warn("Could not add to playlist_video table", err);
    }
  }

  return salonData;
}

export async function listSalons() {
  console.log("listSalons: Fetching all salons...");
  const { data, error } = await supabase.from('salon').select('*, owner_name:users(username)');

  if (error) {
    console.error("listSalons error", error);
    return [];
  }

  console.log("listSalons: Found", data?.length);
  return data || [];
}

export async function fetchSalonByCode(code: string) {
  // Assuming 'id_salon' is the code or we query by name/id
  // The original code used a route /salons/:code

  const { data, error } = await supabase
    .from('salon')
    .select('*')
    .or(`id_salon.eq.${code}`)
    // If you have a 'room_code' column, add .or(`room_code.eq.${code}`)
    .single();

  if (error) throw new Error("Salon introuvable");
  return data;
}

export async function joinSalon(code: string, password?: string) {
  // Client-side join logic is mostly just "checking if it exists"
  // Permissions are verified by RLS or loading the page
  return { success: true };
}

export async function fetchMySalons() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn("fetchMySalons: User not logged in");
    return { salons: [] };
  }

  console.log("fetchMySalons: Fetching for user", user.id);

  const { data, error } = await supabase
    .from('salon')
    .select('*')
    .eq('owner_id', user.id);

  if (error) {
    console.error("fetchMySalons error", error);
    return { salons: [] };
  }

  console.log("fetchMySalons: Found salons", data?.length);
  return { salons: data || [] };
}

// 🔹 Récupérer la playlist
export async function fetchPlaylist(roomId: string) {
  // 1. Get Playlist ID for Salon
  const { data: playlists, error } = await supabase
    .from('playlist')
    .select('id_playlist')
    .eq('salon_id', roomId)
    .maybeSingle();

  if (error) {
    console.error("fetchPlaylist error", error);
    throw new Error("Erreur fetch playlist");
  }

  if (!playlists) return { playlistId: null, items: [] };

  // 2. Load links from join table `playlist_video`
  const { data: tracks, error: tracksError } = await supabase
    .from('playlist_video')
    .select('id, id_video, position, created_at')
    .eq('id_playlist', playlists.id_playlist)
    .order('position', { ascending: true });

  if (tracksError) {
    console.error("Error fetching playlist tracks:", tracksError);
    return { playlistId: playlists.id_playlist, items: [] };
  }

  const videoIds = (tracks || []).map((t: any) => t.id_video).filter(Boolean);
  if (videoIds.length === 0) {
    return { playlistId: playlists.id_playlist, items: [] };
  }

  const { data: videos, error: videosError } = await supabase
    .from('video')
    .select('id_video, youtube_id, title, thumbnail_url, duration')
    .in('id_video', videoIds);

  if (videosError) {
    console.error("Error fetching videos:", videosError);
    return { playlistId: playlists.id_playlist, items: [] };
  }

  const videoById = new Map((videos || []).map((v: any) => [v.id_video, v]));
  const items = (tracks || []).map((t: any) => {
    const v = videoById.get(t.id_video);
    if (!v) return null;
    return {
      id: v.id_video,
      youtube_id: v.youtube_id,
      titre: v.title,
      thumbnail: v.thumbnail_url,
      duration: v.duration,
      position: t.position
    };
  }).filter(Boolean);

  return {
    playlistId: playlists.id_playlist,
    items: items,
  };
}

// 🔹 Ajouter une vidéo
export async function addVideoToPlaylist(
  roomId: string,
  data: { title: string; url: string }
) {
  // 1. Insert Video
  const youtubeId = extractYoutubeId(data.url);
  if (!youtubeId) throw new Error("URL invalide");

  const { data: videoData, error: videoError } = await supabase
    .from('video')
    .upsert({
      youtube_id: youtubeId,
      title: data.title
    }, { onConflict: 'youtube_id' })
    .select()
    .single();

  if (videoError) throw videoError;

  // 2. Get Playlist
  const { data: playlist } = await supabase
    .from('playlist')
    .select('id_playlist')
    .eq('salon_id', roomId)
    .single();

  if (playlist) {
    // 3. Link Video to Playlist
    const { count } = await supabase
      .from('playlist_video')
      .select('*', { count: 'exact', head: true })
      .eq('id_playlist', playlist.id_playlist);

    await supabase
      .from('playlist_video')
      .insert({
        id: crypto.randomUUID(),
        id_playlist: playlist.id_playlist,
        id_video: videoData.id_video,
        position: (count || 0) + 1
      });
  }

  return { success: true };
}

// 🔹 Supprimer une vidéo
export async function removeVideoFromPlaylist(roomId: string, videoId: string) {
  const { data: playlist } = await supabase
    .from('playlist')
    .select('id_playlist')
    .eq('salon_id', roomId)
    .single();

  if (!playlist) return;

  await supabase
    .from('playlist_video')
    .delete()
    .eq('id_playlist', playlist.id_playlist)
    .eq('id_video', videoId);
}
