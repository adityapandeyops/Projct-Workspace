import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import patientsRouter from './routes/patients.js';
import resourcesRouter from './routes/resources.js';
import analyticsRouter from './routes/analytics.js';
import aiRouter from './routes/ai.js';
import simulationRouter from './routes/simulation.js';
import { setupSocketIO } from './services/socketHandler.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'] : '*';

const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true,
  },
});

setupSocketIO(io);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// API Routes
app.use('/api/patients', patientsRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/simulation', simulationRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'AI-Driven Hospital Patient Flow & Resource Optimization System',
    team: 'Tech Voyager',
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🏥 [Tech Voyager Backend] Server active on port ${PORT}`);
  console.log(`⚡ WebSocket Server initialized with Socket.io`);
});
