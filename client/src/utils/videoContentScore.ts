/**
 * Projet : WithYou
 * Fichier : utils/videoContentScore.ts
 *
 * Description :
 * Utilitaire IA — Calcul d'une note de qualité pour chaque vidéo de la playlist.
 * Critères : durée adaptée, pertinence du titre, détection contenu potentiellement inapproprié.
 * Retourne un score 0-100, un label, un breakdown par critère et une alerte éventuelle.
 */

export interface ContentScoreBreakdown {
  duration: number;     // 0-40 pts
  relevance: number;    // 0-40 pts
  watchParty: number;   // 0-20 pts
}

export interface ContentScore {
  score: number;
  label: "Excellent" | "Bon" | "Moyen" | "À vérifier";
  color: "green" | "yellow" | "orange" | "red";
  breakdown: ContentScoreBreakdown;
  alert: string | null;
  summary: string;
}

// Mots-clés indiquant contenu potentiellement inapproprié
const INAPPROPRIATE_KEYWORDS = [
  "violence", "gore", "nsfw", "explicit", "adult", "18+", "xxx",
  "horreur extreme", "torture", "snuff", "shock", "graphic",
];

// Mots-clés indiquant un bon contenu pour watch party
const WATCH_PARTY_KEYWORDS = [
  "film", "movie", "cinéma", "cinema", "documentary", "documentaire",
  "série", "series", "débat", "debate", "interview", "concert",
  "animation", "comédie", "comedy", "thriller", "drama", "drame",
  "compilation", "best of", "live", "performance", "show",
];

// Catégories détectées par mots-clés dans le titre
const CATEGORIES: { keywords: string[]; category: string }[] = [
  { keywords: ["film", "movie", "cinema", "cinéma"], category: "Cinéma" },
  { keywords: ["documentaire", "documentary", "reportage"], category: "Documentaire" },
  { keywords: ["musique", "music", "concert", "live"], category: "Musique" },
  { keywords: ["sport", "football", "basket", "tennis"], category: "Sport" },
  { keywords: ["gaming", "game", "jeu", "esport"], category: "Gaming" },
  { keywords: ["science", "tech", "technology", "code", "dev"], category: "Tech" },
  { keywords: ["comédie", "comedy", "humour", "drôle"], category: "Comédie" },
  { keywords: ["débat", "debate", "politique", "news"], category: "Débat" },
  { keywords: ["nature", "animal", "wildlife"], category: "Nature" },
  { keywords: ["art", "culture", "histoire", "history"], category: "Culture" },
];

/**
 * Convertit une durée string (ex: "1:45:30" ou "15:30" ou "90") en secondes
 */
function parseDurationToSeconds(duration: string): number {
  if (!duration || duration === "0:00") return 0;
  const parts = duration.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return Number(duration) || 0;
}

/**
 * Score de durée (0-40 pts)
 * Idéal pour watch party : 5–90 minutes
 * Trop court (< 2 min) ou trop long (> 3h) pénalisé
 */
function scoreDuration(durationStr: string): number {
  const seconds = parseDurationToSeconds(durationStr);
  if (seconds === 0) return 20; // durée inconnue → neutre

  const minutes = seconds / 60;

  if (minutes >= 5 && minutes <= 90) return 40;
  if (minutes >= 2 && minutes < 5) return 30;
  if (minutes > 90 && minutes <= 150) return 30;
  if (minutes > 150 && minutes <= 210) return 20;
  if (minutes > 210) return 10;
  return 15; // < 2 min
}

/**
 * Score de pertinence/qualité (0-40 pts)
 * Basé sur le titre et la présence de mots-clés positifs
 */
function scoreRelevance(title: string): number {
  const lower = title.toLowerCase();
  let score = 25; // base

  // Bonus mots watch party
  for (const kw of WATCH_PARTY_KEYWORDS) {
    if (lower.includes(kw)) {
      score += 5;
      break;
    }
  }

  // Bonus titre de qualité (longueur raisonnable, pas de caps lock excessif)
  if (title.length >= 10 && title.length <= 80) score += 5;
  if (title === title.toUpperCase() && title.length > 10) score -= 10; // CAPS LOCK

  // Bonus catégorie reconnue
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((kw) => lower.includes(kw))) {
      score += 5;
      break;
    }
  }

  return Math.min(40, Math.max(0, score));
}

/**
 * Score watch party bonus (0-20 pts)
 * Basé sur les mots-clés et l'ID YouTube (simulé)
 */
function scoreWatchParty(title: string, youtubeId?: string): number {
  const lower = title.toLowerCase();
  let score = 10; // base

  for (const kw of WATCH_PARTY_KEYWORDS) {
    if (lower.includes(kw)) {
      score += 5;
      break;
    }
  }

  // Heuristique sur l'ID (IDs plus courts = souvent contenu officiel)
  if (youtubeId && youtubeId.length === 11) score += 5;

  return Math.min(20, Math.max(0, score));
}

/**
 * Détecte les mots-clés inappropriés dans le titre
 */
function detectInappropriateContent(title: string): string | null {
  const lower = title.toLowerCase();
  for (const kw of INAPPROPRIATE_KEYWORDS) {
    if (lower.includes(kw)) {
      return `Le titre contient le terme "${kw}" — vérifiez le contenu avant de diffuser.`;
    }
  }
  return null;
}

/**
 * Détecte la catégorie probable de la vidéo
 */
export function detectVideoCategory(title: string): string {
  const lower = title.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((kw) => lower.includes(kw))) {
      return cat.category;
    }
  }
  return "Général";
}

/**
 * Fonction principale : calcule le score de contenu d'une vidéo
 */
export function computeContentScore(video: {
  title: string;
  duration: string;
  youtubeId?: string;
}): ContentScore {
  const breakdown: ContentScoreBreakdown = {
    duration: scoreDuration(video.duration),
    relevance: scoreRelevance(video.title),
    watchParty: scoreWatchParty(video.title, video.youtubeId),
  };

  const score = breakdown.duration + breakdown.relevance + breakdown.watchParty;
  const alert = detectInappropriateContent(video.title);

  let label: ContentScore["label"];
  let color: ContentScore["color"];

  if (score >= 80) { label = "Excellent"; color = "green"; }
  else if (score >= 60) { label = "Bon"; color = "yellow"; }
  else if (score >= 40) { label = "Moyen"; color = "orange"; }
  else { label = "À vérifier"; color = "red"; }

  const category = detectVideoCategory(video.title);
  const durationSeconds = parseDurationToSeconds(video.duration);
  const durationLabel = durationSeconds > 0
    ? `${Math.floor(durationSeconds / 60)} min`
    : "durée inconnue";

  const summary = [
    `Catégorie détectée : ${category}.`,
    `Durée de ${durationLabel} — ${breakdown.duration >= 35 ? "idéale" : breakdown.duration >= 25 ? "acceptable" : "courte"} pour un watch party.`,
    alert
      ? `⚠️ Contenu potentiellement sensible détecté.`
      : `Contenu adapté à la diffusion collective.`,
  ].join(" ");

  return { score, label, color, breakdown, alert, summary };
}

/**
 * Génère un résumé en 3 lignes pour le panneau de preview (feature D)
 */
export function generateVideoSummary(video: {
  title: string;
  duration: string;
  youtubeId?: string;
}): [string, string, string] {
  const category = detectVideoCategory(video.title);
  const durationSeconds = parseDurationToSeconds(video.duration);
  const durationLabel = durationSeconds > 0
    ? `${Math.floor(durationSeconds / 60)} min`
    : "durée variable";

  const lines: [string, string, string] = [
    `📌 ${category} · ${durationLabel} de contenu prêt à être diffusé.`,
    `🎯 Ce contenu est adapté pour un visionnage collectif. Les participants pourront réagir et discuter en direct.`,
    `💡 Conseil : activez les sous-titres live et préparez quelques questions de discussion pour animer le chat.`,
  ];

  return lines;
}

/**
 * Génère 3 questions de discussion contextualisées (feature E)
 */
export function generateDiscussionQuestions(video: {
  title: string;
  duration: string;
  youtubeId?: string;
}): [string, string, string] {
  const category = detectVideoCategory(video.title);
  const title = video.title;

  const questionsByCategory: Record<string, [string, string, string]> = {
    Cinéma: [
      `🎬 Que pensez-vous de la mise en scène dans "${title}" ?`,
      `🎭 Quel est votre personnage ou moment préféré jusqu'ici ?`,
      `💭 Ce film vous rappelle-t-il d'autres œuvres similaires ?`,
    ],
    Documentaire: [
      `📖 Quelle information de "${title}" vous a le plus surpris(e) ?`,
      `🌍 Comment ce documentaire change-t-il votre perception du sujet ?`,
      `💡 Quelles actions concrètes pourrait-on prendre après avoir vu cela ?`,
    ],
    Musique: [
      `🎵 Quel moment musical de "${title}" vous a le plus marqué(e) ?`,
      `🎤 Connaissiez-vous cet artiste avant ce soir ?`,
      `🎶 Cette musique vous donne-t-elle envie de découvrir d'autres œuvres similaires ?`,
    ],
    Sport: [
      `⚽ Quel est votre moment fort dans ce match / performance ?`,
      `🏆 Pensez-vous que "${title}" marque un tournant dans ce sport ?`,
      `💪 Qu'est-ce que cette performance vous inspire personnellement ?`,
    ],
    Gaming: [
      `🎮 Avez-vous déjà joué à ce jeu ? Votre avis ?`,
      `🕹️ Quelle stratégie vous semble la plus efficace dans "${title}" ?`,
      `🔥 Quel autre jeu recommanderiez-vous aux fans de cette vidéo ?`,
    ],
    Tech: [
      `💻 Pensez-vous que cette technologie va changer votre quotidien ?`,
      `🚀 Quelles sont les limites et opportunités présentées dans "${title}" ?`,
      `🤔 Êtes-vous optimiste ou pessimiste face à cette évolution ?`,
    ],
    Comédie: [
      `😂 Quel moment vous a le plus fait rire dans "${title}" ?`,
      `🎭 Est-ce que l'humour de cette vidéo est universel ou culturellement spécifique ?`,
      `😄 Avez-vous une anecdote personnelle liée à ce sujet comique ?`,
    ],
    Débat: [
      `🗣️ Êtes-vous d'accord avec les arguments présentés dans "${title}" ?`,
      `⚖️ Quel point de vue vous semble le plus convaincant ?`,
      `💡 Quels arguments auraient pu être ajoutés à ce débat ?`,
    ],
    Général: [
      `💬 Quelle est votre première impression sur "${title}" ?`,
      `🤝 Recommanderiez-vous cette vidéo à un ami ? Pourquoi ?`,
      `✨ Quel aspect de cette vidéo vous a le plus interpellé(e) ?`,
    ],
  };

  return questionsByCategory[category] ?? questionsByCategory["Général"];
}
