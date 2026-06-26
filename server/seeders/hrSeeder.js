module.exports = async (db) => {
  const questions = [
    { title: 'Tell me about yourself', category: 'hr', subcategory: 'self_introduction', difficulty: 'medium', description: 'Introduce yourself in a professional setting. Keep it to 2 minutes.', correct_answer: 'Start with current role/education, highlight 2-3 major achievements or projects, and explain why you are here.', explanation: 'Interviewers look for clarity, confidence, and relevance.', tags: JSON.stringify(['intro']), time_limit_seconds: 300 },
    { title: 'What are your strengths and weaknesses?', category: 'hr', subcategory: 'strengths_weaknesses', difficulty: 'medium', description: 'Discuss a real strength and a genuine weakness you are working on.', correct_answer: 'Strength: Problem-solving. Weakness: Public speaking, but I am taking a course.', explanation: 'Show self-awareness and a growth mindset.', tags: JSON.stringify(['self-awareness']), time_limit_seconds: 300 }
  ];

  const subs = ['self_introduction', 'strengths_weaknesses', 'behavioral', 'situational', 'company_specific', 'technical', 'salary_career'];
  let count = questions.length;

  const realQuestions = [
    'Tell me about a time you demonstrated leadership skills.',
    'How do you handle stress and pressure at work?',
    'What is your approach to time management?',
    'Describe a situation where you had to make a difficult decision.',
    'How do you handle constructive criticism?',
    'What are your long-term career goals?',
    'Tell me about a time you resolved a conflict in your team.',
    'How do you prioritize your tasks when everything seems urgent?',
    'What is the most innovative idea you have contributed to a project?'
  ];

  for (let sub of subs) {
    while (questions.filter(q => q.subcategory === sub).length < 7) {
      count++;
      questions.push({
        title: `${sub.replace('_', ' ')} Question ${count}`, category: 'hr', subcategory: sub, difficulty: 'medium',
        description: realQuestions[(count - 1) % realQuestions.length],
        correct_answer: `Situation, Task, Action, Result for ${sub}.`,
        explanation: 'Evaluate based on impact and clarity.',
        tags: JSON.stringify([sub]), time_limit_seconds: 300
      });
    }
  }

  await db.Question.bulkCreate(questions);
  console.log(`✅ ${questions.length} HR Questions Seeded`);
};
