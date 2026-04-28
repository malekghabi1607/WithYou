# Diagramme de Gantt S6

Copie ce bloc dans un éditeur compatible Mermaid (GitHub, Obsidian, Mermaid Live Editor).

```mermaid
gantt
    title Planning Gantt S6 - WithYou
    dateFormat  YYYY-MM-DD
    axisFormat  %d/%m
    excludes    weekends


    section Cycle 1
    1. Réunion de lancement et définition des objectifs S6 :done, t1, 2026-02-01, 1d
    2. Répartition en sous-groupes et plan de travail :done, t2, after t1, 2026-02-02, 1d
    3. Audit du MVP existant (front/back/realtime) :done, t3, after t2, 2026-02-03, 2d
    4. Identification des contraintes techniques et UX :done, t4, after t3, 2026-02-05, 1d
    5. Étude Mode Cours interactif (objectifs et scénario) :done, t5, after t4, 2026-02-06, 2d
    6. Analyse des risques piste 1 (stratégique/technique/fonctionnel) :done, t6, after t5, 2026-02-08, 2d
    7. Étude Régie Vidéo avancée (cas d’usage) :done, t7, after t4, 2026-02-06, 2d
    8. Analyse des risques piste régie :done, t8, after t7, 2026-02-08, 2d
    9. Étude plateforme sécurisée (vision + cibles) :done, t9, after t4, 2026-02-06, 2d
    10. Analyse des risques piste 3 :done, t10, after t9, 2026-02-08, 2d
    11. Comparaison globale des 3 pistes :done, t11, after t6, 2026-02-10, 1d
    12. Décision finale - piste régie principale + piste secondaire partielle :done, t12, after t11, 2026-02-11, 1d
    13. Rédaction rapport cycle 1 (chapitres + figures) :done, t13, after t12, 2026-02-12, 4d
    14. Relecture, corrections et dépôt rapport cycle 1 :done, t14, after t13, 2026-02-16, 1d

    section Cycle 2
    15. Définition architecture prototype cycle 2 :done, t15, after t14, 2026-02-17, 2d
    16. Spécification flux realtime vidéo :done, t16, after t15, 2026-02-19, 1d
    17. Implémentation contrôle régie de base (play/pause) :done, t17, after t16, 2026-02-20, 2d
    18. Implémentation seek/changement vidéo :done, t18, after t17, 2026-02-22, 2d
    19. Broadcast état vidéo (temps/statut/videoId) :done, t19, after t16, 2026-02-22, 3d
    20. Recalage clients spectateurs + corrections drift :done, t20, after t19, 2026-02-25, 3d
    21. CRUD playlist (ajout/suppression/changement courant) :done, t21, after t18, 2026-02-24, 5d
    22. Intégration auth Supabase (login/register/session) :done, t22, after t15, 2026-02-25, 4d
    23. Gestion rôles initiaux (admin/régie/membre) :done, t23, after t22, 2026-03-01, 2d
    24. Permissions de base chat/vidéo :done, t24, after t20, 2026-03-01, 4d
    25. Refonte partielle interface régie :done, t25, after t21, 2026-03-03, 4d
    26. Tests techniques du prototype :done, t26, after t20, 2026-03-07, 4d
    27. Corrections issues critiques prototype :done, t27, after t26, 2026-03-11, 3d
    28. Rédaction rapport cycle 2 :done, t28, after t27, 2026-03-14, 4d
    29. Finalisation et dépôt rapport cycle 2 :done, t29, after t28, 2026-03-18, 1d

    section Cycle 3
    30. Vote vidéo realtime (création, timer, votes invités) :done, t30, after t29, 2026-03-19, 4d
    31. Sélection auto de la vidéo gagnante :done, t31, after t30, 2026-03-23, 2d
    32. Transitions vidéo (cut/fade/slide/flash) :done, t32, after t29, 2026-03-21, 5d
    33. Countdown partagé 3-2-1-GO :done, t33, after t29, 2026-03-23, 3d
    34. Annonce régie live (overlay / commande admin-régie) :done, t34, after t29, 2026-03-24, 4d
    35. Historique des actions régie :done, t35, after t29, 2026-03-25, 6d
    36. Prévisualisation privée avant diffusion :done, t36, after t29, 2026-03-26, 6d
    37. Marque-pages vidéo (repères temporels) :done, t37, after t29, 2026-03-27, 6d
    38. Contrôle rapide -10s/+10s synchronisé :done, t38, after t29, 2026-03-30, 4d
    39. Voix live régie (WebRTC) :done, t39, after t29, 2026-03-28, 7d
    40. Stabilisation WebRTC (SDP/ICE/reco) :done, t40, after t39, 2026-04-04, 3d
    41. Mode Director (annotations live) :done, t41, after t29, 2026-04-01, 7d
    42. Zoom intelligent partagé :done, t42, after t29, 2026-04-03, 6d
    43. Sondage intelligent (manuel + IA) :done, t43, after t30, 2026-04-04, 7d
    44. Panneau preview IA vidéo :done, t44, after t29, 2026-04-05, 4d
    45. Questions de discussion IA :done, t45, after t44, 2026-04-09, 3d
    46. Panneau contenu du salon :done, t46, after t44, 2026-04-09, 4d
    47. Permissions granulaires finales (chat/video/playlist/polls/pin/mute) :done, t47, after t24, 2026-04-10, 6d
    48. Stabilisation des droits et propagation en temps réel :done, t48, after t47, 2026-04-16, 3d
    49. Gestion erreurs réseau (Load failed) et bruit console :done, t49, after t39, 2026-04-12, 5d
    50. Gestion erreurs messages 400/polling fallback :done, t50, after t49, 2026-04-14, 5d
    51. Résolution conflits intégration Git et réintégration features :done, t51, after t48, 2026-04-19, 3d
    52. Tests intégration bout-en-bout :active, t52, after t51, 2026-04-22, 4d
    53. Correction non-régressions finales :active, t53, after t52, 2026-04-26, 3d
    54. Mise à jour README + docs techniques + SQL :active, t54, after t53, 2026-04-24, 7d
    55. Préparation soutenance (slides + démo + script) :active, t55, after t54, 2026-04-26, 3d
    56. Répétition générale + validation scénario :t56, after t55, 2026-04-29, 1d
    57. Rendu final S6 + bilan équipe :t57, after t56, 2026-04-30, 1d
    58. Verrouillage de session (lock room + chat off + mode focus) :done, t58, after t29, 2026-03-24, 5d
    59. Question après vidéo (préparation régie + affichage auto fin lecture) :done, t59, after t44, 2026-04-09, 4d
    60. Lever la main / demandes de parole (gestion file d’attente régie) :t60, after t35, 2026-04-12, 5d
    61. Prise de parole audio complète liée aux demandes :t61, after t60, 2026-04-16, 3d
    62. Programme régie (enchaînement annonce -> countdown -> lecture) :active, t62, after t34, 2026-04-18, 6d
```
