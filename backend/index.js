const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (data) => {
    let username, room;
    if (typeof data === 'string') {
      username = data;
      room = 'Global Chat';
    } else {
      username = data.username;
      room = data.room || 'Global Chat';
    }
    
    socket.join(room);
    users.set(socket.id, { username, room });
    
    // Broadcast to specific room
    io.to(room).emit('message', { type: 'system', text: `${username} joined ${room}.`, id: Date.now() + Math.random() });
    
    // Count clients in this specific room
    const clientsInRoom = io.sockets.adapter.rooms.get(room)?.size || 0;
    io.to(room).emit('onlineUsers', clientsInRoom);
  });

  socket.on('sendMessage', (message) => {
    const user = users.get(socket.id);
    if (user) {
      io.to(user.room).emit('message', { type: 'user', username: user.username, text: message, id: Date.now() + Math.random() });
    }
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      io.to(user.room).emit('message', { type: 'system', text: `${user.username} left the chat.`, id: Date.now() + Math.random() });
      users.delete(socket.id);
      
      const clientsInRoom = io.sockets.adapter.rooms.get(user.room)?.size || 0;
      io.to(user.room).emit('onlineUsers', clientsInRoom);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
