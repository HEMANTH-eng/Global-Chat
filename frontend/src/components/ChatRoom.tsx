import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  type: 'system' | 'user';
  username?: string;
  text: string;
  id: string | number;
}

export function ChatRoom({ username, room = 'Global Chat', onLeave }: { username: string; room?: string; onLeave: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [onlineCount, setOnlineCount] = useState(1);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Connect to backend
    socketRef.current = io('http://localhost:3001');

    socketRef.current.on('connect', () => {
      socketRef.current?.emit('join', { username, room });
    });

    socketRef.current.on('message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socketRef.current.on('onlineUsers', (count: number) => {
      setOnlineCount(count);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && socketRef.current) {
      socketRef.current.emit('sendMessage', inputText);
      setInputText('');
    }
  };

  return (
    <div className="flex flex-col h-[70vh] w-full max-w-2xl mx-auto glass-panel overflow-hidden relative z-10">
      <div className="bg-white/5 border-b border-white/10 p-4 shrink-0 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
              {room}
            </h2>
            <div className="flex flex-row items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              <span className="text-xs font-semibold text-emerald-400 tracking-wide">{onlineCount} online</span>
            </div>
          </div>
          <p className="text-xs text-white/50 mt-1">Logged in as: {username}</p>
        </div>
        <button 
          onClick={onLeave}
          className="bg-white/10 hover:bg-white/20 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors border border-white/10"
        >
          Leave
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.type === 'system' ? 'items-center text-white/50 text-xs' : (msg.username === username ? 'items-end' : 'items-start')}`}
          >
            {msg.type === 'system' ? (
              <span className="italic px-3 py-1 bg-white/5 rounded-full">{msg.text}</span>
            ) : (
              <div className={`flex flex-col max-w-[80%] ${msg.username === username ? 'items-end' : 'items-start'}`}>
                {msg.username !== username && (
                  <span className="text-xs text-violet-300 ml-1 mb-1">{msg.username}</span>
                )}
                <div className={`px-4 py-2 rounded-2xl ${msg.username === username ? 'bg-violet-600/80 rounded-tr-sm' : 'bg-white/10 rounded-tl-sm backdrop-blur-md'}`}>
                  {msg.text}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10 shrink-0 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 focus:outline-none focus:border-violet-400 focus:bg-white/10 transition-colors"
        />
        <button
          type="submit"
          className="bg-violet-600 hover:bg-violet-500 text-white rounded-full px-6 py-2 transition-colors shadow-lg shadow-violet-500/20 font-medium"
        >
          Send
        </button>
      </form>
    </div>
  );
}