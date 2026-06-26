module.exports = async (db) => {
  const questions = [];
  const subs = ['dbms', 'os', 'cn'];
  let count = 0;

  for (let sub of subs) {
    for (let i = 0; i < 30; i++) {
      count++;
      questions.push({
        title: `${sub.toUpperCase()} Concept ${i+1}`, category: 'core_subject', subcategory: sub, difficulty: i % 3 === 0 ? 'hard' : 'medium',
        description: `Identify the correct statement regarding this architecture or principle.\n\nWhich of the following is considered a valid characteristic?`,
        options: JSON.stringify([{label:'A', text:'It ensures data integrity and atomic transactions.', value:'A'}, {label:'B', text:'It allows unbounded memory leaks by design.', value:'B'}, {label:'C', text:'It requires no processing power.', value:'C'}, {label:'D', text:'None of the above', value:'D'}]),
        correct_answer: 'A', explanation: `A is correct because it follows standard rules.`, tags: JSON.stringify([sub]), time_limit_seconds: 60
      });
    }
  }

  await db.Question.bulkCreate(questions);
  console.log(`✅ ${questions.length} Core Subject Questions Seeded`);
};
