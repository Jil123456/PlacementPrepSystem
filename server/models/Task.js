const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  roadmap_day_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'roadmap_days', key: 'id' },
  },
  type: {
    type: DataTypes.ENUM('dsa', 'aptitude', 'concept', 'hr', 'core_subject', 'revision', 'mock_test', 'dsa_revision'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['dsa', 'aptitude', 'concept', 'hr', 'core_subject', 'revision', 'mock_test', 'dsa_revision']],
        msg: 'Type must be one of: dsa, aptitude, concept, hr, core_subject, revision, mock_test, dsa_revision',
      },
    },
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Task title cannot be empty' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'questions', key: 'id' },
  },
  order_index: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  is_required: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'tasks',
  timestamps: true,
});

module.exports = Task;
