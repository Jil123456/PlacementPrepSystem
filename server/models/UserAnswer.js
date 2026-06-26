const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserAnswer = sequelize.define('UserAnswer', {
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
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'questions', key: 'id' },
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'tasks', key: 'id' },
  },
  user_answer: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  time_taken_seconds: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 0 },
  },
  answered_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'user_answers',
  timestamps: true,
});

module.exports = UserAnswer;
