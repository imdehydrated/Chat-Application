const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const authenticate = require('./middleware/authenticate');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Database configuration
const db = require('./config/database').mongoURI;

mongoose.connect(db)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(passport.initialize());

// Routes
app.use('/auth', authRoutes);
app.use('/chat', authenticate, chatRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('joinRoom', (room) => {
    socket.join(room);
  });

  socket.on('chatMessage', async (data) => {
    const message = new Message({
      username: data.username,
      message: data.message,
      room: data.room
    });

    await message.save();
    io.to(data.room).emit('chatMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
