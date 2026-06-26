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

    // 3. Generate Roadmap instantly (Bypass slow AI generation for speed)
    const dummyRoadmapDays = [];
    const focusAreas = ['Arrays & Hashing', 'Two Pointers & Strings', 'Linked Lists & Stacks', 'Trees & Graphs', 'Dynamic Programming', 'System Design & OS', 'DBMS & Networks', 'Mock Interviews'];
    
    for (let i = 1; i <= 60; i++) {
      dummyRoadmapDays.push({ 
        user_id: userId, 
        day_number: i, 
        title: `Day ${i} - ${focusAreas[i % focusAreas.length]}`, 
        description: 'Master placement concepts and practice problems.', 
        is_revision_day: i % 7 === 0 
      });
    }
    const createdDays = await RoadmapDay.bulkCreate(dummyRoadmapDays, { returning: true });

    // 4. Assign Tasks to the new Roadmap Days (2 DSA + 1 Core Subject + 1 HR per day, no repetition)
    const dsaQs = await Question.findAll({ where: { category: 'dsa' }, order: sequelize.random() });
    const coreQs = await Question.findAll({ where: { category: 'core_subject' }, order: sequelize.random() });
    const hrQs = await Question.findAll({ where: { category: 'hr' }, order: sequelize.random() });

    const tasks = [];
    let dsaIdx = 0, coreIdx = 0, hrIdx = 0;

    // Track used question IDs to guarantee zero repetition
    const usedQuestionIds = new Set();

    for (const day of createdDays) {
      let orderIndex = 1;

      // 2 DSA Tasks (unique, never repeated)
      for (let i = 0; i < 2; i++) {
        if (dsaQs.length > 0) {
          const q = dsaQs[dsaIdx % dsaQs.length];
          if (!usedQuestionIds.has(q.id)) {
            usedQuestionIds.add(q.id);
            tasks.push({ roadmap_day_id: day.id, type: 'dsa', title: q.title, description: `Solve: ${q.title}`, question_id: q.id, order_index: orderIndex++, is_required: true });
          }
          dsaIdx++;
        }
      }

      // 1 Core Subject Task (unique, never repeated)
      if (coreQs.length > 0) {
        const cq = coreQs[coreIdx % coreQs.length];
        if (!usedQuestionIds.has(cq.id)) {
          usedQuestionIds.add(cq.id);
          tasks.push({ roadmap_day_id: day.id, type: 'core_subject', title: `Core: ${cq.title}`, description: `Review: ${cq.title}`, question_id: cq.id, order_index: orderIndex++, is_required: true });
        }
        coreIdx++;
      }

      // 1 HR Task (unique, never repeated)
      if (hrQs.length > 0) {
        const hq = hrQs[hrIdx % hrQs.length];
        if (!usedQuestionIds.has(hq.id)) {
          usedQuestionIds.add(hq.id);
          tasks.push({ roadmap_day_id: day.id, type: 'hr', title: `HR: ${hq.title}`, description: `Practice: ${hq.title}`, question_id: hq.id, order_index: orderIndex++, is_required: true });
        }
        hrIdx++;
      }
    }

    await Task.bulkCreate(tasks);

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
