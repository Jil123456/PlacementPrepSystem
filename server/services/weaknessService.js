const { UserAnswer, Question } = require('../models');

async function detectWeakness(userId) {
  const answers = await UserAnswer.findAll({
    where: { user_id: userId },
    include: [{
      model: Question,
      as: 'question',
      attributes: ['category', 'subcategory', 'difficulty'],
    }],
    order: [['answered_at', 'DESC']],
  });

  if (answers.length === 0) {
    return { weak_topics: [], message: 'Not enough data to analyze weaknesses' };
  }

  const topicMap = {};

  for (const ans of answers) {
    if (!ans.question) continue;
    const key = `${ans.question.category}:${ans.question.subcategory || 'general'}`;
    if (!topicMap[key]) {
      topicMap[key] = {
        category: ans.question.category,
        subcategory: ans.question.subcategory || 'general',
        total: 0,
        correct: 0,
        totalTime: 0,
        difficulties: [],
      };
    }
    topicMap[key].total += 1;
    if (ans.is_correct) topicMap[key].correct += 1;
    if (ans.time_taken_seconds) topicMap[key].totalTime += ans.time_taken_seconds;
    topicMap[key].difficulties.push(ans.question.difficulty);
  }

  const weakTopics = Object.values(topicMap)
    .map((topic) => ({
      ...topic,
      accuracy: topic.total > 0 ? ((topic.correct / topic.total) * 100).toFixed(1) : 0,
      avg_time: topic.total > 0 ? Math.round(topic.totalTime / topic.total) : 0,
    }))
    .filter((t) => parseFloat(t.accuracy) < 50 && t.total >= 1)
    .sort((a, b) => parseFloat(a.accuracy) - parseFloat(b.accuracy));

  return { weak_topics: weakTopics };
}

module.exports = { detectWeakness };
