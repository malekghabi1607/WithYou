import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { toast } from 'sonner';

export interface Message {
  id: string;
  room_id: string;
  user_name: string; // ou user_id selon ta table
  content: string;
  created_at: string;
  is_emoji?: boolean;
}

export function useChat(roomId: string, userName: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    // 1. Charger l'historique des messages existants
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages') // Assure-toi que ta table s'appelle 'messages'
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        
        if (data) {
          setMessages(data as Message[]);
        }
      } catch (error) {
        console.error('Erreur chargement messages:', error);
        toast.error("Impossible de charger l'historique du chat");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // 2. S'abonner aux nouveaux messages en temps réel
    const channel = supabase
      .channel(`room-chat-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT', // On écoute uniquement les nouveaux messages
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`, // Filtre pour ne recevoir que ceux de ce salon
        },
        (payload) => {
          // Quand un message arrive, on l'ajoute à la liste
          const newMessage = payload.new as Message;
          setMessages((current) => [...current, newMessage]);
        }
      )
      .subscribe();

    // Nettoyage quand on quitte le salon
    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // 3. Fonction pour envoyer un message
  const sendMessage = async (text: string, isEmoji = false) => {
    if (!text.trim()) return;

    // On insère dans Supabase. 
    // PAS besoin de mettre à jour le state local ici (setMessages), 
    // car l'abonnement realtime (étape 2) va recevoir l'événement et mettre à jour l'UI.
    // Cela garantit que si le message s'affiche, c'est qu'il est bien en base.
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            room_id: roomId,
            user_name: userName,
            content: text,
            is_emoji: isEmoji,
            // created_at est souvent géré par défaut par Supabase (now())
          },
        ]);

      if (error) throw error;
      
    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  return {
    messages,
    loading,
    sendMessage
  };
}