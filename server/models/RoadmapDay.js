const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RoadmapDay = sequelize.define('RoadmapDay', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  day_number: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'day_number must be at least 1' },
      max: { args: [60], msg: 'day_number cannot exceed 60' },
    },
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title cannot be empty' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  focus_area: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  topics_covered: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  is_revision_day: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  revision_of_days: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
}, {
  tableName: 'roadmap_days',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'day_number']
    }
  ]
});

module.exports = RoadmapDay;
