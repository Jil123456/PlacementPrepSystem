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
      
      // Hidden route to forcefully seed the database from the browser
      app.get('/api/force-seed', async (req, res) => {
        try {
          console.log('Force seeding database from browser request...');
          await db.sequelize.sync({ force: true });
          await require('./seeders/companyModeSeeder')(db);
          await require('./seeders/dsaSeeder')(db);
          await require('./seeders/aptitudeSeeder')(db);
          await require('./seeders/coreSubjectSeeder')(db);
          await require('./seeders/hrSeeder')(db);
          res.send('<h1>✅ Database successfully seeded with 500+ questions!</h1><p>You can now go back and create an account.</p>');
        } catch (error) {
          console.error(error);
          res.send(`<h1>❌ Error seeding database</h1><p>${error.message}</p>`);
        }
      });
      
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
