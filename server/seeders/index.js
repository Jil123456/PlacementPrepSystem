require('dotenv').config({ path: '../.env' });
const db = require('../models');

const companyModeSeeder = require('./companyModeSeeder');
const dsaSeeder = require('./dsaSeeder');
const aptitudeSeeder = require('./aptitudeSeeder');
const coreSubjectSeeder = require('./coreSubjectSeeder');
const hrSeeder = require('./hrSeeder');
const taskSeeder = require('./taskSeeder');

async function seedDatabase() {
  try {
    console.log('🔄 Syncing database... (Dropping existing tables)');
    await db.sequelize.sync({ force: true });
    console.log('✅ Database synced successfully!');

    console.log('🌱 Starting Seed Process...');
    await companyModeSeeder(db);
    await dsaSeeder(db);
    await aptitudeSeeder(db);
    await coreSubjectSeeder(db);
    await hrSeeder(db);
    await taskSeeder(db);

    console.log('🎉 All Seed Data Successfully Inserted!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
