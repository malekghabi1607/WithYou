# ARCHITECTURE_FRONT — Projet WithYou

> 📌 Ce document décrit **uniquement l’architecture FRONTEND** du projet WithYou.  
> Il liste **tous les fichiers frontend** et leur rôle principal.

---

## 📁 client/

Dossier racine du frontend (React + Vite + Tailwind).

---

## 📁 client/api/

Couche API côté frontend (appels vers le backend).

- `auth.ts` — Authentification (login, register, session)
- `rooms.ts` — Gestion des salons (CRUD, playlists, messages)
- `index.ts` — Export centralisé des fonctions API

---

## 📁 client/components/

Composants réutilisables de l’application.

---

### 📁 components/layouts/

Layouts globaux utilisés par les pages.

- `Header.tsx` — En-tête et navigation
- `Footer.tsx` — Pied de page
- `MainLayout.tsx` — Structure globale des pages
- `index.ts` — Exports des layouts

---

### 📁 components/ui/

Design System (composants UI réutilisables).

- `accordion.tsx`
- `alert.tsx`
- `alert-dialog.tsx`
- `aspect-ratio.tsx`
- `avatar.tsx`
- `badge.tsx`
- `breadcrumb.tsx`
- `button.tsx`
- `calendar.tsx`
- `card.tsx`
- `carousel.tsx`
- `chart.tsx`
- `checkbox.tsx`
- `collapsible.tsx`
- `command.tsx`
- `context-menu.tsx`
- `dialog.tsx`
- `drawer.tsx`
- `dropdown-menu.tsx`
- `form.tsx`
- `hover-card.tsx`
- `input.tsx`
- `input-otp.tsx`
- `label.tsx`
- `Logo.tsx`
- `menubar.tsx`
- `navigation-menu.tsx`
- `pagination.tsx`
- `popover.tsx`
- `progress.tsx`
- `radio-group.tsx`
- `resizable.tsx`
- `scroll-area.tsx`
- `select.tsx`
- `separator.tsx`
- `sheet.tsx`
- `sidebar.tsx`
- `skeleton.tsx`
- `slider.tsx`
- `sonner.tsx`
- `switch.tsx`
- `table.tsx`
- `tabs.tsx`
- `textarea.tsx`
- `toggle.tsx`
- `toggle-group.tsx`
- `tooltip.tsx`
- `use-mobile.ts`
- `utils.ts`

---

### 📁 components/room/

Composants métier liés aux salons.

- `ChatSection.tsx`
- `FunctionalChat.tsx`
- `EmptyStates.tsx`
- `ParticipantsPermissionsPanel.tsx`
- `PlaylistSection.tsx`
- `PollSection.tsx`
- `RoomInfoPanel.tsx`
- `RoomRatingPanel.tsx`
- `VideoManagementPanel.tsx`
- `VideoVotePanel.tsx`
- `YouTubePlayer.tsx`

---

### 📁 components/settings/

Paramètres des salons.

- `RoomMembersSettings.tsx`
- `RoomPermissionsSettings.tsx`
- `RoomPollSettings.tsx`

---

### 📁 components/figma/

Composants liés à la maquette.

- `ImageWithFallback.tsx`

---

## 📁 client/pages/

Pages complètes accessibles via la navigation.

- `SignInPage.tsx`
- `SignUpPage.tsx`
- `ForgotPasswordPage.tsx`
- `EmailSentPage.tsx`
- `AccountConfirmedPage.tsx`
- `LandingPage.tsx`
- `SalonsPage.tsx`
- `PublicRoomsPage.tsx`
- `JoinRoomPage.tsx`
- `JoinWithCodePage.tsx`
- `CreateRoomPage.tsx`
- `RoomPage.tsx`
- `RoomLoadingPage.tsx`
- `RoomInfoPage.tsx`
- `RoomSettingsPage.tsx`
- `ManageVideosPage.tsx`
- `AdminVideoManagement.tsx`
- `ProfilePage.tsx`
- `FAQPage.tsx`
- `AboutPage.tsx`
- `ContactPage.tsx`
- `TermsPage.tsx`
- `TermsDialog.tsx`
- `PrivacyPage.tsx`
- `RoomRulesPage.tsx`

---

## 📁 client/routes/

Gestion de la navigation.

- `AppRouter.tsx`

---

## 📁 client/styles/

Styles globaux et thèmes.

- `globals.css`

---

## 📁 client/utils/

Fonctions utilitaires et logique transverse.

- `utils.ts`
- `storage.ts`
- `roomStorage.ts`
- `voteStorage.ts`
- `youtube.ts`

---

## 📁 client/ (racine)

Points d’entrée de l’application.

- `App.tsx`
- `main.tsx`
- `index.html`

---

## ✅ Conclusion

Cette architecture frontend est organisée par responsabilité  
(UI, pages, logique métier, navigation), ce qui facilite  
le travail en équipe et la maintenance du projet.
