/**
 * Projet : WithYou
 * Fichier : hooks/useVideoAIPreview.ts
 *
 * Feature D — Résumé basé sur le VRAI contenu YouTube
 *
 * Pipeline (robuste, sans Invidious) :
 *  1. oEmbed YouTube     → titre officiel, chaîne  (toujours dispo)
 *  2. Gemini AI          → reçoit l'URL YouTube + titre + chaîne
 *                          et ANALYSE DIRECTEMENT la vidéo pour en extraire
 *                          un résumé précis de son vrai contenu
 *  3. Fallback           → analyse intelligente du titre (JAMAIS de placeholder)
 */

import { useState, useEffect, useRef } from "react";
import { detectVideoCategory } from "../utils/videoContentScore";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AIVideoSummary {
  lines: [string, string, string];
  keywords: string[];
  watchPartySuitability: string;
  generatedBy: "gemini" | "title-analysis";
}

export interface VideoPreviewData {
  realTitle: string;
  channelName: string;
  channelUrl: string;
  thumbnailUrl: string;
  category: string;
  summary: AIVideoSummary;
}

export interface UseVideoAIPreviewReturn {
  data: VideoPreviewData;
  isLoading: boolean;
  loadingStep: "oembed" | "gemini" | "done" | "idle";
  error: string | null;
}

// ─── Config ──────────────────────────────────────────────────────────────────

const GEMINI_API_KEY: string = (import.meta as any).env?.VITE_GEMINI_API_KEY ?? "";
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const cache = new Map<string, VideoPreviewData>();

// ─── Fetch avec timeout ───────────────────────────────────────────────────────

async function timedFetch(url: string, options: RequestInit = {}, ms = 6000): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getThumbUrl(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
}

function formatDur(dur: string): string {
  if (!dur || dur === "0:00" || dur === "00:00") return "";
  const parts = dur.split(":").map(Number);
  let s = 0;
  if (parts.length === 3) s = parts[0] * 3600 + parts[1] * 60 + parts[2];
  else if (parts.length === 2) s = parts[0] * 60 + parts[1];
  if (s <= 0) return "";
  const m = Math.floor(s / 60);
  return m >= 60
    ? `${Math.floor(m / 60)}h${m % 60 > 0 ? String(m % 60).padStart(2, "0") + "min" : ""}`
    : `${m} min`;
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M vues`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K vues`;
  return `${n} vues`;
}

const STOPWORDS = new Set([
  "de","le","la","les","du","des","un","une","et","en","est","au","aux","par","pour",
  "sur","dans","avec","que","qui","sont","the","an","of","in","on","is","are","this",
  "that","and","to","it","be","was","for","you","your","how","what","why","can",
]);

function extractKeywords(title: string, extra: string[] = []): string[] {
  return [...title.split(/[\s\-_|:,!?.()[\]"'°#]+/), ...extra]
    .map((w) => w.replace(/[^a-zA-Z\u00C0-\u017E]/g, "").toLowerCase())
    .filter((w) => w.length > 3 && !STOPWORDS.has(w))
    .filter((w, i, arr) => arr.indexOf(w) === i)
    .slice(0, 7);
}

// ─── Analyse intelligente du titre (fallback sans API) ────────────────────────

function buildTitleAnalysis(
  title: string,
  channelName: string,
  duration: string,
  youtubeId?: string
): AIVideoSummary {
  const dl = formatDur(duration);
  const ch = channelName ? `la chaîne "${channelName}"` : "YouTube";

  // Détection du type de contenu depuis le titre
  const isCourse     = /cours|leçon|lesson|tuto(?:rial)?|formation|guide|apprendre|learn/i.test(title);
  const isSeries     = /[#n°ep\.]\s*\d+|episode|partie\s*\d+|saison|season/i.test(title);
  const isFree       = /gratuit|free/i.test(title);
  const isBeginner   = /débutant|beginner|initiation|base|fondament|from\s*scratch|zéro/i.test(title);
  const isAdvanced   = /avancé|advanced|expert|pro|master/i.test(title);
  const isComplete   = /complet|complete|intégral|full|tout|all/i.test(title);
  const isLive       = /live|direct/i.test(title);
  const isReview     = /test|review|avis|comparatif|comparison/i.test(title);
  const isNews       = /actualité|actu|news|2024|2025|breaking/i.test(title);

  const category = detectVideoCategory(title);
  const keywords = extractKeywords(title);

  let p1: string;
  let p2: string;
  let p3: string;

  // ── Extraction du sujet principal du titre (pour personnaliser les questions) ──
  // Retire les mots génériques, garde ce qui définit le SUJET de la vidéo
  const TITLE_STOPWORDS = new Set([
    "cours","lecon","leçon","lesson","tuto","tutorial","formation","guide","video","vidéo",
    "episode","partie","saison","season","gratuit","free","complet","complete","debutant",
    "avance","expert","best","top","full","part","serie","collection","playlist","playlist",
    "lien","lien","avec","pour","dans","comment","faire","tout","tous","toutes","votre",
    "notre","vous","nous","cette","from","scratch","zero","zéro",
  ]);

  // Extrait les 2-3 mots les plus significatifs du titre (le vrai sujet)
  const subjectWords = title
    .replace(/[N°#]\s*\d+/g, "")
    .split(/[\s\-_|:,!?.()[\]"'°#\/\\]+/)
    .map((w) => w.replace(/[^a-zA-Z\u00C0-\u017E]/g, ""))
    .filter((w) => w.length > 3)
    .filter((w) => !TITLE_STOPWORDS.has(w.toLowerCase()))
    .filter((w, i, arr) => arr.indexOf(w) === i)
    .slice(0, 4);

  // Extrait le numéro d'épisode/leçon si présent
  const episodeMatch = title.match(/(?:leçon|lesson|episode|partie|ep\.?|n°|#)\s*(\d+)/i);
  const episodeNum = episodeMatch ? episodeMatch[1] : null;

  // Construit une description du sujet pour les questions
  const subjectStr = subjectWords.length > 0 ? subjectWords.join(", ") : title.slice(0, 40);
  const epStr = episodeNum ? `la leçon ${episodeNum}` : "ce contenu";

  if (isCourse) {
    const level = isBeginner ? " pour débutants" : isAdvanced ? " de niveau avancé" : "";
    const format = isComplete ? " complet" : isSeries ? " en série" : "";
    const free = isFree ? " entièrement gratuit" : "";
    p1 = `Cette vidéo propose un cours${format}${level}${free}${dl ? ` d'une durée de ${dl}` : ""}, publié par ${ch}. "${title}" couvre de manière progressive et structurée les concepts fondamentaux de son sujet, en accompagnant les spectateurs pas à pas à travers les notions essentielles à maîteriser.`;
    p2 = `Suivre ce cours en groupe en watch party est une excellente façon d'apprendre ensemble, de poser des questions en direct dans le chat et de progresser collectivement. La dynamique de groupe favorise la mémorisation et permet à chacun d'apporter ses expériences personnelles pour enrichir la compréhension de tous les participants.`;
    p3 = `Pour animer cette session sur "${subjectStr.trim()}", commencez par demander au groupe : "Avez-vous déjà des connaissances sur ${subjectWords[0] || "ce sujet"} ?" et "Qu'est-ce qui vous a motivé à apprendre ${subjectWords[0] || "ce domaine"} ?". Pendant la diffusion de ${epStr}, encouragez les participants à noter les points qui les surprennent ou qu'ils ne comprennent pas. À la fin, proposez un récapitulatif collectif : chaque participant partage la notion de ${epStr} qu'il a trouvée la plus utile ou la plus surprenante.`;
  } else if (isReview) {
    const subject = subjectWords[0] || "ce produit";
    p1 = `Cette vidéo présente un test ou une analyse critique${dl ? ` de ${dl}` : ""} réalisé par ${ch}. "${title}" propose une évaluation détaillée qui examine les points forts, les limites et le verdict final sur le sujet analysé — permettant au spectateur de se forger un avis éclairé basé sur des critères concrets.`;
    p2 = `Regarder cette vidéo en groupe génère naturellement des débats, car chacun peut avoir une expérience différente avec ${subject}. La watch party permet de confronter les avis personnels avec les conclusions de la vidéo, créant des échanges riches et souvent inattendus entre participants.`;
    p3 = `Avant de lancer la vidéo, demandez à chacun : "Avez-vous déjà utilisé ou testé ${subject} ?" pour révéler les expériences préalables du groupe. Pendant l'analyse, notez dans le chat les critères utilisés par ${channelName || "le créateur"} pour évaluer ${subject}. À la fin, débattez : "Ces critères correspondent-ils à vos propres priorités pour ${subject} ?" et "Le verdict final vous a-t-il surpris par rapport à vos attentes ?"`;
  } else if (isNews) {
    const subject = subjectWords.slice(0, 2).join(" ") || "ce sujet";
    p1 = `Cette vidéo traite d'une actualité récente${dl ? ` (${dl})` : ""}, produite par ${ch}. "${title}" analyse et décrypte des événements d'actualité, offrant un éclairage journalistique ou analytique qui invite à la réflexion critique et au débat collectif sur des sujets qui façonnent notre société.`;
    p2 = `Visionner une vidéo d'actualité en watch party crée un espace d'analyse collective où chaque participant apporte son point de vue et son interprétation des faits. Cette pratique développe l'esprit critique et favorise une compréhension plus nuancée de sujets souvent complexes et multidimensionnels.`;
    p3 = `Avant la diffusion, posez une question d'amorçage : "Que savez-vous déjà de ${subject} ?" pour mesurer les connaissances du groupe. Pendant la vidéo, encouragez les réactions dans le chat sur les données ou révélations surprenantes. À la fin, organisez un mini-débat : "Cette analyse sur ${subject} vous a-t-elle convaincu ?" et "Quelles informations vous semblent manquantes ou à approfondir ?"`;
  } else if (isLive) {
    const subject = subjectWords[0] || "cet événement";
    p1 = `Cette vidéo est un contenu live ou une rediffusion${dl ? ` de ${dl}` : ""} proposé par ${ch}. "${title}" capture l'authenticité et la spontanéité d'un moment diffusé en direct, offrant une expérience moins scénarisée mais souvent plus engageante et connectée à l'actualité immédiate.`;
    p2 = `Regarder un live ensemble en watch party reproduit l'expérience d'un événement partagé en temps réel. Les réactions simultanées, les moments inattendus et la spontanéité du direct créent une atmosphère de complicité et d'engagement particulièrement forte au sein du groupe.`;
    p3 = `Avant le lancement du live sur ${subject}, posez la question : "Qu'attendez-vous le plus de cette session en direct ?" pour créer un premier élan d'engagement. Pendant la diffusion, activez les réactions en temps réel et demandez régulièrement : "Qu'en pensez-vous jusqu'ici ?". À la fin, invitez chaque participant à partager : "Quel moment de ce direct sur ${subject} vous a le plus marqué et pourquoi ?"`;
  } else {
    const subject = subjectWords.slice(0, 2).join(" ") || title.slice(0, 30);
    const cat = category;
    const catData: Record<string, [string, string, string]> = {
      "Cinéma": [
        `Cette vidéo propose un contenu cinématographique${dl ? ` de ${dl}` : ""}, publié par ${ch}. "${title}" plonge les spectateurs dans une œuvre audiovisuelle riche — qu'il s'agisse d'un film, d'une critique cinéma, d'une analyse narrative ou d'une présentation d'œuvres marquantes — conçue pour être vécue et débatue collectivement.`,
        `Regarder ce contenu cinématographique en groupe multiplie l'expérience émotionnelle et intellectuelle. Chaque participant interprète les scènes différemment, ressent des émotions distinctes et apporte une lecture personnelle qui enrichit la compréhension collective de l'œuvre et des thèmes qu'elle aborde.`,
        `Avant la diffusion de "${title.slice(0, 35)}…", demandez : "Avez-vous déjà vu ce film ou connaissez-vous ${subject} ?". Pendant le visionnage, invitez le groupe à réagir dans le chat aux scènes clés. À la fin, ouvrez la discussion : "Quel personnage ou quelle scène de '${title.slice(0, 25)}…' vous a le plus touché et pourquoi ?"`,
      ],
      "Musique": [
        `Cette vidéo propose un contenu musical${dl ? ` de ${dl}` : ""}, diffusé par ${ch}. "${title}" offre une expérience d'écoute ou d'analyse musicale — concert, clip, session live ou documentaire artistique — conçue pour être vécue et ressentie collectivement.`,
        `La musique partagée en watch party crée instantanément une atmosphère commune. Les spectateurs ressentent ensemble les montées émotionnelles, découvrent les arrangements, et échangent leurs impressions dans le chat — transformant une écoute individuelle en moment de partage culturel intense.`,
        `Avant l'écoute, demandez : "Connaissez-vous déjà ${subject} ?" et "Quel est votre style musical favori ?". Pendant la diffusion, encouragez les participants à signaler leurs passages préférés avec des emojis. À la fin, votez ensemble : "Quel moment de '${title.slice(0, 25)}…' a été votre coup de cœur ?"`,
      ],
      "Tech": [
        `Cette vidéo propose un contenu technique${dl ? ` de ${dl}` : ""}, réalisé par ${ch}. "${title}" aborde des thématiques liées à la technologie, au développement ou à l'innovation numérique — un sujet en constante évolution qui touche directement le quotidien professionnel et personnel de chaque participant.`,
        `Visionner ce contenu technologique en groupe permet de mettre en perspective les implications concrètes des sujets abordés. Les experts éclairent les nuances techniques tandis que les novices posent les questions que tout le monde se pose — une dynamique d'apprentissage mutuel rare et enrichissante.`,
        `Avant la session, demandez : "Quel est votre niveau avec ${subject} ?" et "Avez-vous déjà utilisé cette technologie ?". Pendant la vidéo, encouragez les questions techniques dans le chat. À la fin, débattez : "Comment ${subject} va-t-il impacter votre quotidien ou votre travail ?"`,
      ],
      "Sport": [
        `Cette vidéo présente un contenu sportif${dl ? ` de ${dl}` : ""}, proposé par ${ch}. "${title}" couvre un événement sportif, une analyse tactique ou des highlights — un format qui génère naturellement passion, débats et émotions partagées au sein du groupe.`,
        `Regarder du sport en groupe est l'une des expériences de partage les plus fédératrices. Chaque action décisive devient un événement collectif commenté en temps réel, renforçant les liens et la complicité entre participants.`,
        `Avant la diffusion, lancez un pronostic ou sondage sur ${subject}. Pendant le visionnage, activez les réactions à chaque moment fort. À la fin, analysez collectivement : "Quel aspect de '${title.slice(0, 25)}…' vous a le plus impressionné ?" et "Quelle décision tactique vous a le plus surpris ?"`,
      ],
      "Gaming": [
        `Cette vidéo présente un contenu gaming${dl ? ` de ${dl}` : ""}, publié par ${ch}. "${title}" propose une session de gameplay, une analyse stratégique ou la présentation d'un univers de jeu — un format qui crée une forte complicité entre spectateurs partageant la même passion du jeu vidéo.`,
        `Visionner du contenu gaming en watch party crée une dynamique comparable à celle d'un spectateur de sport. Les participants réagissent aux décisions du joueur, anticipent les événements et analysent les stratégies en temps réel — une expérience engageante pour les fans comme pour les curieux.`,
        `Avant la session, demandez : "Avez-vous déjà joué à ${subject} ?" et faites voter sur la stratégie attendue. Pendant le gameplay, réagissez dans le chat à chaque décision. À la fin : "Qu'auriez-vous fait différemment dans '${title.slice(0, 25)}…' ?" et "Quel aspect du gameplay vous a semblé le plus intéressant ?"`,
      ],
    };
    if (catData[cat]) {
      [p1, p2, p3] = catData[cat];
    } else {
      p1 = `Cette vidéo${dl ? ` d'une durée de ${dl}` : ""}, publiée par ${ch}, aborde le thème "${subject}". "${title}" propose un contenu engageant idéal pour un visionnage collectif en watch party, où chaque participant pourra réagir et partager ses impressions en temps réel.`;
      p2 = `Regarder cette vidéo ensemble permet à chaque participant de réagir, d'apporter son point de vue et d'enrichir l'expérience collective. La force d'un visionnage partagé réside dans la diversité des perspectives apportées par chaque membre du groupe.`;
      p3 = `Avant la diffusion de "${title.slice(0, 35)}…", brisez la glace : "Que connaissez-vous de ${subject} ?". Pendant le visionnage, encouragez les échanges dans le chat. À la fin : "Qu'avez-vous appris sur ${subject} que vous ne saviez pas ?" et "Ce contenu a-t-il changé votre point de vue sur ${subject} ?"`;
    }
  }

  const mins = (() => {
    const parts = (duration || "").split(":").map(Number);
    let s = 0;
    if (parts.length === 3) s = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) s = parts[0] * 60 + parts[1];
    return Math.floor(s / 60);
  })();

  const suitability =
    mins >= 5 && mins <= 90
      ? `Durée idéale de ${mins} min — parfait pour un watch party dynamique et engagé`
      : mins > 90
      ? `Long format de ${mins} min — prévoyez une pause interactive au milieu`
      : mins > 0
      ? `Format court de ${mins} min — idéal comme teaser ou intro de session`
      : "Contenu adapté à un visionnage collectif en watch party";

  // Sécurité : garantit que p1/p2/p3 ne sont jamais undefined
  const safeLine = (s: string | undefined, fallback: string) => (typeof s === "string" && s.length > 0) ? s : fallback;
  const safeP1 = safeLine(p1, `"${title}"${dl ? ` (${dl})` : ""} publié par ${ch}.`);
  const safeP2 = safeLine(p2, "Ce contenu est prêt à être diffusé en watch party. Chaque participant pourra réagir et partager ses impressions en temps réel dans le chat du salon.");
  const safeP3 = safeLine(p3, `Avant le lancement, posez une question d'amorce sur le thème de "${title.slice(0, 30)}…" pour lancer la discussion. Encouragez les échanges dans le chat pendant la diffusion, et organisez un débat à la fin.`);

  return {
    lines: [safeP1, safeP2, safeP3] as [string, string, string],
    keywords,
    watchPartySuitability: suitability,
    generatedBy: "title-analysis",
  };
}


// ─── oEmbed YouTube ───────────────────────────────────────────────────────────

async function fetchOEmbed(youtubeId: string): Promise<{
  title?: string;
  author_name?: string;
  author_url?: string;
} | null> {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`;
    const resp = await timedFetch(url, { mode: "cors" }, 5000);
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

// ─── Gemini — analyse directe de l'URL YouTube ───────────────────────────────

async function fetchGeminiVideoAnalysis(
  youtubeId: string,
  title: string,
  channel: string,
  duration: string,
  category: string
): Promise<AIVideoSummary | null> {
  if (!GEMINI_API_KEY) return null;

  const videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
  const dl = formatDur(duration);

  const prompt = `Tu es un expert en analyse de contenu YouTube pour une plateforme de watch party collaborative.

Analyse cette vidéo YouTube et génère un résumé PRECIS et DETAILLE de son VRAI CONTENU.

URL de la vidéo : ${videoUrl}
Titre officiel : "${title}"
Chaîne : "${channel || "inconnue"}"
Durée : "${dl || duration || "non précisée"}"
Catégorie détectée : "${category}"

Tu dois analyser cette vidéo et décrire avec précision :
- Ce qu'elle montre réellement (sujet, thèmes, format)
- Ce que le spectateur va apprendre ou découvrir
- Le style de la chaîne et du créateur
- Les points forts du contenu pour une watch party

Génère 3 PARAGRAPHES DETAILLES (3-4 phrases chacun) basés sur le VRAI CONTENU de cette vidéo.

Réponds UNIQUEMENT avec un objet JSON valide sans markdown :
{
  "line1": "Paragraphe 1 — LE VRAI SUJET : Décris précisément ce dont parle cette vidéo spécifique. Sois concret sur les thèmes, le format, ce qu'on va voir. 3-4 phrases détaillées.",
  "line2": "Paragraphe 2 — VALEUR POUR LE GROUPE : Explique ce que ce contenu spécifique apporte à un groupe de personnes qui le regardent ensemble. Quels débats, quelles émotions, quelles découvertes ? 3-4 phrases.",
  "line3": "Paragraphe 3 — ANIMATION PRECISE : Donne des conseils d'animation SPECIFIQUES à ce contenu — des questions précises liées aux thèmes de cette vidéo, des moments à anticiper, des angles de discussion adaptés au sujet. 3-4 phrases concrètes.",
  "keywords": ["motcle1", "motcle2", "motcle3", "motcle4", "motcle5", "motcle6"],
  "watchPartySuitability": "Évaluation courte de l'adéquation pour une watch party (1 phrase avec la durée)."
}`;

  try {
    const resp = await timedFetch(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 1200,
          },
        }),
      },
      15000
    );
    if (!resp.ok) return null;
    const result = await resp.json();
    const raw: string = result?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const p = JSON.parse(match[0]);
    if (!p.line1 || !p.line2 || !p.line3) return null;

    return {
      lines: [
        String(p.line1).trim(),
        String(p.line2).trim(),
        String(p.line3).trim(),
      ] as [string, string, string],
      keywords: Array.isArray(p.keywords) ? p.keywords.map(String).slice(0, 7) : [],
      watchPartySuitability: String(p.watchPartySuitability ?? "").trim(),
      generatedBy: "gemini",
    };
  } catch {
    return null;
  }
}

// ─── Construire VideoPreviewData ──────────────────────────────────────────────

function buildData(
  title: string,
  channelName: string,
  channelUrl: string,
  duration: string,
  youtubeId?: string,
  summary?: AIVideoSummary
): VideoPreviewData {
  return {
    realTitle: title,
    channelName,
    channelUrl,
    thumbnailUrl: youtubeId ? getThumbUrl(youtubeId) : "",
    category: detectVideoCategory(title),
    summary: summary ?? buildTitleAnalysis(title, channelName, duration, youtubeId),
  };
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useVideoAIPreview(
  youtubeId: string | undefined,
  fallbackTitle: string,
  duration: string
): UseVideoAIPreviewReturn {
  const [data, setData] = useState<VideoPreviewData>(() =>
    buildData(fallbackTitle, "", "", duration, youtubeId)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<"oembed" | "gemini" | "done" | "idle">("idle");
  const [error, setError] = useState<string | null>(null);

  const cancelRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    cancelRef.current = false;

    if (!youtubeId) {
      setData(buildData(fallbackTitle, "", "", duration));
      setIsLoading(false);
      setLoadingStep("done");
      return;
    }

    const cacheKey = `${youtubeId}:${GEMINI_API_KEY ? "gemini" : "title"}`;
    if (cache.has(cacheKey)) {
      setData(cache.get(cacheKey)!);
      setIsLoading(false);
      setLoadingStep("done");
      return;
    }

    // Afficher l'analyse du titre IMMÉDIATEMENT (jamais de placeholder)
    const titleSummary = buildTitleAnalysis(fallbackTitle, "", duration, youtubeId);
    setData(buildData(fallbackTitle, "", "", duration, youtubeId, titleSummary));
    setIsLoading(true);
    setError(null);
    setLoadingStep("oembed");

    const run = async () => {
      // ── Étape 1 : oEmbed (titre officiel + chaîne) ──
      const oembed = await fetchOEmbed(youtubeId);
      if (cancelRef.current) return;

      const realTitle   = oembed?.title?.trim() || fallbackTitle;
      const channelName = oembed?.author_name?.trim() || "";
      const channelUrl  = oembed?.author_url?.trim() || "";
      const category    = detectVideoCategory(realTitle);

      // Mise à jour avec le vrai titre — analyse du titre enrichie
      const enrichedTitleSummary = buildTitleAnalysis(realTitle, channelName, duration, youtubeId);
      const partialData = buildData(realTitle, channelName, channelUrl, duration, youtubeId, enrichedTitleSummary);

      if (!cancelRef.current && mountedRef.current) {
        setData(partialData);
        setLoadingStep("gemini");
      }

      // ── Étape 2 : Gemini (analyse le vrai contenu de la vidéo) ──
      let finalData = partialData;

      if (GEMINI_API_KEY && !cancelRef.current) {
        const gemResult = await fetchGeminiVideoAnalysis(
          youtubeId, realTitle, channelName, duration, category
        );
        if (gemResult && !cancelRef.current) {
          finalData = { ...partialData, summary: gemResult };
        }
      }

      if (cancelRef.current) return;

      cache.set(cacheKey, finalData);
      if (mountedRef.current) {
        setData(finalData);
        setIsLoading(false);
        setLoadingStep("done");
        setError(null);
      }
    };

    run().catch(() => {
      if (mountedRef.current) {
        setIsLoading(false);
        setLoadingStep("done");
      }
    });

    return () => { cancelRef.current = true; };
  }, [youtubeId, fallbackTitle, duration]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, isLoading, loadingStep, error };
}
