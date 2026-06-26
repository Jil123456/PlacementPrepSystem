const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category: {
    type: DataTypes.ENUM('dsa', 'aptitude', 'core_subject', 'hr'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['dsa', 'aptitude', 'core_subject', 'hr']],
        msg: 'Category must be one of: dsa, aptitude, core_subject, hr',
      },
    },
  },
  subcategory: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    allowNull: false,
    defaultValue: 'medium',
    validate: {
      isIn: {
        args: [['easy', 'medium', 'hard']],
        msg: 'Difficulty must be one of: easy, medium, hard',
      },
    },
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Question title cannot be empty' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  options: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
  },
  correct_answer: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  time_limit_seconds: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 300,
    validate: {
      min: { args: [10], msg: 'Time limit must be at least 10 seconds' },
    },
  },
}, {
  tableName: 'questions',
  timestamps: true,
});

module.exports = Question;
