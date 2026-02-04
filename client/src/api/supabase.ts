import { createClient } from '@supabase/supabase-js';

// Récupération des variables d'environnement
// Assure-toi d'avoir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans ton fichier .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Les variables d'environnement Supabase sont manquantes !");
  throw new Error("Configuration Supabase manquante. Vérifiez votre fichier .env");
}

// Création du client unique
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: { persistSession: true }
});