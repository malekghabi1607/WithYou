import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Send, Smile, Heart, ThumbsUp, Laugh, Flame } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
  isEmoji?: boolean;
}

interface FunctionalChatProps {
  currentUser: string;
  chatEnabled: boolean;
  onNewMessage?: () => void;
  theme?: "light" | "dark";
}

const emojiReactions = ["❤️", "😂", "👍", "🔥", "😮", "🎉", "👏", "🎬"];

export function FunctionalChat({ currentUser, chatEnabled, onNewMessage, theme = "dark" }: FunctionalChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "1", 
      user: "CinePhile", 
      text: "Bienvenue dans le salon ! 🎬", 
      timestamp: new Date(Date.now() - 300000)
    },
    { 
      id: "2", 
      user: "MovieFan", 
      text: "On démarre dans 2 minutes", 
      timestamp: new Date(Date.now() - 240000)
    },
    { 
      id: "3", 
      user: "Sarah", 
      text: "J'ai trop hâte !", 
      timestamp: new Date(Date.now() - 180000) 
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    if (!chatEnabled) {
      toast.error("Le chat est désactivé pour vous");
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      user: currentUser,
      text: newMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage("");
    onNewMessage?.();
  };

  const handleEmojiSend = (emoji: string) => {
    if (!chatEnabled) {
      toast.error("Le chat est désactivé pour vous");
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      user: currentUser,
      text: emoji,
      timestamp: new Date(),
      isEmoji: true
    };
    
    setMessages(prev => [...prev, message]);
    setShowEmojiPicker(false);
    onNewMessage?.();
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${theme === "dark" ? "bg-zinc-900" : "bg-gray-50"}`}>
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`${
              message.user === currentUser 
                ? "ml-auto" 
                : ""
            } max-w-[80%]`}
          >
            <div className={`text-xs mb-1 ${
              message.user === currentUser 
                ? "text-right" 
                : "text-left"
            } ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {message.user === currentUser ? "Vous" : message.user}
            </div>
            <div
              className={`p-3 rounded-lg ${
                message.user === currentUser
                  ? "bg-red-600 text-white ml-auto"
                  : theme === "dark"
                  ? "bg-zinc-800 text-gray-100"
                  : "bg-white text-gray-900"
              } ${message.isEmoji ? "text-3xl py-2" : ""}`}
            >
              {message.text}
            </div>
            <div className={`text-xs mt-1 ${
              message.user === currentUser 
                ? "text-right" 
                : "text-left"
            } ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
              {formatTime(message.timestamp)}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className={`p-3 border-t ${theme === "dark" ? "border-red-900/20 bg-zinc-800" : "border-gray-200 bg-white"}`}>
          <div className="grid grid-cols-8 gap-2">
            {emojiReactions.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiSend(emoji)}
                className={`text-2xl p-2 rounded hover:bg-red-600/20 transition-colors`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className={`p-4 border-t ${theme === "dark" ? "border-red-900/20 bg-black" : "border-gray-200 bg-white"}`}>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={!chatEnabled}
            className={theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}
          >
            <Smile className="w-5 h-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={chatEnabled ? "Votre message..." : "Chat désactivé"}
            disabled={!chatEnabled}
            className={`flex-1 ${
              theme === "dark"
                ? "bg-zinc-800 border-red-900/30 text-white placeholder:text-gray-500"
                : "bg-white border-gray-300 text-black placeholder:text-gray-400"
            }`}
          />
          <Button
            type="submit"
            disabled={!chatEnabled || !newMessage.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
        {!chatEnabled && (
          <p className={`text-xs mt-2 ${theme === "dark" ? "text-gray-500" : "text-gray-600"}`}>
            L'administrateur a désactivé le chat pour vous
          </p>
        )}
      </div>
    </div>
  );
}
