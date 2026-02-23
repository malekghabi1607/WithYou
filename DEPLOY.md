# Deploiement (Render + Vercel)

Ce projet contient:
- `client/` (frontend React/Vite)
- `server/` (API Laravel)
- `realtime/` (service Socket.io)

Un blueprint Render est deja pret: `render.yaml`.

## 1) API Laravel sur Render

1. Push le repo sur GitHub.
2. Sur Render: `New +` -> `Blueprint` -> selectionne ton repo.
3. Render cree le service `withyou-api`.
4. Renseigne les variables d'environnement manquantes:
- `APP_URL` (URL publique du backend Render)
- `APP_KEY` (genere avec `php artisan key:generate --show` en local)
- `DB_HOST`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET` (genere une chaine aleatoire longue)
5. Lance les migrations une fois:
- Depuis le shell Render: `php artisan migrate --force`

## 2) Frontend Vite sur Render (dans le blueprint)

Le blueprint cree aussi `withyou-web` (site statique). Variables a renseigner:
- `VITE_API_URL` = URL du backend (`https://...withyou-api...`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_REVERB_APP_KEY` (si utilise)
- `VITE_REVERB_HOST` (si utilise)
- `VITE_REVERB_PORT` (si utilise)
- `VITE_REVERB_SCHEME` (si utilise)

## 3) Service realtime Socket.io (optionnel)

Le blueprint cree `withyou-realtime`.

Variables:
- `CORS_ORIGIN` = URL du frontend (ex: `https://ton-front.onrender.com`)

Le service ecoute automatiquement `process.env.PORT`.

## 4) Option Vercel pour le frontend (alternative)

Si tu preferes Vercel pour `client/`:
- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Variables: meme liste `VITE_*` que ci-dessus

## 5) Important pour la prod

- Restreindre CORS backend dans `server/config/cors.php` (eviter `*`).
- Ne jamais commiter des secrets (`APP_KEY`, `JWT_SECRET`, tokens prives).
