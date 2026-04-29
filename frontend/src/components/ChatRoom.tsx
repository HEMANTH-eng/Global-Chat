import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  type: 'system' | 'user' | 'file';
  username?: string;
  text?: string;
  id: string | number;
  fileName?: string;
  fileType?: string;
  fileData?: string;
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
                  {msg.type === 'file' ? (
                    msg.fileType?.startsWith('image/') ? (
                      <img src={msg.fileData} alt={msg.fileName} className="max-w-full max-h-48 rounded-lg mt-1 mb-1" />
                    ) : msg.fileType?.startsWith('video/') ? (
                      <video src={msg.fileData} controls className="max-w-full max-h-48 rounded-lg mt-1 mb-1" />
                    ) : (
                      <a href={msg.fileData} download={msg.fileName} className="flex items-center gap-2 text-white hover:text-violet-200 underline font-medium">
                        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="truncate max-w-[200px]">{msg.fileName}</span>
                      </a>
                    )
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white/5 border-t border-white/10 shrink-0 flex items-center gap-2 relative">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (file.size > 5 * 1024 * 1024) {
                alert('File is too large! Please select a file smaller than 5MB.');
                e.target.value = '';
                return;
              }
              const reader = new FileReader();
              reader.onload = () => {
                if (socketRef.current) {
                  socketRef.current.emit('sendFile', {
                    fileName: file.name,
                    fileType: file.type,
                    fileData: reader.result
                  });
                }
              };
              reader.readAsDataURL(file);
            }
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => document.getElementById('file-upload')?.click()}
          className="text-white/50 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 flex items-center justify-center flex-shrink-0"
          title="Share files (Images, Videos, Docs)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
          </svg>
        </button>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 focus:outline-none focus:border-violet-400 focus:bg-white/10 transition-colors"
        />
        <button
          type="submit"
          className="bg-violet-600 hover:bg-violet-500 text-white rounded-full px-6 py-2 transition-colors shadow-lg shadow-violet-500/20 font-medium whitespace-nowrap"
        >
          Send
        </button>
      </form>
    </div>
  );
}