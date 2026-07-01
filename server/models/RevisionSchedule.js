const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RevisionSchedule = sequelize.define('RevisionSchedule', {
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
  next_revision_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  revision_stage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1, // 1 = Day 2, 2 = Day 7, 3 = Day 30
  },
  is_completed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  interval: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  repetitions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  easiness_factor: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 2.5,
  },
  mastered: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  target_roadmap_day: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'revision_schedules',
  timestamps: true,
});

module.exports = RevisionSchedule;
