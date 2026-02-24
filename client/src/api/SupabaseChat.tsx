import { useState, useEffect, useRef } from 'react';
import { useChat } from '../../api/useChat';
import { Button } from "../ui/Button";
import { Send, Loader2 } from 'lucide-react';

interface SupabaseChatProps {
  roomId: string;
  userName: string;
  className?: string;
}

export function SupabaseChat({ roomId, userName, className = "" }: SupabaseChatProps) {
  const { messages, loading, sendMessage } = useChat(roomId, userName);
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll automatique vers le bas quand un nouveau message arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    
    await sendMessage(inputText);
    setInputText("");
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 ${className}`}>
      {/* En-tête du Chat */}
      <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
        <h3 className="font-semibold text-gray-900 dark:text-white">Chat en direct</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Connecté en tant que <span className="font-medium text-purple-600">{userName}</span>
        </p>
      </div>

      {/* Zone des messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Chargement...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10 text-sm">
            Aucun message. Soyez le premier à écrire !
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_name === userName;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                  isMe 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100'
                }`}>
                  {!isMe && <span className="block text-xs font-bold mb-1 opacity-70">{msg.user_name}</span>}
                  {msg.content}
                </div>
                <span className="text-[10px] text-gray-400 mt-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Zone de saisie */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-zinc-800 flex gap-2">
        <input
          id="supabase-chat-message"
          name="message"
          autoComplete="off"
          className="flex-1 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Votre message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <Button type="submit" size="icon" className="bg-purple-600 hover:bg-purple-700">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
