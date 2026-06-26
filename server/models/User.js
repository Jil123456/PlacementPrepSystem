const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Name cannot be empty' },
      len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' },
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: { msg: 'Email already in use' },
    validate: {
      isEmail: { msg: 'Must be a valid email address' },
      notEmpty: { msg: 'Email cannot be empty' },
    },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  current_day: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: { args: [1], msg: 'current_day must be at least 1' },
      max: { args: [60], msg: 'current_day cannot exceed 60' },
    },
  },
  streak: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  max_streak: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  last_active_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  weak_topics: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  company_mode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'balanced',
  },
  college: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  branch: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  graduation_year: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  cgpa: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  preferred_companies: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  dsa_level: {
    type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
    allowNull: true,
  },
  daily_study_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  initial_assessment_scores: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  onboarding_completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
