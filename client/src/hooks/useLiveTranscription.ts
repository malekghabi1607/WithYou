/**
 * Projet : WithYou
 * Fichier : hooks/useLiveTranscription.ts
 *
 * Description :
 * Hook React gérant la transcription audio en temps réel via la Web Speech API native.
 * Aucune clé API requise — utilise SpeechRecognition (Chrome/Edge/Safari).
 * Retourne le transcript courant, les mots-clés détectés, et les contrôles start/stop.
 *
 * Feature F — Transcription live avec mots-clés surlignés.
 */

import { useState, useRef, useCallback, useEffect } from "react";

// Mots-clés à surligner dans les sous-titres
const HIGHLIGHT_KEYWORDS = [
  // Cinéma / Médias
  "film", "vidéo", "image", "scène", "acteur", "réalisateur", "musique",
  // Émotions
  "important", "essentiel", "incroyable", "extraordinaire", "unique",
  // Tech
  "intelligence", "artificielle", "données", "algorithme", "système",
  // Société
  "monde", "société", "culture", "histoire", "peuple", "humain",
  // Actions
  "créer", "développer", "montrer", "expliquer", "découvrir", "analyser",
  // Mots français courants intéressants
  "problème", "solution", "résultat", "rapport", "question", "réponse",
  "exemple", "moment", "première", "dernière", "nouveau", "grand",
];

export interface TranscriptionWord {
  word: string;
  isKeyword: boolean;
}

export interface UseLiveTranscriptionReturn {
  isSupported: boolean;
  isActive: boolean;
  isListening: boolean;
  transcript: string;
  words: TranscriptionWord[];
  toggle: () => void;
  stop: () => void;
  error: string | null;
}

// Déclaration globale pour TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

function parseTranscriptToWords(transcript: string): TranscriptionWord[] {
  if (!transcript) return [];
  return transcript.split(/\s+/).map((word) => {
    const clean = word.toLowerCase().replace(/[^a-zàâäéèêëîïôùûü]/gi, "");
    const isKeyword = HIGHLIGHT_KEYWORDS.some(
      (kw) => clean === kw || clean.startsWith(kw)
    );
    return { word, isKeyword };
  });
}

export function useLiveTranscription(lang = "fr-FR"): UseLiveTranscriptionReturn {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [words, setWords] = useState<TranscriptionWord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isActiveRef = useRef(false);

  const isSupported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const createRecognition = useCallback((): SpeechRecognition | null => {
    if (!isSupported) return null;

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognitionClass();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart si toujours actif
      if (isActiveRef.current) {
        try {
          recognition.start();
        } catch {
          // Ignore restart errors
        }
      }
    };

    recognition.onerror = (event) => {
      // "no-speech" est normal, on ignore
      if (event.error === "no-speech") return;
      if (event.error === "aborted") return;

      const errorMessages: Record<string, string> = {
        "not-allowed": "Accès au microphone refusé. Autorisez l'accès dans les paramètres du navigateur.",
        "network": "Erreur réseau lors de la transcription.",
        "audio-capture": "Impossible de capturer l'audio. Vérifiez votre microphone.",
        "service-not-allowed": "Service de transcription non disponible.",
      };

      setError(errorMessages[event.error] || `Erreur transcription : ${event.error}`);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + " ";
        } else {
          interimText += result[0].transcript;
        }
      }

      const combined = (finalText + interimText).trim();
      // Garder uniquement les 100 derniers mots pour éviter overflow
      const allWords = combined.split(/\s+/);
      const recent = allWords.slice(-100).join(" ");

      setTranscript(recent);
      setWords(parseTranscriptToWords(recent));
    };

    return recognition;
  }, [isSupported, lang]);

  const stop = useCallback(() => {
    isActiveRef.current = false;
    setIsActive(false);
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
      recognitionRef.current = null;
    }
    setTranscript("");
    setWords([]);
    setError(null);
  }, []);

  const toggle = useCallback(() => {
    if (isActiveRef.current) {
      stop();
    } else {
      const recognition = createRecognition();
      if (!recognition) {
        setError("La transcription n'est pas supportée par votre navigateur.");
        return;
      }
      recognitionRef.current = recognition;
      isActiveRef.current = true;
      setIsActive(true);
      setTranscript("");
      setWords([]);
      try {
        recognition.start();
      } catch (e) {
        setError("Impossible de démarrer la transcription.");
        isActiveRef.current = false;
        setIsActive(false);
      }
    }
  }, [createRecognition, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isActiveRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { /* ignore */ }
      }
    };
  }, []);

  return {
    isSupported,
    isActive,
    isListening,
    transcript,
    words,
    toggle,
    stop,
    error,
  };
}
