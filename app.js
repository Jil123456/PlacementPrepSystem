const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
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

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

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

// Error handling
app.use(errorHandler);

module.exports = app;
