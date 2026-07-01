const { Mistake, Question } = require('../models');
const { successResponse, errorResponse } = require('../utils/helpers');

async function getImprovementQueue(req, res, next) {
  try {
    const userId = req.user.id;
    
    const mistakes = await Mistake.findAll({
      where: { user_id: userId, status: 'pending' },
      include: [{ model: Question, as: 'question' }],
      order: [
        ['attempt_count', 'DESC'],
        ['first_failed_at', 'ASC']
      ],
      limit: 50
    });

    return res.json(successResponse({ mistakes }));
  } catch (error) {
    next(error);
  }
}

module.exports = { getImprovementQueue };
