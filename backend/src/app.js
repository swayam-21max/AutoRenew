const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const healthRoutes = require('./routes/healthRoutes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// CORS
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts, please try again later.' },
});
app.use('/api/auth/', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', userRoutes);
app.use('/api/health', healthRoutes);

// Global error handler
app.use(errorHandler);

module.exports = app;
