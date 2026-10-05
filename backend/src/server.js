const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');
const tripRoutes = require('./routes/tripRoutes');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const itineraryRoutes = require('./routes/itineraryRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://tripsync-frontend.onrender.com',
  'https://travelbuddy-team-ecde.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      return callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Body Parsing Middleware
app.use(express.json());

// Connect to Database
connectDB().then(() => {
  // Mount Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/trips', tripRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/itinerary', itineraryRoutes);

  // Start Server
  app.listen(PORT, () => {
    console.log(`[TripSync Backend] Server running on port ${PORT}`);
    console.log(`[Health Check] GET http://localhost:${PORT}/api/health`);
  });
}).catch((err) => {
  console.error('[TripSync Backend] Server failed to start because database connection could not be established.');
  process.exit(1);
});

// Helper to translate Mongoose readiness state
const getDbState = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = getDbState();
  res.status(200).json({
    status: 'OK',
    message: 'TripSync AI Backend is up and running!',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      isConnected: mongoose.connection.readyState === 1
    }
  });
});
