const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RevisionSession = sequelize.define('RevisionSession', {
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
  quality: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  interval_before: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  interval_after: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ef_before: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  ef_after: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'revision_sessions',
  timestamps: false,
});

module.exports = RevisionSession;
