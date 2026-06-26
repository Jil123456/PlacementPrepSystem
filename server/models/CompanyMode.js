const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CompanyMode = sequelize.define('CompanyMode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  mode_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: { msg: 'Mode name must be unique' },
    validate: {
      notEmpty: { msg: 'Mode name cannot be empty' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  dsa_weight: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: { percentage: 50, focus_topics: [] },
  },
  aptitude_weight: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: { percentage: 30, focus_topics: [] },
  },
  difficulty_preset: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'medium',
  },
}, {
  tableName: 'company_modes',
  timestamps: true,
});

module.exports = CompanyMode;
