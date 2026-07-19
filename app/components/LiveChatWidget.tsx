"use client";
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import { createClient } from '@/src/lib/supabase/client';

export default function LiveChatWidget({ onClose }: { onClose: () => void }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if there's an open ticket
    fetch('/api/user/chat')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const openSession = data.find((t: any) => t.status === 'OPEN' || t.status === 'PENDING');
          if (openSession) {
            setSessionId(openSession.id);
            loadMessages(openSession.id);
          }
        }
      })
      .catch(console.error);
  }, []);

  const loadMessages = (id: string) => {
    fetch(`/api/user/chat/${id}/messages`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMessages(data);
        scrollToBottom();
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (!sessionId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`chat-${sessionId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'chat_messages',
        filter: `sessionId=eq.${sessionId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsLoading(true);
    try {
      if (!sessionId) {
        // Create new session
        const res = await fetch('/api/user/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: newMessage }),
        });
        const data = await res.json();
        setSessionId(data.id);
        // The first message is created automatically, load messages
        loadMessages(data.id);
      } else {
        // Post message to existing session
        const res = await fetch(`/api/user/chat/${sessionId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: newMessage }),
        });
        const data = await res.json();
        // Optimistic UI update or rely on Supabase
        if (!messages.find(m => m.id === data.id)) {
          setMessages(prev => [...prev, data]);
          scrollToBottom();
        }
      }
      setNewMessage('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="bg-[#bc876e] p-4 text-white flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-bold text-sm">Live Support</h3>
        </div>
        <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-md transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-gray-50 p-4 overflow-y-auto flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-xs mt-auto mb-auto">
            ส่งข้อความเพื่อเริ่มสนทนากับแอดมิน
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={msg.id || i} className={`flex ${msg.senderRole === 'CUSTOMER' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.senderRole === 'CUSTOMER' 
                ? 'bg-[#bc876e] text-white rounded-tr-sm' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
            }`}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="พิมพ์ข้อความ..."
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#bc876e]"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !newMessage.trim()}
          className="p-2 bg-[#bc876e] text-white rounded-xl hover:bg-[#a8745d] disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
