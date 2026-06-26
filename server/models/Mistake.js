const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Mistake = sequelize.define('Mistake', {
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
  user_answer: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  correct_answer: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_revised: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  tableName: 'mistakes',
  timestamps: true,
});

module.exports = Mistake;
