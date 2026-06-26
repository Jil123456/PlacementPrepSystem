const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserProgress = sequelize.define('UserProgress', {
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
  roadmap_day_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'roadmap_days', key: 'id' },
  },
  is_completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  tasks_completed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  dsa_completed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  aptitude_completed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  core_subject_completed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  hr_completed: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  total_tasks: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'user_progress',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['user_id', 'roadmap_day_id'] },
  ],
});

module.exports = UserProgress;
