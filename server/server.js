import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.routes.js';
import bookRoutes from './routes/book.routes.js';
import exchangeRoutes from './routes/exchange.routes.js';
import messageRoutes from './routes/message.routes.js';
import userRoutes from './routes/user.routes.js';
import notificationsRoutes from "./routes/notifications.js";
// Initialize express app
const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // For handling base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


// Serve static files from the "uploads" folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/exchanges', exchangeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', userRoutes);

app.use("/api/notifications", notificationsRoutes);


// Basic route
app.get('/', (req, res) => {
  res.send('Book Exchange API is running');
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a room (exchange conversation)
  socket.on('join_room', (exchangeId) => {
    socket.join(`exchange_${exchangeId}`);
    console.log(`User ${socket.id} joined room: exchange_${exchangeId}`);
  });

  // Handle new message
  socket.on('send_message', (messageData) => {
    io.to(`exchange_${messageData.exchangeId}`).emit('receive_message', messageData);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server

const PORT = process.env.PORT || 5000;
server.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
