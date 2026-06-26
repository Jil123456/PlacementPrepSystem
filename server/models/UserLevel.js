const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserLevel = sequelize.define('UserLevel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: 'users', key: 'id' },
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false,
    defaultValue: 'beginner',
    validate: {
      isIn: {
        args: [['beginner', 'intermediate', 'advanced']],
        msg: 'Level must be one of: beginner, intermediate, advanced',
      },
    },
  },
  xp_points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  tasks_completed_total: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  correct_streak: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 },
  },
  level_up_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'user_levels',
  timestamps: true,
});

module.exports = UserLevel;
