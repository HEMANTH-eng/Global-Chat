import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import { LiquidBlob } from './components/LiquidBlob';
import { ChatRoom } from './components/ChatRoom';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setHasJoined(true);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 font-sans text-white">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-70">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />
          <Environment preset="city" />
          <LiquidBlob />
          <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={20} blur={2} far={4} />
        </Canvas>
      </div>

      <main className="relative z-10 w-full h-full flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {!hasJoined ? (
            <motion.div
              key="login"
              layoutId="glass-container"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="glass-panel p-8 w-full max-w-md flex flex-col items-center gap-6 shadow-2xl"
            >
              <div className="text-center">
                <h1 className="text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400 tracking-tight">
                  Global Chat
                </h1>
                <p className="text-white/60">An immersive real-time experience chat.</p>
              </div>

              <form onSubmit={handleJoin} className="w-full flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="username" className="text-sm font-medium text-white/50 pl-1">Choose a Username</label>
                  <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your Name" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all font-medium text-white shadow-inner" />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="room" className="text-sm font-medium text-white/50 pl-1">Private Room (Optional)</label>
                  <input type="text" id="room" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Private Code" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all font-medium text-white shadow-inner" />
                </div>
                <button type="submit" className="w-full text-center bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold rounded-xl px-4 py-3 mt-2 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all">Enter to Room</button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="chatroom"
              layoutId="glass-container"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="w-full h-full flex flex-col items-center justify-center p-4"
            >
              <ChatRoom username={username} room={room.trim() || 'Global Chat'} onLeave={() => setHasJoined(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;