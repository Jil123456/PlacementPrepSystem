const { sequelize } = require('./models');

(async () => {
  try {
    // Just drop and sync everything to ensure clean state since it's a dev server
    // and I seeded RoadmapDays separately. Wait, I seeded RoadmapDays manually.
    // I will only drop user progress related tables.
    
    await sequelize.query('DROP TABLE IF EXISTS user_answers CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS user_progress CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS tasks CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_tasks_type" CASCADE;');
    
    const { Task, UserProgress, UserAnswer, RevisionSchedule } = require('./models');
    
    await Task.sync({ force: true });
    await UserProgress.sync({ force: true });
    await UserAnswer.sync({ force: true });
    await RevisionSchedule.sync({ force: true });
    
    console.log('Tables recreated successfully!');
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
})();
