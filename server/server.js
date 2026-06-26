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
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      
      // Run auto-seed in the background so Render doesn't time out waiting for the port
      db.Question.count().then(async (questionCount) => {
        if (questionCount === 0) {
          console.log('Database is empty! Auto-running seeders in background...');
          try {
            await require('./seeders/companyModeSeeder')(db);
            await require('./seeders/dsaSeeder')(db);
            await require('./seeders/aptitudeSeeder')(db);
            await require('./seeders/coreSubjectSeeder')(db);
            await require('./seeders/hrSeeder')(db);
            await require('./seeders/taskSeeder')(db);
            console.log('Auto-seeding complete! Database is now fully populated.');
          } catch (error) {
            console.error('Seeding error:', error);
          }
        }
      }).catch(err => console.error(err));
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();
