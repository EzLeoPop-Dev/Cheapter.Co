// @ts-nocheck
"use client";
import React, { useState } from 'react';

export default function AdminChatPage() {
  const [activeChat, setActiveChat] = useState(1);
  const [newMessage, setNewMessage] = useState('');

  const [chats, setChats] = useState([
    {
      id: 1,
      customer: 'สมชาย รักการอ่าน',
      avatar: 'ส',
      lastMessage: 'หนังสือส่งวันไหนครับ?',
      time: '10:30',
      unread: 2,
      messages: [
        { sender: 'customer', text: 'สวัสดีครับ', time: '10:28' },
        { sender: 'customer', text: 'สั่งหนังสือไปเมื่อวาน หนังสือส่งวันไหนครับ?', time: '10:30' },
      ]
    },
    {
      id: 2,
      customer: 'วิภาดา ใจดี',
      avatar: 'ว',
      lastMessage: 'ขอบคุณค่ะ',
      time: '09:15',
      unread: 0,
      messages: [
        { sender: 'customer', text: 'ได้รับของแล้วนะคะ', time: '09:10' },
        { sender: 'staff', text: 'ขอบคุณที่อุดหนุนครับ โอกาสหน้าเชิญใหม่นะครับ', time: '09:12' },
        { sender: 'customer', text: 'ขอบคุณค่ะ', time: '09:15' },
      ]
    }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setChats(chats.map(chat => {
      if (chat.id === activeChat) {
        return {
          ...chat,
          messages: [...chat.messages, { sender: 'staff', text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
        };
      }
      return chat;
    }));
    setNewMessage('');
  };

  const currentChat = chats.find(c => c.id === activeChat);

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Chat List (Sidebar) */}
      <div className="w-1/3 bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-[#e6e5e0]">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">ข้อความ (Chats)</h2>
          <div className="bg-white rounded-xl p-1 border border-[#e6e5e0] flex">
            <input type="text" placeholder="ค้นหาลูกค้า..." className="px-4 py-1.5 text-sm w-full focus:outline-none bg-transparent" />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => {
                setActiveChat(chat.id);
                // Clear unread count when opened
                setChats(chats.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
              }}
              className={`p-4 border-b border-[#e6e5e0] cursor-pointer hover:bg-white/50 transition-colors flex items-center gap-3 ${activeChat === chat.id ? 'bg-white/60 border-l-4 border-l-primary' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
                {chat.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-[#1A1A1A] text-sm truncate">{chat.customer}</h3>
                  <span className="text-xs text-[#a09c92]">{chat.time}</span>
                </div>
                <p className="text-xs text-[#a09c92] truncate">{chat.lastMessage}</p>
              </div>
              {chat.unread > 0 && (
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2rem] shadow-sm flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-6 border-b border-[#e6e5e0] flex items-center gap-4 bg-white/40">
          <div className="w-12 h-12 rounded-full bg-orange-100 text-primary flex items-center justify-center font-bold text-xl">
            {currentChat?.avatar}
          </div>
          <div>
            <h2 className="font-bold text-[#1A1A1A] text-lg">{currentChat?.customer}</h2>
            <p className="text-xs text-green-600 font-medium">ออนไลน์</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {currentChat?.messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.sender === 'staff' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                msg.sender === 'staff' 
                  ? 'bg-primary text-white rounded-br-none shadow-sm' 
                  : 'bg-white border border-[#e6e5e0] text-[#1A1A1A] rounded-bl-none shadow-sm'
              }`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-[#a09c92] mt-1 mx-1">{msg.time}</span>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white/40 border-t border-[#e6e5e0]">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="พิมพ์ข้อความ..." 
              className="flex-1 px-4 py-3 border border-[#e6e5e0] rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-[#1A1A1A]"
            />
            <button 
              type="submit"
              className="px-6 py-3 bg-primary hover:bg-[#b07515] text-white rounded-xl font-bold transition-all shadow-sm"
            >
              ส่ง
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
