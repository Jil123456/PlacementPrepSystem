const { Op } = require('sequelize');
const { Mistake, Question } = require('../models');
const { successResponse, errorResponse, paginate } = require('../utils/helpers');

async function getMistakes(req, res, next) {
  try {
    const userId = req.user.id;
    const { category, is_revised } = req.query;
    const { limit, offset, page } = paginate(req.query);

    const where = { user_id: userId };
    if (is_revised !== undefined) {
      where.is_revised = is_revised === 'true';
    }

    const includeWhere = {};
    if (category) {
      includeWhere.category = category;
    }

    const { count, rows } = await Mistake.findAndCountAll({
      where,
      include: [{
        model: Question,
        as: 'question',
        where: Object.keys(includeWhere).length > 0 ? includeWhere : undefined,
      }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return res.json(successResponse({
      mistakes: rows,
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    }));
  } catch (error) {
    next(error);
  }
}

async function markRevised(req, res, next) {
  try {
    const userId = req.user.id;
    const { mistakeId } = req.params;

    const mistake = await Mistake.findOne({
      where: { id: mistakeId, user_id: userId },
    });

    if (!mistake) {
      return res.status(404).json(errorResponse('Mistake not found'));
    }

    if (mistake.is_revised) {
      return res.status(409).json(errorResponse('Already marked as revised'));
    }

    mistake.is_revised = true;
    await mistake.save();

    return res.json(successResponse(mistake, 'Mistake marked as revised'));
  } catch (error) {
    next(error);
  }
}

async function getMistakeStats(req, res, next) {
  try {
    const userId = req.user.id;

    const mistakes = await Mistake.findAll({
      where: { user_id: userId },
      include: [{
        model: Question,
        as: 'question',
        attributes: ['category', 'subcategory'],
      }],
    });

    const stats = {};
    let totalMistakes = 0;
    let revisedCount = 0;

    for (const m of mistakes) {
      totalMistakes++;
      if (m.is_revised) revisedCount++;

      if (m.question) {
        const cat = m.question.category;
        const sub = m.question.subcategory || 'general';

        if (!stats[cat]) stats[cat] = { total: 0, revised: 0, subcategories: {} };
        stats[cat].total += 1;
        if (m.is_revised) stats[cat].revised += 1;

        if (!stats[cat].subcategories[sub]) stats[cat].subcategories[sub] = { total: 0, revised: 0 };
        stats[cat].subcategories[sub].total += 1;
        if (m.is_revised) stats[cat].subcategories[sub].revised += 1;
      }
    }

    return res.json(successResponse({
      total_mistakes: totalMistakes,
      total_revised: revisedCount,
      unrevised: totalMistakes - revisedCount,
      by_category: stats,
    }));
  } catch (error) {
    next(error);
  }
}

module.exports = { getMistakes, markRevised, getMistakeStats };
