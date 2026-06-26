const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TestResult = sequelize.define('TestResult', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  test_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'mock',
  },
  total_questions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  },
  correct_answers: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  total_time_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  category_scores: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
  },
  taken_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'test_results',
  timestamps: true,
});

module.exports = TestResult;
