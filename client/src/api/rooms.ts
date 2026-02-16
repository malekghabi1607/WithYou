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
import { connectToSalon } from "./participants";

const getSupabaseErrorMessage = (error: any, fallback: string) =>
  error?.message || error?.details || error?.hint || fallback;

function getJoinedRoomsStorageKey(userId: string) {
  return `withyou_joined_salons_${userId}`;
}

function readLocallyPersistedJoinedSalonIds(userId: string): string[] {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getJoinedRoomsStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed
        .map((entry: any) =>
          typeof entry === "string" ? entry : entry?.id_salon
        )
        .filter(Boolean)
      : [];
  } catch (error) {
    console.warn("Could not read joined salons from localStorage", error);
    return [];
  }
}

async function resolveSalonReference(roomRef: string): Promise<{ id_salon: string; id_playlist?: string | null } | null> {
  const cleanedRef = roomRef.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanedRef);

  let queryBuilder = supabase
    .from('salon')
    .select('id_salon, id_playlist');

  if (isUuid) {
    // If it's a UUID, it could be the ID or the code (unlikely but possible for legacy codes)
    queryBuilder = queryBuilder.or(`id_salon.eq.${cleanedRef},room_code.eq.${cleanedRef},invitation_code.eq.${cleanedRef}`);
  } else {
    // If it's NOT a UUID, do NOT query id_salon (avoids 400/22P02 error)
    queryBuilder = queryBuilder.or(`room_code.ilike.${cleanedRef},invitation_code.ilike.${cleanedRef}`);
  }

  const { data, error } = await queryBuilder.maybeSingle();

  if (error) {
    console.warn("resolveSalonReference error:", error);
    return null;
  }

  return data || null;
}

async function upsertVideoRecord(youtubeId: string, title?: string) {
  const basePayload: Record<string, any> = { youtube_id: youtubeId };

  // Try with `title` first (schema A), then fallback to `titre` (schema B).
  if (title) {
    const { data, error } = await supabase
      .from('video')
      .upsert({ ...basePayload, title }, { onConflict: 'youtube_id' })
      .select()
      .single();

    if (!error) return { data, error: null };

    const message = String((error as any)?.message || "");
    if (!message.includes("Could not find the 'title' column")) {
      return { data: null, error };
    }
  }

  if (title) {
    const { data, error } = await supabase
      .from('video')
      .upsert({ ...basePayload, titre: title }, { onConflict: 'youtube_id' })
      .select()
      .single();

    return { data, error: error || null };
  }

  const { data, error } = await supabase
    .from('video')
    .upsert(basePayload, { onConflict: 'youtube_id' })
    .select()
    .single();

  return { data, error: error || null };
}

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
      password_hash: "managed_by_supabase_auth",
      // role: "student", // REMOVED: Do not overwrite role during room creation!
      email_verified_at: user.email_confirmed_at || null,
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
    const raw = payload.youtubeId.trim();
    const isDirectId = /^[a-zA-Z0-9_-]{11}$/.test(raw);
    const yId = isDirectId ? raw : extractYoutubeId(raw);

    if (yId) {
      // 2a. Check if video exists
      const { data: existingVideo } = await supabase
        .from('video')
        .select('id_video')
        .eq('youtube_id', yId)
        .maybeSingle();

      if (existingVideo) {
        initialVideoId = existingVideo.id_video;
      } else {
        // 2b. Insert new video
        const { data: newVideo, error: insertError } = await upsertVideoRecord(
          yId,
          payload.title || payload.name || "Vidéo initiale"
        );

        if (insertError) {
          console.error("Error inserting video:", insertError);
        } else if (newVideo) {
          initialVideoId = newVideo.id_video;
        }
      }
    }
  }

  // Helper to generate a short code
  const generateRoomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const roomCode = generateRoomCode();
  console.log("Generated roomCode:", roomCode); // DEBUG LOG


  // 3. Insert Salon
  const { data: salonData, error: salonError } = await supabase
    .from('salon')
    .insert([{
      name: payload.name,
      description: payload.description,
      is_public: payload.isPublic,
      owner_id: user.id,
      current_video_id: initialVideoId, // Set the initial video
      room_code: roomCode,
      invitation_code: roomCode
    }])
    .select()
    .single();

  if (salonError) {
    console.error("Create salon error:", salonError);
    throw new Error(getSupabaseErrorMessage(salonError, "Erreur création salon"));
  }

  // 4. Create initial Playlist (schema uses nom_salon)
  const playlistId = crypto.randomUUID();
  const { data: playlistData, error: playlistError } = await supabase.from('playlist').insert({
    id_playlist: playlistId,
    nom_salon: salonData.name || "File d'attente",
    salon_id: salonData.id_salon
  }).select().single();

  if (playlistError) {
    throw new Error(getSupabaseErrorMessage(playlistError, "Erreur création playlist"));
  }

  // 4b. Link playlist back to salon
  if (playlistData?.id_playlist) {
    const { error: salonUpdateError } = await supabase
      .from('salon')
      .update({ id_playlist: playlistData.id_playlist })
      .eq('id_salon', salonData.id_salon);

    if (salonUpdateError) {
      throw new Error(getSupabaseErrorMessage(salonUpdateError, "Erreur liaison salon/playlist"));
    }
  }

  // 5. If we had a video, add it to the playlist too
  if (initialVideoId && playlistData) {
    try {
      await supabase.from('playlist_video').insert({
        id: crypto.randomUUID(),
        id_playlist: playlistData.id_playlist,
        id_video: initialVideoId,
        position: 1,
        is_current: true
      });
    } catch (err) {
      console.warn("Could not add to playlist_video table", err);
    }
  }

  return salonData;
}

export async function listSalons() {
  const { data, error } = await supabase
    .from('salon')
    .select('id_salon,name,description,is_public,max_participants,owner_id,current_video_id,id_playlist,room_code,invitation_code,password,owner_name:users(username)');

  if (error) {
    console.error("listSalons error", error);
    return [];
  }

  const salons = data || [];
  if (salons.length === 0) {
    return [];
  }

  const salonIds = salons.map((s: any) => s.id_salon);
  const knownPlaylistIds = new Set(
    salons.map((s: any) => s.id_playlist).filter(Boolean)
  );

  // Fetch missing playlists by salon_id (legacy/inconsistent rows fallback).
  const { data: playlists } = await supabase
    .from('playlist')
    .select('id_playlist,salon_id')
    .in('salon_id', salonIds);

  const playlistIdBySalon = new Map<string, string>();
  salons.forEach((s: any) => {
    if (s.id_playlist) playlistIdBySalon.set(s.id_salon, s.id_playlist);
  });
  (playlists || []).forEach((p: any) => {
    if (!playlistIdBySalon.has(p.salon_id)) {
      playlistIdBySalon.set(p.salon_id, p.id_playlist);
    }
    knownPlaylistIds.add(p.id_playlist);
  });

  const playlistIds = Array.from(knownPlaylistIds);
  const salonIdByPlaylist = new Map<string, string>();
  playlistIdBySalon.forEach((playlistId, salonId) => {
    salonIdByPlaylist.set(playlistId, salonId);
  });

  const { data: tracks } = playlistIds.length
    ? await supabase
      .from('playlist_video')
      .select('id_playlist,id_video')
      .in('id_playlist', playlistIds)
    : { data: [] as any[] };

  const videoCountBySalon = new Map<string, number>();
  const firstVideoBySalon = new Map<string, string>();
  (tracks || []).forEach((t: any) => {
    const salonId = salonIdByPlaylist.get(t.id_playlist);
    if (!salonId) return;
    videoCountBySalon.set(salonId, (videoCountBySalon.get(salonId) || 0) + 1);
    if (!firstVideoBySalon.has(salonId) && t.id_video) {
      firstVideoBySalon.set(salonId, t.id_video);
    }
  });

  const currentOrFirstVideoIds = Array.from(
    new Set(
      salons
        .map((s: any) => s.current_video_id || firstVideoBySalon.get(s.id_salon))
        .filter(Boolean)
    )
  );

  const { data: videos } = currentOrFirstVideoIds.length
    ? await supabase
      .from('video')
      .select('*')
      .in('id_video', currentOrFirstVideoIds)
    : { data: [] as any[] };

  const videoById = new Map((videos || []).map((v: any) => [v.id_video, v]));

  const { data: members } = await supabase
    .from('salon_member')
    .select('salon_id');

  const participantsBySalon = new Map<string, number>();
  (members || []).forEach((m: any) => {
    participantsBySalon.set(m.salon_id, (participantsBySalon.get(m.salon_id) || 0) + 1);
  });

  const mapped = salons.map((s: any) => {
    const selectedVideoId = s.current_video_id || firstVideoBySalon.get(s.id_salon);
    const selectedVideo = selectedVideoId ? videoById.get(selectedVideoId) : null;
    return {
      ...s,
      has_playlist: playlistIdBySalon.has(s.id_salon),
      video_count: videoCountBySalon.get(s.id_salon) || 0,
      participants_count: participantsBySalon.get(s.id_salon) || 0,
      has_password: !!s.password,
      current_video_title: selectedVideo?.title ?? selectedVideo?.titre ?? null,
    };
  });

  return mapped;
}

export async function fetchSalonByCode(code: string) {
  const cleanedCode = code.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanedCode);

  let queryBuilder = supabase
    .from('salon')
    .select('*');

  if (isUuid) {
    queryBuilder = queryBuilder.or(`id_salon.eq.${cleanedCode},room_code.eq.${cleanedCode},invitation_code.eq.${cleanedCode}`);
  } else {
    queryBuilder = queryBuilder.or(`room_code.ilike.${cleanedCode},invitation_code.ilike.${cleanedCode}`);
  }

  const { data, error } = await queryBuilder.single();

  if (error) throw new Error("Salon introuvable");
  return data;
}

export async function joinSalon(code: string, password?: string) {
  const roomRef = code.trim();
  if (!roomRef) {
    throw new Error("Code de salon invalide");
  }

  const salonRef = await resolveSalonReference(roomRef);
  if (!salonRef?.id_salon) {
    throw new Error("Salon introuvable");
  }

  // In Supabase mode, access control is handled by RLS.
  // If RLS blocks salon_member, we still keep local history in connectToSalon().
  try {
    await connectToSalon(salonRef.id_salon);
  } catch (error: any) {
    const message = String(error?.message || "");
    if (!message.toLowerCase().includes("row-level security")) {
      throw error;
    }
    console.warn("joinSalon: salon_member blocked by RLS, local history fallback enabled");
  }

  return { success: true, salonId: salonRef.id_salon };
}

export async function fetchMySalons() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn("fetchMySalons: User not logged in");
    return { salons: [], owned: [], joined: [] };
  }

  const { data: owned, error: ownedError } = await supabase
    .from('salon')
    .select('*')
    .eq('owner_id', user.id);

  if (ownedError) {
    console.error("fetchMySalons owned error", ownedError);
    return { salons: [], owned: [], joined: [] };
  }

  const { data: memberships, error: membershipsError } = await supabase
    .from('salon_member')
    .select('salon_id')
    .eq('user_id', user.id);

  const localJoinedIds = readLocallyPersistedJoinedSalonIds(user.id);

  if (membershipsError) {
    console.error("fetchMySalons memberships error", membershipsError);
  }

  const membershipIds = (memberships || []).map((membership: any) => membership.salon_id);
  const ownedOnly = owned || [];
  const ownedIds = new Set(ownedOnly.map((salon: any) => salon.id_salon));
  const joinedIds = Array.from(
    new Set([...membershipIds, ...localJoinedIds].filter((id: string) => !!id && !ownedIds.has(id)))
  );

  let joined: any[] = [];
  if (joinedIds.length > 0) {
    const { data: joinedSalons, error: joinedError } = await supabase
      .from('salon')
      .select('*')
      .in('id_salon', joinedIds);

    if (joinedError) {
      console.error("fetchMySalons joined error", joinedError);
    } else {
      joined = joinedSalons || [];
    }
  }

  return {
    salons: [...ownedOnly, ...joined],
    owned: ownedOnly,
    joined,
  };
}

// 🔹 Récupérer la playlist
export async function fetchPlaylist(roomId: string) {
  const salonRef = await resolveSalonReference(roomId);
  const resolvedSalonId = salonRef?.id_salon || roomId;

  // 1. Get Playlist ID for Salon
  const { data: playlists, error } = await supabase
    .from('playlist')
    .select('id_playlist')
    .eq('salon_id', resolvedSalonId)
    .maybeSingle();

  if (error) {
    console.error("fetchPlaylist error", error);
    throw new Error(getSupabaseErrorMessage(error, "Erreur fetch playlist"));
  }

  if (!playlists) {
    // Fallback: some environments store explicit playlist reference on salon
    const fallbackPlaylistId = salonRef?.id_playlist;
    if (fallbackPlaylistId) {
      return fetchPlaylistById(fallbackPlaylistId);
    }

    return { playlistId: null, items: [] };
  }

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
    .select('*')
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
      titre: v.title ?? v.titre,
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

// 🔹 Récupérer la playlist par son ID (utile quand salon.id_playlist est déjà connu)
export async function fetchPlaylistById(playlistId: string) {
  const { data: tracks, error: tracksError } = await supabase
    .from('playlist_video')
    .select('id, id_video, position, created_at')
    .eq('id_playlist', playlistId)
    .order('position', { ascending: true });

  if (tracksError) {
    console.error("Error fetching playlist tracks by id:", tracksError);
    return { playlistId, items: [] };
  }

  const videoIds = (tracks || []).map((t: any) => t.id_video).filter(Boolean);
  if (videoIds.length === 0) {
    return { playlistId, items: [] };
  }

  const { data: videos, error: videosError } = await supabase
    .from('video')
    .select('*')
    .in('id_video', videoIds);

  if (videosError) {
    console.error("Error fetching videos by playlist id:", videosError);
    return { playlistId, items: [] };
  }

  const videoById = new Map((videos || []).map((v: any) => [v.id_video, v]));
  const items = (tracks || []).map((t: any) => {
    const v = videoById.get(t.id_video);
    if (!v) return null;
    return {
      id: v.id_video,
      youtube_id: v.youtube_id,
      titre: v.title ?? v.titre,
      thumbnail: v.thumbnail_url,
      duration: v.duration,
      position: t.position
    };
  }).filter(Boolean);

  return { playlistId, items };
}

// 🔹 Ajouter une vidéo
export async function addVideoToPlaylist(
  roomId: string,
  data: { title: string; url: string }
) {
  const salonRef = await resolveSalonReference(roomId);
  const resolvedSalonId = salonRef?.id_salon || roomId;

  // 1. Insert Video
  const youtubeId = extractYoutubeId(data.url);
  if (!youtubeId) throw new Error("URL invalide");

  const { data: videoData, error: videoError } = await upsertVideoRecord(
    youtubeId,
    data.title
  );

  if (videoError) throw videoError;
  if (!videoData?.youtube_id) {
    throw new Error("Video invalide: youtube_id manquant");
  }

  // 2. Get Playlist
  let { data: playlist } = await supabase
    .from('playlist')
    .select('id_playlist')
    .eq('salon_id', resolvedSalonId)
    .maybeSingle();

  // Fallback when playlist row is missing but salon points to one
  if (!playlist) {
    if (salonRef?.id_playlist) {
      playlist = { id_playlist: salonRef.id_playlist };
    }
  }

  if (playlist) {
    // 3. Link Video to Playlist
    const { count } = await supabase
      .from('playlist_video')
      .select('*', { count: 'exact', head: true })
      .eq('id_playlist', playlist.id_playlist);

    const { error: playlistInsertError } = await supabase
      .from('playlist_video')
      .insert({
        id: crypto.randomUUID(),
        id_playlist: playlist.id_playlist,
        id_video: videoData.id_video,
        position: (count || 0) + 1
      });

    if (playlistInsertError) {
      throw new Error(getSupabaseErrorMessage(playlistInsertError, "Erreur ajout a la playlist"));
    }
  }

  return { success: true };
}

// 🔹 Supprimer une vidéo
export async function removeVideoFromPlaylist(roomId: string, videoId: string) {
  const salonRef = await resolveSalonReference(roomId);
  const resolvedSalonId = salonRef?.id_salon || roomId;

  let { data: playlist } = await supabase
    .from('playlist')
    .select('id_playlist')
    .eq('salon_id', resolvedSalonId)
    .maybeSingle();

  if (!playlist) {
    if (salonRef?.id_playlist) {
      playlist = { id_playlist: salonRef.id_playlist };
    }
  }

  if (!playlist) return;

  const { error: removeError } = await supabase
    .from('playlist_video')
    .delete()
    .eq('id_playlist', playlist.id_playlist)
    .eq('id_video', videoId);

  if (removeError) {
    throw new Error(getSupabaseErrorMessage(removeError, "Erreur suppression de la video"));
  }
}
