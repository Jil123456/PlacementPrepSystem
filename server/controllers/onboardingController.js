const { Question, User, RoadmapDay, Task } = require('../models');
const { successResponse, errorResponse } = require('../utils/helpers');
const sequelize = require('../config/database');
const aiEvaluator = require('../services/aiEvaluator');
const { GoogleGenAI } = require('@google/genai');

const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

async function getAssessment(req, res, next) {
  try {
    // 2 DSA, 3 Aptitude, 2 Core, 1 HR
    const dsa = await Question.findAll({ where: { category: 'dsa' }, order: sequelize.random(), limit: 2, attributes: { exclude: ['correct_answer', 'explanation'] } });
    const aptitude = await Question.findAll({ where: { category: 'aptitude' }, order: sequelize.random(), limit: 3, attributes: { exclude: ['correct_answer', 'explanation'] } });
    const core = await Question.findAll({ where: { category: 'core_subject' }, order: sequelize.random(), limit: 2, attributes: { exclude: ['correct_answer', 'explanation'] } });
    const hr = await Question.findAll({ where: { category: 'hr' }, order: sequelize.random(), limit: 1, attributes: { exclude: ['correct_answer', 'explanation'] } });

    const questions = [...dsa, ...aptitude, ...core, ...hr];
    return res.json(successResponse({ questions }));
  } catch (error) {
    next(error);
  }
}

async function completeOnboarding(req, res, next) {
  try {
    const userId = req.user.id;
    const { 
      college, branch, graduation_year, cgpa, 
      preferred_companies, dsa_level, daily_study_time,
      answers 
    } = req.body;

    // 1. Bypass Evaluation - Assign Baseline Scores
    const initialScores = {
      dsa: 50,
      aptitude: 50,
      core_subject: 50,
      hr: 50,
      overall: 50
    };

    // 2. Update User Profile
    await User.update({
      college,
      branch,
      graduation_year: parseInt(graduation_year) || null,
      cgpa: parseFloat(cgpa) || null,
      preferred_companies: preferred_companies || [],
      dsa_level: dsa_level || 'Beginner',
      daily_study_time: parseInt(daily_study_time) || 2,
      initial_assessment_scores: initialScores,
      onboarding_completed: true
    }, { where: { id: userId } });

    // 3. Generate Roadmap via Gemini
    if (!ai) {
      console.log("No Gemini API key. Generating dummy personalized roadmap.");
      const dummyRoadmapDays = [];
      for (let i = 1; i <= 60; i++) {
        dummyRoadmapDays.push({ user_id: userId, day_number: i, title: `Day ${i} Basics`, description: 'Generated dummy day', is_revision_day: i % 7 === 0 });
      }
      await RoadmapDay.bulkCreate(dummyRoadmapDays);
      return res.json(successResponse({ scores: initialScores }));
    }

    const prompt = `
Student profile: [
  Level: ${dsa_level}, 
  Daily Time: ${daily_study_time} hours, 
  Companies: ${(preferred_companies||[]).join(', ')}, 
  Scores: DSA ${initialScores.dsa}%, Aptitude ${initialScores.aptitude}%, Core ${initialScores.core_subject}%, HR ${initialScores.hr}%
].
Generate a 60-day placement preparation roadmap.
Respond ONLY with a valid JSON object in this exact structure:
{
  "days": [
    {
      "day": 1,
      "title": "Arrays Basics",
      "description": "Master array fundamentals.",
      "focus_area": "Arrays",
      "topics_covered": ["arrays", "loops"],
      "is_revision_day": false
    }
  ]
}
Make sure to generate exactly 60 days. Day 7, 14, 21, 28, 35, 42, 49, 56 should be revision days.
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const roadmapData = JSON.parse(response.text);

    const roadmapDaysToInsert = roadmapData.days.slice(0, 60).map(d => ({
      user_id: userId,
      day_number: d.day,
      title: d.title || `Day ${d.day}`,
      description: d.description || '',
      focus_area: d.focus_area || '',
      topics_covered: d.topics_covered || [],
      is_revision_day: d.is_revision_day || false
    }));

    await RoadmapDay.bulkCreate(roadmapDaysToInsert);

    return res.json(successResponse({ scores: initialScores }));
  } catch (error) {
    console.error('Onboarding complete error:', error);
    next(error);
  }
}

module.exports = {
  getAssessment,
  completeOnboarding
};
