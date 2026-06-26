const app = require('./app');
const db = require('./models');
const config = require('./config/config');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync models without altering in production
    await db.sequelize.sync();
    console.log('Database synced');
    
    // Auto-seed if database is empty (First time production boot)
    const questionCount = await db.Question.count();
    if (questionCount === 0) {
      console.log('Database is empty! Auto-running seeders...');
      await require('./seeders/companyModeSeeder')(db);
      await require('./seeders/roadmapSeeder')(db);
      await require('./seeders/dsaSeeder')(db);
      await require('./seeders/aptitudeSeeder')(db);
      await require('./seeders/coreSubjectSeeder')(db);
      await require('./seeders/hrSeeder')(db);
      await require('./seeders/taskSeeder')(db);
      console.log('Auto-seeding complete! Database is now fully populated.');
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();
