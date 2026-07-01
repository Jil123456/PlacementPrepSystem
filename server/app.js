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
const questionsRouter = require('./routes/questions');
const submissionRouter = require('./routes/submission');
const mistakesRouter = require('./routes/mistakes');
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
app.use('/api/questions', questionsRouter);
app.use('/api/submission', submissionRouter);
app.use('/api/mistakes', mistakesRouter);
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

// Hidden route to forcefully seed the database from the browser
app.get('/api/force-seed', async (req, res) => {
  try {
    const db = require('./models');
    console.log('Force seeding database from browser request...');
    await db.sequelize.sync({ force: true });
    await require('./seeders/companyModeSeeder')(db);
    await require('./seeders/dsaSeeder')(db);
    await require('./seeders/aptitudeSeeder')(db);
    await require('./seeders/coreSubjectSeeder')(db);
    await require('./seeders/hrSeeder')(db);
    res.send('<h1>✅ Database successfully seeded with 500+ questions!</h1><p>You can now go back and create an account.</p>');
  } catch (error) {
    console.error(error);
    res.send(`<h1>❌ Error seeding database</h1><p>${error.message}</p>`);
  }
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all route for React Router (must be after API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Error handling
app.use(errorHandler);

module.exports = app;
