/**
 * Projet : WithYou – Plateforme de visionnage collaboratif
 * Fichier : routes/AppRouter.tsx
 *
 * Description :
 * Fichier central du routage de l'application.
 * Déclare toutes les routes accessibles via React Router :
 *    - Pages publiques (Landing, Login, Register…)
 *    - Pages authentifiées (Room, Profil, Settings…)
 *
 * Rôle :
 *    - Associer chaque URL à une page (Vue complète)
 *    - Gérer les redirections
 *    - Protéger certaines routes si nécessaire
 */
/**
 * Projet : WithYou
 * Fichier : routes/AppRouter.tsx
 *
 * Description :
 * Routeur principal de l'application WithYou.
 * Gère toutes les routes et la navigation entre les pages.
 * Gère :
 *  - L'authentification utilisateur (localStorage)
 *  - Les routes protégées (connexion requise)
 *  - Les routes publiques (accueil, inscription, connexion)
 *  - La gestion du thème clair/sombre
 *  - La persistance des données utilisateur
 *  - Les redirections automatiques
 *
 * Utilisé dans App.tsx comme composant principal de routing.
 */

import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster, toast } from "sonner";

// Pages
import LandingPage from "../pages/LandingPage";
import { SignInPage } from '../pages/SignInPage';
import { SignUpPage } from '../pages/SignUpPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { EmailSentPage } from '../pages/EmailSentPage';
import { AccountConfirmedPage } from '../pages/AccountConfirmedPage';
import { SalonsPage } from '../pages/SalonsPage';
import { CreateRoomPage } from '../pages/CreateRoomPage';
import { JoinRoomPage } from '../pages/JoinRoomPage';
import { JoinWithCodePage } from '../pages/JoinWithCodePage';
import { PublicRoomsPage } from '../pages/PublicRoomsPage';
import { RoomLoadingPage } from '../pages/RoomLoadingPage';
import { RoomPage } from '../pages/RoomPage';
import { RoomInfoPage } from '../pages/RoomInfoPage';
import { RoomSettingsPage } from '../pages/RoomSettingsPage';
import { RoomRulesPage } from '../pages/RoomRulesPage';
import { ProfilePage } from '../pages/ProfilePage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { FAQPage } from '../pages/FAQPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { TermsPage } from '../pages/TermsPage';

// Wrappers pour les pages avec paramètres d'URL
function RoomPageWrapper() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; id: string } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [roomData, setRoomData] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      // Ajouter un ID si manquant
      setCurrentUser({
        ...user,
        id: user.id || user.email || 'current'
      });
    }
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // SÉCURITÉ : Vérifier si l'utilisateur a accepté les règles
    if (roomId) {
      const acceptedRules = localStorage.getItem(`room_rules_accepted_${roomId}`);
      if (acceptedRules !== 'true') {
        // Si les règles n'ont pas été acceptées, rediriger vers la page des règles
        navigate(`/room/${roomId}/rules`, { replace: true });
        return;
      }

      // Charger les informations du salon depuis localStorage
      const rooms = localStorage.getItem('withyou_rooms');
      if (rooms) {
        const allRooms = JSON.parse(rooms);
        const room = allRooms.find((r: any) => r.id === roomId);
        if (room) {
          setRoomData(room);
        }
      }
    }
  }, [roomId, navigate]);

  const handleNavigate = (page: string) => {
    const routes: { [key: string]: string } = {
      'home': '/',
      'salons': '/salons',
      'profile': '/profile',
    };
    navigate(routes[page] || '/');
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!currentUser || !roomId) return null;

  return (
    <RoomPage
      roomId={roomId}
      roomName={roomData?.name}
      roomCreator={roomData?.creatorEmail}
      currentUser={currentUser}
      onNavigate={handleNavigate}
      theme={theme}
      onThemeToggle={handleThemeToggle}
    />
  );
}

function RoomLoadingPageWrapper() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const handleLoadComplete = () => {
    if (roomId) {
      // Rediriger vers la page des règles au lieu du salon directement
      navigate(`/room/${roomId}/rules`);
    }
  };

  return <RoomLoadingPage onLoadComplete={handleLoadComplete} />;
}

function RoomInfoPageWrapper() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleNavigate = (page: string, targetRoomId?: string) => {
    if (page === 'room' && targetRoomId) {
      // Rediriger vers la page de chargement qui redirigera vers les règles
      navigate(`/room-loading/${targetRoomId}`);
    } else {
      navigate(`/${page}`);
    }
  };

  const handleJoinRoom = (targetRoomId: string) => {
    // Toujours passer par la page de chargement qui redirige vers les règles
    navigate(`/room-loading/${targetRoomId}`);
  };

  if (!roomId) return null;

  return (
    <RoomInfoPage
      roomId={roomId}
      currentUser={currentUser}
      onNavigate={handleNavigate}
      onJoinRoom={handleJoinRoom}
      theme={theme}
    />
  );
}

function RoomSettingsPageWrapper() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };

  if (!currentUser || !roomId) return null;

  return (
    <RoomSettingsPage
      roomId={roomId}
      currentUser={currentUser}
      onNavigate={handleNavigate}
      theme={theme}
    />
  );
}

function RoomRulesPageWrapper() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [roomName, setRoomName] = useState<string>('');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Charger le nom du salon depuis localStorage
    if (roomId) {
      const rooms = localStorage.getItem('withyou_rooms');
      if (rooms) {
        const allRooms = JSON.parse(rooms);
        const room = allRooms.find((r: any) => r.id === roomId);
        if (room) {
          setRoomName(room.name);
        }
      }
    }

    // Vérifier si l'utilisateur a déjà accepté les règles pour ce salon
    if (roomId) {
      const acceptedRules = localStorage.getItem(`room_rules_accepted_${roomId}`);
      if (acceptedRules === 'true') {
        // Si les règles ont déjà été acceptées, rediriger directement vers le salon
        navigate(`/room/${roomId}`, { replace: true });
      }
    }
  }, [roomId, navigate]);

  const handleAccept = () => {
    if (roomId) {
      // Sauvegarder l'acceptation des règles dans le localStorage
      localStorage.setItem(`room_rules_accepted_${roomId}`, 'true');
      navigate(`/room/${roomId}`);
    }
  };

  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
  };

  if (!roomId) return null;

  return (
    <RoomRulesPage
      roomId={roomId}
      roomName={roomName}
      onAccept={handleAccept}
      onNavigate={handleNavigate}
      theme={theme}
    />
  );
}

function AppContent() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [pendingEmail, setPendingEmail] = useState<string>('');

  useEffect(() => {
    // Charger le thème depuis le localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }

    // Charger l'utilisateur depuis le localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleNavigate = (page: string, data?: any) => {
    const routes: { [key: string]: string } = {
      'home': '/',
      'signin': '/signin',
      'signup': '/signup',
      'forgot-password': '/forgot-password',
      'email-sent': '/email-sent',
      'account-confirmed': '/account-confirmed',
      'rooms': '/salons',
      'salons': '/salons',
      'create-room': '/create-room',
      'join-room': '/join-room',
      'join-with-code': '/join-with-code',
      'public-rooms': '/public-rooms',
      'profile': '/profile',
      'about': '/about',
      'contact': '/contact',
      'faq': '/faq',
      'privacy': '/privacy',
      'terms': '/terms',
    };
    
    // Gérer les routes spéciales avec roomId
    if (page === 'room-info' && data?.roomId) {
      navigate(`/room/${data.roomId}/info`);
    } else if (page === 'room-settings' && data?.roomId) {
      navigate(`/room/${data.roomId}/settings`);
    } else if (page === 'room-rules' && data?.roomId) {
      navigate(`/room/${data.roomId}/rules`);
    } else if (page === 'room-loading' && data?.roomId) {
      // Rediriger vers la page de chargement qui redirigera vers les règles
      navigate(`/room-loading/${data.roomId}`);
    } else if (page === 'room' && data?.roomId) {
      // Ne JAMAIS aller directement au salon, toujours passer par room-loading
      navigate(`/room-loading/${data.roomId}`);
    } else if (data?.roomId) {
      // Par défaut, si on a un roomId, passer par room-loading
      navigate(`/room-loading/${data.roomId}`);
    } else {
      // Routes simples sans paramètres
      navigate(routes[page] || '/');
    }
  };

  const handleSignIn = (email: string, name: string) => {
    const user = { email, name };
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleSignUp = (email: string, name: string) => {
    setPendingEmail(email);
    navigate('/email-sent');
  };

  const handleCreateRoom = (roomData: any) => {
    // Logique de création de salon
    navigate(`/room-loading/${roomData.id || '1'}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const isAuthenticated = currentUser !== null;

  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Routes publiques */}
        <Route 
          path="/" 
          element={
            <LandingPage 
              onNavigate={handleNavigate}
              theme={theme}
              onThemeToggle={handleThemeToggle}
            />
          } 
        />
        <Route 
          path="/signin" 
          element={
            <SignInPage 
              onNavigate={handleNavigate}
              onSignIn={handleSignIn}
              theme={theme}
              onThemeToggle={handleThemeToggle}
            />
          } 
        />
        <Route 
          path="/signup" 
          element={
            <SignUpPage 
              onNavigate={handleNavigate}
              onSignUp={handleSignUp}
              theme={theme}
              onThemeToggle={handleThemeToggle}
            />
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            <ForgotPasswordPage 
              onNavigate={handleNavigate}
              theme={theme}
            />
          } 
        />
        <Route 
          path="/email-sent" 
          element={
            <EmailSentPage 
              email={pendingEmail}
              onNavigate={handleNavigate}
              theme={theme}
              onThemeToggle={handleThemeToggle}
            />
          } 
        />
        <Route 
          path="/account-confirmed" 
          element={
            <AccountConfirmedPage 
              onNavigate={handleNavigate}
              theme={theme}
              onThemeToggle={handleThemeToggle}
            />
          } 
        />
        
        {/* Pages légales */}
        <Route 
          path="/about" 
          element={
            <AboutPage 
              onNavigate={handleNavigate}
              currentUser={currentUser}
              onLogout={handleLogout}
              theme={theme}
              onThemeToggle={handleThemeToggle}
            />
          } 
        />
        <Route 
          path="/contact" 
          element={
            <ContactPage 
              onNavigate={handleNavigate}
              currentUser={currentUser}
              onLogout={handleLogout}
              theme={theme}
              onThemeToggle={handleThemeToggle}
            />
          } 
        />
        <Route 
          path="/faq" 
          element={
            <FAQPage 
              onNavigate={handleNavigate}
              currentUser={currentUser}
              onLogout={handleLogout}
              theme={theme}
              onThemeToggle={handleThemeToggle}
            />
          } 
        />
        <Route 
          path="/privacy" 
          element={
            <PrivacyPage 
              onNavigate={handleNavigate}
              currentUser={currentUser}
              onLogout={handleLogout}
              theme={theme}
              onThemeToggle={handleThemeToggle}
            />
          } 
        />
        <Route 
          path="/terms" 
          element={
            <TermsPage 
              onNavigate={handleNavigate}
              currentUser={currentUser}
              onLogout={handleLogout}
              theme={theme}
              onThemeToggle={handleThemeToggle}
            />
          } 
        />

        {/* Routes protégées */}
        <Route
          path="/salons"
          element={
            isAuthenticated ? (
              <SalonsPage 
                onNavigate={handleNavigate}
                currentUser={currentUser}
                onLogout={handleLogout}
                theme={theme}
                onThemeToggle={handleThemeToggle}
              />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/create-room"
          element={
            isAuthenticated && currentUser ? (
              <CreateRoomPage 
                currentUser={currentUser}
                onNavigate={handleNavigate}
                onCreateRoom={handleCreateRoom}
                theme={theme}
              />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/join-room"
          element={
            isAuthenticated ? (
              <JoinRoomPage 
                onNavigate={handleNavigate}
                currentUser={currentUser}
                theme={theme}
              />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/join-with-code"
          element={
            isAuthenticated ? (
              <JoinWithCodePage 
                roomId="1"
                onNavigate={handleNavigate}
                onJoinRoom={(roomId) => navigate(`/room-loading/${roomId}`)}
                theme={theme}
              />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/public-rooms"
          element={
            isAuthenticated ? (
              <PublicRoomsPage 
                onNavigate={handleNavigate}
                currentUser={currentUser}
                onSignOut={handleLogout}
                theme={theme}
                onThemeToggle={handleThemeToggle}
              />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/room-loading/:roomId"
          element={
            isAuthenticated ? (
              <RoomLoadingPageWrapper />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/room/:roomId"
          element={
            isAuthenticated ? (
              <RoomPageWrapper />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/room/:roomId/info"
          element={
            isAuthenticated ? (
              <RoomInfoPageWrapper />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/room/:roomId/settings"
          element={
            isAuthenticated ? (
              <RoomSettingsPageWrapper />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/room/:roomId/rules"
          element={
            isAuthenticated ? (
              <RoomRulesPageWrapper />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated && currentUser ? (
              <ProfilePage 
                currentUser={currentUser}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                theme={theme}
              />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export function AppRouter() {
  return <AppContent />;
}

export default AppRouter;

