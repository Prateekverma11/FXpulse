import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { initCronJobs, setSocketIO } from './jobs/cronJobs.js';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Setup Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

setSocketIO(io);

// Socket.IO event listeners
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.emit('connection:established', {
    status: 'CONNECTED',
    timestamp: new Date(),
    message: 'Connected to FXPulse Real-Time Currency Intelligence Gateway'
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Mount API routes
app.use('/api', apiRouter);

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

// If client build exists, serve static assets and support SPA routing
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Health check root fallback if client is not built
  app.get('/', (req, res) => {
    res.json({
      app: 'FXPulse — Currency Intelligence Platform',
      version: '1.0.0',
      status: 'ONLINE',
      documentation: '/api/status'
    });
  });
}

// 404 handler for unmatched API routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Server and Cron
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` 🚀 FXPulse Server is running on http://localhost:${PORT}`);
  console.log(` 🌐 WebSocket Gateway ready for live intelligence streaming`);
  console.log(`====================================================`);

  // Initialize scheduled ingestion
  initCronJobs();
});

export { app, server, io };
