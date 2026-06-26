const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'placement_prep',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '12345678',
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  xpRewards: {
    task_complete: 10,
    correct_answer: 5,
    streak_day: 2,
    mock_test: 50,
    perfect_day: 25,
  },
  levelThresholds: {
    beginner: { min: 0, max: 500 },
    intermediate: { min: 501, max: 2000 },
    advanced: { min: 2001, max: Infinity },
  },
  readinessWeights: {
    accuracy: 0.4,
    mockTest: 0.3,
    streak: 0.2,
    revision: 0.1,
  },
};
