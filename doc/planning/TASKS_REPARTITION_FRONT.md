# TASKS_REPARTITION_FRONT — Projet WithYou

> 📌 Ce document décrit la répartition du travail **FRONTEND uniquement**  
> du projet WithYou.  
> Tous les fichiers du dossier `client/` sont listés explicitement.

---

## 👤 Développeuse 1 — Meriem

### 📄 Pages
- SignUpPage.tsx
- SignInPage.tsx
- ForgotPasswordPage.tsx
- EmailSentPage.tsx
- AccountConfirmedPage.tsx
- TermsPage.tsx
- TermsDialog.tsx
- PrivacyPage.tsx
- RoomRulesPage.tsx
- FAQPage.tsx
- AboutPage.tsx
- ContactPage.tsx

---

### ⚙️ Settings
- RoomPollSettings.tsx
- RoomPermissionsSettings.tsx
- RoomMembersSettings.tsx

---

### 🧱 Layouts
- Header.tsx
- Footer.tsx

---

### 🎨 UI
Composants UI utilisés dans ses pages, settings et layouts.

- accordion.tsx
- alert.tsx
- alert-dialog.tsx
- avatar.tsx
- badge.tsx
- button.tsx
- card.tsx
- checkbox.tsx
- dialog.tsx
- dropdown-menu.tsx
- form.tsx
- input.tsx
- label.tsx
- navigation-menu.tsx
- scroll-area.tsx
- separator.tsx
- sheet.tsx
- switch.tsx
- tabs.tsx
- textarea.tsx
- toggle.tsx
- tooltip.tsx
- Logo.tsx

---

### 🔌 API (Frontend)
- client/api/auth.ts
- client/api/rooms.ts
- client/api/index.ts

---

## 👤 Développeuse 2 — Malek

### 📄 Pages
- LandingPage.tsx
- SalonsPage.tsx
- PublicRoomsPage.tsx
- JoinRoomPage.tsx
- JoinWithCodePage.tsx
- CreateRoomPage.tsx
- RoomPage.tsx
- RoomLoadingPage.tsx
- RoomInfoPage.tsx
- RoomSettingsPage.tsx
- ManageVideosPage.tsx
- AdminVideoManagement.tsx
- ProfilePage.tsx

---

### 🏠 Composants Room
- ChatSection.tsx
- FunctionalChat.tsx
- EmptyStates.tsx
- ParticipantsPermissionsPanel.tsx
- PlaylistSection.tsx
- PollSection.tsx
- RoomInfoPanel.tsx
- RoomRatingPanel.tsx
- VideoManagementPanel.tsx
- VideoVotePanel.tsx
- YouTubePlayer.tsx

---

### 🎨 UI (restants)
Composants UI non utilisés par les pages de la Développeuse 1.

- aspect-ratio.tsx
- breadcrumb.tsx
- calendar.tsx
- carousel.tsx
- chart.tsx
- collapsible.tsx
- command.tsx
- context-menu.tsx
- drawer.tsx
- hover-card.tsx
- input-otp.tsx
- menubar.tsx
- pagination.tsx
- popover.tsx
- progress.tsx
- radio-group.tsx
- resizable.tsx
- select.tsx
- sidebar.tsx
- skeleton.tsx
- slider.tsx
- sonner.tsx
- table.tsx
- toggle-group.tsx
- use-mobile.ts
- utils.ts

---

### 🧭 App / Global
- AppRouter.tsx
- App.tsx
- main.tsx
- index.html

---

### 🛠 Utils
- utils.ts
- storage.ts
- roomStorage.ts
- voteStorage.ts
- youtube.ts

---

### 🎨 Styles
- globals.css

---

### 🧩 Figma
- ImageWithFallback.tsx

---

## 🤝 Travail en commun

### 🐛 Corrections de bugs
- Chaque développeur corrige les bugs dans ses fichiers
- Les bugs transversaux sont corrigés conjointement
- Validation avant merge obligatoire

> Les composants UI peuvent être partagés :
> s’ils sont créés par l’un, ils ne sont pas recréés par l’autre.

---

### 🧪 Tests
- Tests des pages
- Tests des composants UI
- Tests de la logique métier frontend
- Chaque développeur teste les fichiers qu’il développe

---

## ✅ Conclusion

Cette répartition couvre **l’intégralité du frontend** fichier par fichier  
et garantit une organisation claire, traçable et équitable du travail.

