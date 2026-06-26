const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const questionRoutes = require('./routes/questions');
const progressRoutes = require('./routes/progress');
const testRoutes = require('./routes/tests');
const revisionRoutes = require('./routes/revision');
const mistakeRoutes = require('./routes/mistakes');
const levelRoutes = require('./routes/levels');
const companyModeRoutes = require('./routes/companyMode');
const analyticsRoutes = require('./routes/analytics');
const onboardingRoutes = require('./routes/onboarding');
const chatRoutes = require('./routes/chat');
const jobsRoutes = require('./routes/jobs');
const resumeRoutes = require('./routes/resume');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/revision', revisionRoutes);
app.use('/api/mistakes', mistakeRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/company-mode', companyModeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/resume', resumeRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all route for React Router (must be after API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Error handling
app.use(errorHandler);

module.exports = app;
