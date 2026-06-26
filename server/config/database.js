const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const dbConfig = {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
};

// Enable SSL if connecting to Supabase
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase')) {
  dbConfig.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, dbConfig);
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'placement_prep',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '12345678',
    {
      ...dbConfig,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
    }
  );
}

module.exports = sequelize;
