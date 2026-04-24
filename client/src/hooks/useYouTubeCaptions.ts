/**
 * Projet : WithYou
 * Fichier : hooks/useYouTubeCaptions.ts
 *
 * Description :
 * Hook React qui récupère les vraies sous-titres/captions d'une vidéo YouTube
 * via l'API publique Invidious (instances publiques, CORS activé).
 * Expose des fonctions pour obtenir la ligne de sous-titre au temps t.
 *
 * Pipeline :
 * 1. Fetch la liste des pistes de captions (fr → en → première dispo)
 * 2. Fetch le fichier VTT correspondant
 * 3. Parse les timecodes et textes
 * 4. Retourne getCurrentCaption(time) qui donne la ligne active à l'instant t
 *
 * Feature F — Sous-titres enrichis synchronisés avec la vidéo
 */

import { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CaptionLine {
  start: number;   // secondes
  end: number;     // secondes
  text: string;
}

export interface UseYouTubeCaptionsReturn {
  captions: CaptionLine[];
  isLoading: boolean;
  isAvailable: boolean;          // true si des captions ont été trouvées
  currentCaption: CaptionLine | null;  // ligne active pour le temps actuel
  error: string | null;
  language: string | null;       // "fr", "en", etc.
}

// ─── Instances Invidious publiques (avec CORS) ────────────────────────────────
// Testées dans l'ordre, première qui répond est utilisée

const INVIDIOUS_INSTANCES: string[] = [];


const PREFERRED_LANGS = ["fr", "fr-FR", "en", "en-US", "en-GB", "ar"];

// ─── Cache (évite de re-fetcher pour la même vidéo) ──────────────────────────

const captionCache = new Map<string, CaptionLine[]>();
const langCache = new Map<string, string>();

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function timedFetch(url: string, ms = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

/** Parse une timestamp VTT du type "00:01:23.456" → secondes */
function parseVttTime(ts: string): number {
  const clean = ts.trim().split(".")[0]; // enlève les millisecondes
  const parts = clean.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? 0;
}

/** Parse un fichier VTT complet en tableau de CaptionLine */
function parseVTT(vttText: string): CaptionLine[] {
  const lines = vttText.replace(/\r/g, "").split("\n");
  const result: CaptionLine[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Ligne de timing ex: "00:00:01.000 --> 00:00:04.500"
    if (line.includes("-->")) {
      const [startStr, endStr] = line.split("-->").map((s) => s.trim());
      const start = parseVttTime(startStr);
      // endStr peut contenir des paramètres de position ex "00:01:23.000 position:xx%"
      const end = parseVttTime(endStr.split(" ")[0]);

      // Collecter les lignes de texte suivantes (jusqu'à ligne vide ou fin)
      const textLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "") {
        const txt = lines[i]
          .replace(/<[^>]*>/g, "")           // supprimer balises HTML <c>, <b> etc.
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&nbsp;/g, " ")
          .trim();
        if (txt) textLines.push(txt);
        i++;
      }

      const text = textLines.join(" ").trim();
      if (text && end > start) {
        result.push({ start, end, text });
      }
    }
    i++;
  }

  // Dédupliquer les lignes identiques consécutives (YouTube génère parfois des doublons)
  return result.filter((line, idx) =>
    idx === 0 || line.text !== result[idx - 1].text
  );
}

/** Essaie de fetcher les captions depuis une instance Invidious */
async function fetchFromInstance(
  instance: string,
  videoId: string
): Promise<{ captions: CaptionLine[]; lang: string } | null> {
  try {
    // 1. Liste des pistes disponibles
    const listUrl = `${instance}/api/v1/captions/${videoId}`;
    const listResp = await timedFetch(listUrl, 4000);
    if (!listResp.ok) return null;

    const listData = await listResp.json();
    const tracks: Array<{ label: string; languageCode: string; url: string }> =
      listData?.captions ?? [];

    if (tracks.length === 0) return null;

    // 2. Sélectionner la piste préférée
    let chosen = tracks[0];
    for (const lang of PREFERRED_LANGS) {
      const found = tracks.find(
        (t) => t.languageCode === lang || t.languageCode.startsWith(lang.split("-")[0])
      );
      if (found) { chosen = found; break; }
    }

    // 3. Fetch le contenu VTT
    const vttUrl = chosen.url.startsWith("http")
      ? chosen.url
      : `${instance}${chosen.url}`;
    const vttResp = await timedFetch(vttUrl, 5000);
    if (!vttResp.ok) return null;

    const vttText = await vttResp.text();
    const captions = parseVTT(vttText);
    if (captions.length === 0) return null;

    return { captions, lang: chosen.languageCode };
  } catch {
    return null;
  }
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useYouTubeCaptions(
  videoId: string | undefined,
  currentTime: number  // secondes : temps actuel du lecteur
): UseYouTubeCaptionsReturn {
  const [captions, setCaptions] = useState<CaptionLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!videoId) {
      setCaptions([]);
      setIsAvailable(false);
      setIsLoading(false);
      return;
    }

    // Cache hit
    if (captionCache.has(videoId)) {
      setCaptions(captionCache.get(videoId)!);
      setLanguage(langCache.get(videoId) ?? null);
      setIsAvailable(captionCache.get(videoId)!.length > 0);
      setIsLoading(false);
      return;
    }

    cancelledRef.current = false;
    setIsLoading(true);
    setError(null);
    setCaptions([]);
    setIsAvailable(false);

    const run = async () => {
      // Essayer chaque instance jusqu'à succès
      for (const instance of INVIDIOUS_INSTANCES) {
        if (cancelledRef.current) return;
        const result = await fetchFromInstance(instance, videoId);
        if (result) {
          captionCache.set(videoId, result.captions);
          langCache.set(videoId, result.lang);
          if (!cancelledRef.current) {
            setCaptions(result.captions);
            setLanguage(result.lang);
            setIsAvailable(true);
            setIsLoading(false);
          }
          return;
        }
      }

      // Toutes les instances ont échoué
      captionCache.set(videoId, []); // cache vide pour éviter re-fetch
      if (!cancelledRef.current) {
        setIsAvailable(false);
        setIsLoading(false);
        setError("Sous-titres non disponibles pour cette vidéo.");
      }
    };

    run();

    return () => {
      cancelledRef.current = true;
    };
  }, [videoId]);

  // Calculer la caption active en fonction du temps courant
  const currentCaption: CaptionLine | null =
    captions.find(
      (c) => currentTime >= c.start && currentTime <= c.end + 0.5
    ) ?? null;

  return { captions, isLoading, isAvailable, currentCaption, error, language };
}
