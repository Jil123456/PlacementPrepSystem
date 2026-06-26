module.exports = async (db) => {
  const days = await db.RoadmapDay.findAll({ order: [['day_number', 'ASC']] });
  const dsaQs = await db.Question.findAll({ where: { category: 'dsa' } });
  const aptQs = await db.Question.findAll({ where: { category: 'aptitude' } });
  const coreQs = await db.Question.findAll({ where: { category: 'core_subject' } });
  const hrQs = await db.Question.findAll({ where: { category: 'hr' } });

  const tasks = [];
  let dsaIdx = 0, aptIdx = 0, coreIdx = 0, hrIdx = 0;

  for (const day of days) {
    let orderIndex = 1;

    // 2 DSA Tasks
    for (let i = 0; i < 2; i++) {
      if (dsaIdx < dsaQs.length) {
        tasks.push({
          roadmap_day_id: day.id, type: 'dsa', title: dsaQs[dsaIdx].title,
          description: `Solve ${dsaQs[dsaIdx].title} optimally.`, question_id: dsaQs[dsaIdx].id,
          order_index: orderIndex++, is_required: true
        });
        dsaIdx++;
      }
    }

    // 5 Aptitude Tasks
    for (let i = 0; i < 5; i++) {
      if (aptIdx < aptQs.length) {
        tasks.push({
          roadmap_day_id: day.id, type: 'aptitude', title: `Aptitude: ${aptQs[aptIdx].title}`,
          description: `Solve aptitude question.`, question_id: aptQs[aptIdx].id,
          order_index: orderIndex++, is_required: true
        });
        aptIdx++;
      }
    }

    // 1 Core Task
    if (coreIdx < coreQs.length) {
      tasks.push({
        roadmap_day_id: day.id, type: 'core_subject', title: `Core: ${coreQs[coreIdx].title}`,
        description: `Review core concept.`, question_id: coreQs[coreIdx].id,
        order_index: orderIndex++, is_required: true
      });
      coreIdx++;
    }

    // 1 HR Task
    if (hrIdx < hrQs.length) {
      tasks.push({
        roadmap_day_id: day.id, type: 'hr', title: `HR: ${hrQs[hrIdx].title}`,
        description: `Practice HR interview question.`, question_id: hrQs[hrIdx].id,
        order_index: orderIndex++, is_required: true
      });
      hrIdx++;
    }
  }

  await db.Task.bulkCreate(tasks);
  console.log(`✅ ${tasks.length} Tasks Seeded and Linked to Roadmap Days`);
};
