const { successResponse, errorResponse } = require('../utils/helpers');
const submissionService = require('../services/submissionService');

async function handleResult(req, res, next) {
  try {
    const userId = req.user.id;
    const { question_id, is_correct, quality } = req.body;

    if (is_correct === undefined || question_id === undefined) {
      return res.status(400).json(errorResponse('Missing required fields'));
    }

    const result = await submissionService.handleSubmissionResult(userId, question_id, is_correct, quality);

    return res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}

module.exports = { handleResult };
