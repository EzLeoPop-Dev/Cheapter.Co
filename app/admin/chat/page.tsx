"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Ticket, AlertCircle, Clock, CheckCircle2, MessageSquare, Send, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { createClient } from '@/src/lib/supabase/client';
import { useAuth } from '../context/AuthContext';

export default function AdminChatPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/admin/chat');
      const data = await res.json();
      if (Array.isArray(data)) setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const loadMessages = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/admin/chat/${sessionId}/messages`);
      const data = await res.json();
      if (Array.isArray(data)) setMessages(data);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession.id);

      const supabase = createClient();
      const channel = supabase
        .channel(`admin-chat-${selectedSession.id}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `sessionId=eq.${selectedSession.id}`
        }, (payload) => {
          setMessages(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev;
            const updated = [...prev, payload.new];
            scrollToBottom();
            return updated;
          });
          // Also refresh sessions to update timestamps
          fetchSessions();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedSession]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent, closeSession = false) => {
    e.preventDefault();
    if (!newMessage.trim() && !closeSession) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/admin/chat/${selectedSession.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: newMessage || (closeSession ? 'Chat closed by Admin' : ''), 
          markAsResolved: closeSession 
        }),
      });
      const data = await res.json();
      setNewMessage('');
      
      if (closeSession) {
        setSelectedSession({ ...selectedSession, status: 'CLOSED' });
        fetchSessions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-50 text-red-700 border-red-200';
      case 'PENDING': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'CLOSED': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <AlertCircle className="w-3 h-3" />;
      case 'PENDING': return <Clock className="w-3 h-3" />;
      case 'CLOSED': return <CheckCircle2 className="w-3 h-3" />;
      default: return <Ticket className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex justify-between items-end mb-4 shrink-0">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-gray-900">{t('tck.title')}</h2>
          <p className="text-gray-500 mt-1">{t('tck.subtitle')}</p>
        </div>
      </div>

      <div className="flex gap-6 h-full min-h-0">
        {/* Ticket List */}
        <div className={`bg-white border border-gray-200 rounded-2xl shadow-sm flex-col overflow-hidden ${selectedSession ? 'hidden lg:flex w-1/3' : 'flex flex-1'}`}>
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder={t('tck.search')} className="pl-9 pr-4 py-2 bg-white border border-gray-200 text-gray-900 text-sm rounded-lg outline-none focus:border-gray-900 w-full transition-colors" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No chats found</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {sessions.map(tk => (
                  <div 
                    key={tk.id} 
                    onClick={() => setSelectedSession(tk)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedSession?.id === tk.id ? 'bg-gray-50 border-l-4 border-[#bc876e]' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-900 text-sm">{tk.id}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(tk.status)}`}>
                        {getStatusIcon(tk.status)}
                        {tk.status}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-800 text-sm truncate">{tk.subject}</h3>
                    <p className="text-xs text-gray-500 mt-1">{tk.user?.name || 'Customer'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel */}
        {selectedSession ? (
          <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-900">{selectedSession.user?.name || 'Customer'}</h3>
                <p className="text-xs text-gray-500">Session: {selectedSession.id}</p>
              </div>
              <div className="flex gap-2">
                {selectedSession.status !== 'CLOSED' && (
                  <button 
                    onClick={(e) => handleSendMessage(e, true)}
                    className="px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    Mark as Resolved
                  </button>
                )}
                <button 
                  onClick={() => setSelectedSession(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg lg:hidden"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-4">
              {/* Chat Messages */}
              {messages.map((msg, i) => {
                const isAdmin = msg.senderRole === 'ADMIN' || msg.senderRole === 'STAFF';
                return (
                  <div key={msg.id || i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                      isAdmin 
                        ? 'bg-gray-900 text-white rounded-tr-sm' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <span className={`text-[10px] mt-1 block ${isAdmin ? 'text-gray-400' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={(e) => handleSendMessage(e, false)} className="p-4 border-t border-gray-100 bg-white">
              {selectedSession.status === 'CLOSED' ? (
                <div className="text-center text-sm font-medium text-gray-500 py-2">
                  This chat is closed.
                </div>
              ) : (
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-900 transition-colors"
                    disabled={isSending}
                  />
                  <button 
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xl hover:bg-black disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-900 font-bold">Select a chat</h3>
              <p className="text-sm text-gray-500">Choose a chat from the left to view the conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
