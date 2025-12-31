
/**
 * Projet : WithYou
 * Fichier : components/room/ChatSection.tsx
 *
 * Description :
 * Composant principal du chat d’un salon.
 * Il permet aux participants d’échanger des messages en temps réel
 * pendant le visionnage d’une vidéo.
 *
 * Fonctionnalités :
 * - Affichage des messages avec auteur et heure
 * - Envoi de messages texte et d’emojis
 * - Réactions par emoji sur les messages
 * - Scroll automatique vers le dernier message
 * - Désactivation du chat par l’administrateur
 *
 * UX / UI :
 * - Différenciation visuelle entre ses messages et ceux des autres
 * - Messages emoji affichés en grand format
 * - Panneau de sélection d’emojis
 * - Indicateur lorsque le chat est désactivé
 *
 * Objectif :
 * Favoriser l’interaction sociale et l’expérience collaborative
 * au sein d’un salon de visionnage.
 */
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Send, Smile } from "lucide-react";

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
  isEmoji?: boolean;
  reactions?: { [emoji: string]: string[] };
}

interface ChatSectionProps {
  currentUser: string;
  chatEnabled: boolean;
  onNewMessage?: () => void;
}

const initialMessages: Message[] = [
  { 
    id: "1", 
    user: "CinePhile", 
    text: "Bienvenue dans le salon ! 🎬", 
    timestamp: new Date(Date.now() - 300000),
    reactions: { "❤️": ["MovieFan", "Sarah"], "👍": ["Lucas"] }
  },
  { 
    id: "2", 
    user: "MovieFan", 
    text: "On démarre dans 2 minutes", 
    timestamp: new Date(Date.now() - 240000),
    reactions: { "👍": ["Sarah", "Emma", "Thomas"] }
  },
  { 
    id: "3", 
    user: "Sarah", 
    text: "J&apos;ai trop hâte !", 
    timestamp: new Date(Date.now() - 180000) 
  },
  { 
    id: "4", 
    user: "Lucas", 
    text: "👍", 
    timestamp: new Date(Date.now() - 120000), 
    isEmoji: true 
  },
  { 
    id: "5", 
    user: "Emma", 
    text: "C&apos;est parti !", 
    timestamp: new Date(Date.now() - 60000) 
  }
];

const emojiReactions = ["❤️", "😂", "👍", "🔥", "😮", "🎉"];

export function ChatSection({ currentUser, chatEnabled, onNewMessage }: ChatSectionProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && chatEnabled) {
      const message: Message = {
        id: Date.now().toString(),
        user: currentUser,
        text: newMessage,
        timestamp: new Date(),
        reactions: {}
      };
      setMessages([...messages, message]);
      setNewMessage("");
      onNewMessage?.();
    }
  };

  const handleEmojiSend = (emoji: string) => {
    const message: Message = {
      id: Date.now().toString(),
      user: currentUser,
      text: emoji,
      timestamp: new Date(),
      isEmoji: true,
      reactions: {}
    };
    setMessages([...messages, message]);
    setShowEmojiPicker(false);
    onNewMessage?.();
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        if (!reactions[emoji]) {
          reactions[emoji] = [];
        }
        if (!reactions[emoji].includes(currentUser)) {
          reactions[emoji] = [...reactions[emoji], currentUser];
        }
        return { ...msg, reactions };
      }
      return msg;
    }));
    setShowReactionPicker(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white">Chat</h3>
        {!chatEnabled && (
          <p className="text-xs text-orange-500 mt-1">
            Le chat est temporairement désactivé par l'administrateur
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.user === currentUser;

          return (
            <div 
              key={message.id} 
              className={`group ${message.isEmoji ? 'text-center' : isOwnMessage ? 'flex justify-end' : ''}`}
            >
              {message.isEmoji ? (
                <div className="inline-block">
                  <span className="text-4xl animate-bounce inline-block">{message.text}</span>
                  <p className="text-gray-400 text-xs mt-1">{message.user}</p>
                </div>
              ) : (
                <div className={`max-w-[80%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  {!isOwnMessage && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-purple-400 text-sm">{message.user}</span>
                      <span className="text-gray-500 text-xs">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  
                  <div 
                    className={`relative px-4 py-2 rounded-2xl ${
                      isOwnMessage 
                        ? 'bg-purple-600 text-white rounded-br-none' 
                        : 'bg-gray-700 text-gray-100 rounded-bl-none'
                    }`}
                    onMouseEnter={() => chatEnabled && setShowReactionPicker(message.id)}
                    onMouseLeave={() => setShowReactionPicker(null)}
                  >
                    <p className="text-sm">{message.text}</p>

                    {/* Reaction Picker */}
                    {showReactionPicker === message.id && (
                      <div className="absolute -top-10 left-0 bg-gray-900 rounded-lg px-2 py-1 shadow-xl flex gap-1 z-10">
                        {emojiReactions.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(message.id, emoji)}
                            className="text-lg hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reactions Display */}
                  {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(message.reactions).map(([emoji, users]) => (
                        users.length > 0 && (
                          <div
                            key={emoji}
                            className="bg-gray-900 rounded-full px-2 py-0.5 text-xs flex items-center gap-1"
                          >
                            <span>{emoji}</span>
                            <span className="text-gray-400">{users.length}</span>
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  {isOwnMessage && (
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <span className="text-gray-500 text-xs">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        {showEmojiPicker && (
          <div className="mb-3 bg-gray-900 rounded-lg p-2">
            <div className="flex flex-wrap gap-2">
              {emojiReactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSend(emoji)}
                  className="text-2xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-400 hover:text-white"
            disabled={!chatEnabled}
          >
            <Smile className="w-5 h-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={chatEnabled ? "Votre message..." : "Chat désactivé"}
            disabled={!chatEnabled}
            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          />
          <Button type="submit" size="sm" disabled={!chatEnabled}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}