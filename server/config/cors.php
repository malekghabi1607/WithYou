<?php

/**
 * --------------------------------------------------------------------------
 * CORS Configuration
 * --------------------------------------------------------------------------
 *
 * Ce fichier configure la politique CORS (Cross-Origin Resource Sharing)
 * de l’application Laravel.
 *
 * Il permet d’autoriser le front-end (Vite / React) à communiquer avec
 * l’API Laravel depuis un domaine différent (localhost:5173),
 * tout en conservant un niveau de sécurité correct.
 *
 * Cette configuration est indispensable pour :
 *  - les requêtes API classiques (auth, salons, messages, etc.)
 *  - l’authentification JWT via le header Authorization
 *  - l’authentification des canaux privés pour le temps réel (Reverb)
 *
 * Routes concernées :
 *  - /api/*
 *  - /broadcasting/auth (Echo / Reverb)
 *
 * En environnement de production, les origines autorisées devront être
 * restreintes aux domaines officiels de l’application.
 */

return [
    'paths' => ['api/*', 'broadcasting/*', 'api/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];